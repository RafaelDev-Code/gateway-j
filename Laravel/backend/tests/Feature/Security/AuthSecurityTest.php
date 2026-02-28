<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Testa: HIGH-5, HIGH-6, HIGH-7
 */
class AuthSecurityTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    // -----------------------------------------------------------------
    // HIGH-5: email change requires current_password
    // -----------------------------------------------------------------

    public function test_atualizar_email_sem_current_password_retorna_422(): void
    {
        $user = User::factory()->create(['email' => 'original@test.com']);

        $response = $this->actingAs($user)->putJson('/api/v1/auth/me', [
            'email' => 'novo@test.com',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrorFor('current_password');
    }

    public function test_atualizar_email_com_senha_errada_retorna_422(): void
    {
        $user = User::factory()->create([
            'email'    => 'original@test.com',
            'password' => Hash::make('senha-correta'),
        ]);

        $response = $this->actingAs($user)->putJson('/api/v1/auth/me', [
            'email'            => 'novo@test.com',
            'current_password' => 'senha-errada',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrorFor('current_password');
    }

    public function test_atualizar_email_com_senha_correta_funciona(): void
    {
        $user = User::factory()->create([
            'email'    => 'original@test.com',
            'password' => Hash::make('senha-correta'),
        ]);

        $response = $this->actingAs($user)->putJson('/api/v1/auth/me', [
            'email'            => 'novo@test.com',
            'current_password' => 'senha-correta',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('novo@test.com', $user->fresh()->email);
    }

    public function test_atualizar_nome_sem_current_password_funciona(): void
    {
        $user = User::factory()->create(['name' => 'Nome Antigo']);

        $response = $this->actingAs($user)->putJson('/api/v1/auth/me', [
            'name' => 'Nome Novo',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('Nome Novo', $user->fresh()->name);
    }

    // -----------------------------------------------------------------
    // HIGH-6: password change revokes all tokens
    // -----------------------------------------------------------------

    public function test_troca_de_senha_revoga_token_antigo(): void
    {
        $user = User::factory()->create(['password' => Hash::make('senha123!')]);

        // Cria token antigo
        $oldToken = $user->createToken('dashboard')->plainTextToken;

        $response = $this->withToken($oldToken)->putJson('/api/v1/auth/password', [
            'current_password'      => 'senha123!',
            'password'              => 'novaSenha456!',
            'password_confirmation' => 'novaSenha456!',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['message', 'token']);

        // Verifica que todos os tokens foram revogados no banco
        $user->refresh();
        $this->assertEquals(1, $user->tokens()->count(), 'Deve existir apenas o novo token');

        // Verifica que o token antigo não está mais na tabela
        $hasOldToken = $user->tokens()
            ->where('id', \Laravel\Sanctum\PersonalAccessToken::findToken($oldToken)?->id ?? 0)
            ->exists();
        $this->assertFalse($hasOldToken, 'Token antigo deve ter sido revogado');
    }

    public function test_troca_de_senha_retorna_novo_token(): void
    {
        $user = User::factory()->create(['password' => Hash::make('senha123!')]);
        $oldToken = $user->createToken('dashboard')->plainTextToken;

        $response = $this->withToken($oldToken)->putJson('/api/v1/auth/password', [
            'current_password'      => 'senha123!',
            'password'              => 'novaSenha456!',
            'password_confirmation' => 'novaSenha456!',
        ]);

        $response->assertStatus(200);
        $newToken = $response->json('token');
        $this->assertNotEmpty($newToken);
        $this->assertNotEquals($oldToken, $newToken);

        // Novo token deve funcionar
        $authCheck = $this->withToken($newToken)->getJson('/api/v1/auth/me');
        $authCheck->assertStatus(200);
    }

    // -----------------------------------------------------------------
    // HIGH-7: login revokes previous sessions
    // -----------------------------------------------------------------

    public function test_novo_login_invalida_token_anterior(): void
    {
        $user = User::factory()->create(['password' => Hash::make('senha123!')]);

        // Primeiro login
        $response1 = $this->postJson('/api/v1/auth/login', [
            'email'    => $user->email,
            'password' => 'senha123!',
        ]);
        $response1->assertStatus(200);
        $token1 = $response1->json('token');

        // Segundo login (mesmo usuário) — deve revogar o anterior
        $response2 = $this->postJson('/api/v1/auth/login', [
            'email'    => $user->email,
            'password' => 'senha123!',
        ]);
        $response2->assertStatus(200);

        // Verifica que apenas 1 token existe no banco (o novo)
        $user->refresh();
        $this->assertEquals(1, $user->tokens()->count(), 'Deve existir apenas 1 token após o segundo login');

        // Token1 não deve mais existir na tabela
        $oldTokenRecord = \Laravel\Sanctum\PersonalAccessToken::findToken($token1);
        $this->assertNull($oldTokenRecord, 'Token antigo deve ter sido removido do banco');
    }
}
