<?php

namespace Tests\Feature;

use App\DTOs\WebhookPayloadDTO;
use App\Enums\AcquirerType;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Jobs\ProcessWebhookJob;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class WebhookTest extends TestCase
{
    use DatabaseTransactions;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'balance' => 0,
        ]);

        config([
            'acquirers.pagpix.active'         => true,
            'acquirers.pagpix.webhook_secret' => 'test_webhook_secret_pagpix',
        ]);
    }

    public function test_rejects_webhook_with_invalid_signature(): void
    {
        $payload = json_encode(['id' => 'ext_001', 'status' => 'PAID']);

        $response = $this->postJson('/api/v1/webhooks/pagpix', json_decode($payload, true), [
            'X-PagPix-Signature' => 'assinatura_invalida_propositalmente',
        ]);

        $response->assertStatus(401);
    }

    public function test_accepts_webhook_with_valid_signature_and_dispatches_job(): void
    {
        Queue::fake();

        $payload = json_encode(['id' => 'ext_001', 'status' => 'PAID', 'amount' => 10000]);

        // PagPix usa X-PagPix-Signature
        $validSignature = hash_hmac('sha256', $payload, 'test_webhook_secret_pagpix');

        $response = $this->postJson(
            '/api/v1/webhooks/pagpix',
            json_decode($payload, true),
            ['X-PagPix-Signature' => $validSignature]
        );

        $response->assertStatus(200);

        Queue::assertPushed(ProcessWebhookJob::class);
    }

    public function test_webhook_updates_transaction_status_to_paid(): void
    {
        // Valores em centavos (10000 = R$100,00; 150 = R$1,50)
        $transaction = Transaction::factory()->create([
            'user_id'     => $this->user->id,
            'external_id' => 'ext_webhook_001',
            'amount'      => 10000, // centavos
            'tax'         => 150,   // centavos
            'status'      => TransactionStatus::PENDING,
            'type'        => TransactionType::DEPOSIT,
        ]);

        $payload = WebhookPayloadDTO::fromArray([
            'external_id' => 'ext_webhook_001',
            'status'      => TransactionStatus::PAID,
            'end2end'     => 'E2E001',
            'amount'      => 100.00, // em reais; fromArray() converte para centavos
            'paid_at'     => now()->toISOString(),
        ]);

        $job = new ProcessWebhookJob(AcquirerType::PAGPIX, $payload);
        $job->handle();

        $transaction->refresh();
        $this->assertEquals(TransactionStatus::PAID, $transaction->status);

        $this->user->refresh();
        // netAmount = 10000 - 150 = 9850 centavos (R$98,50)
        $this->assertEquals(9850, (int) $this->user->balance);
    }

    public function test_webhook_is_idempotent(): void
    {
        $transaction = Transaction::factory()->paid()->create([
            'user_id'     => $this->user->id,
            'external_id' => 'ext_webhook_002',
            'amount'      => 10000, // centavos
            'tax'         => 150,   // centavos
            'type'        => TransactionType::DEPOSIT,
        ]);

        $initialBalance = (int) $this->user->balance;

        $payload = WebhookPayloadDTO::fromArray([
            'external_id' => 'ext_webhook_002',
            'status'      => TransactionStatus::PAID,
            'end2end'     => 'E2E002',
            'amount'      => 100.00,
            'paid_at'     => now()->toISOString(),
        ]);

        $job = new ProcessWebhookJob(AcquirerType::PAGPIX, $payload);
        $job->handle();

        $this->user->refresh();
        $this->assertEquals($initialBalance, (int) $this->user->balance);
    }
}
