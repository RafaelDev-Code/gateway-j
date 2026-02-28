<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * Testa: HIGH-11 — Idempotency Key para saques
 */
class IdempotencyKeyTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_cashout_sem_idempotency_key_retorna_422(): void
    {
        $user = User::factory()->create(['cash_out_active' => true, 'balance' => 100000]);

        $response = $this->actingAs($user)->postJson('/api/v1/pix/cashout', [
            'nome'    => 'Destinatário',
            'cpf'     => '52998224725',
            'key'     => 'test@pix.com',
            'valor'   => 10.00,
            'pin'     => '1234',
        ]);

        $response->assertStatus(422);
        $response->assertJson(['error' => 'IDEMPOTENCY_KEY_REQUIRED']);
    }

    public function test_cashout_idempotency_key_muito_longa_retorna_422(): void
    {
        $user = User::factory()->create(['cash_out_active' => true]);

        $response = $this->actingAs($user)->withHeaders([
            'Idempotency-Key' => str_repeat('a', 129),
        ])->postJson('/api/v1/pix/cashout', [
            'nome'    => 'Destinatário',
            'cpf'     => '52998224725',
            'key'     => 'test@pix.com',
            'valor'   => 10.00,
            'pin'     => '1234',
        ]);

        $response->assertStatus(422);
        $response->assertJson(['error' => 'IDEMPOTENCY_KEY_TOO_LONG']);
    }
}
