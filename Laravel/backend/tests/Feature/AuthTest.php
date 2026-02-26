<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'email'    => 'merchant@example.com',
            'password' => Hash::make('senha_segura_123'),
        ]);
    }

    public function test_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'merchant@example.com',
            'password' => 'senha_segura_123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'username', 'name', 'email', 'role', 'balance', 'has_pin'],
            ]);

        $this->assertNotEmpty($response->json('token'));
    }

    public function test_login_with_invalid_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'merchant@example.com',
            'password' => 'senha_errada',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_login_with_unknown_email(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'ninguem@example.com',
            'password' => 'qualquer',
        ]);

        $response->assertStatus(422);
    }

    public function test_me_endpoint_returns_user_data(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $response = $this->getJson('/api/v1/auth/me', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['id', 'username', 'email', 'role', 'balance', 'has_pin'],
            ])
            ->assertJsonPath('data.email', 'merchant@example.com');
    }

    public function test_me_endpoint_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    public function test_logout_revokes_token(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $logoutResponse = $this->postJson('/api/v1/auth/logout', [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $logoutResponse->assertStatus(200);

        $meResponse = $this->getJson('/api/v1/auth/me', [
            'Authorization' => "Bearer {$token}",
        ]);

        $meResponse->assertStatus(401);
    }

    public function test_create_pin_for_first_time(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $response = $this->postJson('/api/v1/pin', [
            'pin'              => '1234',
            'pin_confirmation' => '1234',
        ], ['Authorization' => "Bearer {$token}"]);

        $response->assertStatus(201)
            ->assertJson(['message' => 'PIN cadastrado com sucesso.']);

        $this->user->refresh();
        $this->assertTrue($this->user->hasPin());
    }

    public function test_cannot_create_pin_twice(): void
    {
        $user  = User::factory()->withPin('1234')->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->postJson('/api/v1/pin', [
            'pin'              => '5678',
            'pin_confirmation' => '5678',
        ], ['Authorization' => "Bearer {$token}"]);

        $response->assertStatus(422)
            ->assertJson(['error' => 'PIN_ALREADY_SET']);
    }

    public function test_update_pin_with_correct_current_pin(): void
    {
        $user  = User::factory()->withPin('1234')->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->putJson('/api/v1/pin', [
            'current_pin'      => '1234',
            'pin'              => '5678',
            'pin_confirmation' => '5678',
        ], ['Authorization' => "Bearer {$token}"]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'PIN alterado com sucesso.']);
    }

    public function test_update_pin_with_wrong_current_pin(): void
    {
        $user  = User::factory()->withPin('1234')->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->putJson('/api/v1/pin', [
            'current_pin'      => '9999',
            'pin'              => '5678',
            'pin_confirmation' => '5678',
        ], ['Authorization' => "Bearer {$token}"]);

        $response->assertStatus(422)
            ->assertJson(['error' => 'INVALID_PIN']);
    }

    public function test_integration_keys_self_service(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $createResponse = $this->postJson('/api/v1/keys', [
            'name'        => 'Minha Integracao',
            'description' => 'Chave para sistema de vendas',
        ], ['Authorization' => "Bearer {$token}"]);

        $createResponse->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'client_id', 'client_secret', 'name', 'active'],
            ]);

        $clientSecret = $createResponse->json('data.client_secret');
        $this->assertNotEmpty($clientSecret);

        $listResponse = $this->getJson('/api/v1/keys', [
            'Authorization' => "Bearer {$token}",
        ]);

        $listResponse->assertStatus(200);
        $this->assertCount(1, $listResponse->json('data'));

        $keyId = $createResponse->json('data.id');
        $deleteResponse = $this->deleteJson("/api/v1/keys/{$keyId}", [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $deleteResponse->assertStatus(200);

        $this->assertDatabaseMissing('integration_keys', ['id' => $keyId]);
    }
}
