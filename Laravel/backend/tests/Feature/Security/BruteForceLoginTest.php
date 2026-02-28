<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class BruteForceLoginTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        // Limpa o cache antes de cada teste para garantir rate limiter zerado
        Cache::flush();
    }

    protected function tearDown(): void
    {
        Cache::flush();
        parent::tearDown();
    }

    public function test_bloqueia_apos_multiplas_tentativas_invalidas(): void
    {
        User::factory()->create(['email' => 'victim@example.com']);

        // Realiza 5 tentativas com senha errada
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email'    => 'victim@example.com',
                'password' => 'senha_errada',
            ]);
        }

        // A 6ª tentativa deve retornar 429 Too Many Requests
        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'victim@example.com',
            'password' => 'senha_errada',
        ]);

        $response->assertStatus(429);
    }

    public function test_login_bem_sucedido_retorna_token(): void
    {
        User::factory()->create([
            'email'    => 'user2@example.com',
            'password' => 'senha_correta',
        ]);

        // Login correto deve funcionar
        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'user2@example.com',
            'password' => 'senha_correta',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['token', 'user']);
    }
}
