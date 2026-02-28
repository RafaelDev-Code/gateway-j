<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Testa: HIGH-8 — rate limiting em rotas sensíveis
 */
class RateLimitingTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_pin_endpoint_limita_apos_5_tentativas(): void
    {
        $user = User::factory()->create();

        $responses = [];
        for ($i = 1; $i <= 6; $i++) {
            $responses[] = $this->actingAs($user)->postJson('/api/v1/pin', [
                'pin'              => '1234',
                'pin_confirmation' => '1234',
            ]);
        }

        // As 5 primeiras podem ser 201 ou 422 (PIN já existe), mas não 429
        for ($i = 0; $i < 5; $i++) {
            $this->assertNotEquals(429, $responses[$i]->getStatusCode(),
                "Requisição #{$i} não deveria ser 429");
        }

        // A 6ª deve retornar 429
        $responses[5]->assertStatus(429);
    }
}
