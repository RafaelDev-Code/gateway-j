<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class MassAssignmentTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        // Garante que o rate limiter do registro não bloqueia testes
        Cache::flush();
    }

    public function test_registro_ignora_campos_admin_via_mass_assignment(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name'       => 'Hacker Silva',
            'email'      => 'hacker@example.com',
            'password'   => 'Password123!',
            'password_confirmation' => 'Password123!',
            'tipo'       => 'PF',
            'documento'  => '529.982.247-25', // CPF válido (dígitos verificadores corretos)
            // Tentativas de escalação via mass assignment
            'role'              => 'ADMIN',
            'balance'           => 9999999,
            'banned_at'         => null,
            'blocked_credentials' => false,
            'is_admin'          => true,
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'hacker@example.com')->first();
        $this->assertNotNull($user);

        // role deve ser USER, não ADMIN
        $this->assertEquals(\App\Enums\UserRole::USER, $user->role);

        // balance deve ser 0 (centavos), não 9999999
        $this->assertEquals(0, $user->balance);

        // Não deve ter acesso admin
        $this->assertFalse($user->isAdmin());
    }

    public function test_registro_nao_aceita_pin_via_payload(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name'       => 'Usuario',
            'email'      => 'test@example.com',
            'password'   => 'Password123!',
            'password_confirmation' => 'Password123!',
            'tipo'       => 'PF',
            'documento'  => '529.982.247-25', // CPF válido
            'pin'        => '1234', // tentativa de setar PIN via registro
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'test@example.com')->first();

        // PIN não deve ter sido setado via registro
        $this->assertFalse($user->hasPin());
    }

    public function test_update_profile_nao_altera_campos_criticos(): void
    {
        $user = User::factory()->create([
            'balance' => 0,
            'role'    => \App\Enums\UserRole::USER,
        ]);

        $response = $this->actingAs($user)->putJson('/api/v1/auth/me', [
            'name'    => 'Nome Atualizado',
            'balance' => 999999,
            'role'    => 'ADMIN',
            'banned_at' => null,
        ]);

        $response->assertStatus(200);

        $user->refresh();

        $this->assertEquals('Nome Atualizado', $user->name);
        $this->assertEquals(0, $user->balance, 'balance não deve ser alterado via updateProfile');
        $this->assertEquals(\App\Enums\UserRole::USER, $user->role, 'role não deve ser alterado via updateProfile');
    }
}
