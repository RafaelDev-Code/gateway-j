<?php

namespace Tests\Feature;

use App\Enums\AcquirerType;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Jobs\ProcessWebhookJob;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class WebhookTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'balance' => 0,
        ]);

        config([
            'acquirers.pagpix.webhook_secret' => 'test_webhook_secret_pagpix',
        ]);
    }

    public function test_rejects_webhook_with_invalid_signature(): void
    {
        $payload = json_encode(['id' => 'ext_001', 'status' => 'PAID']);

        $response = $this->postJson('/api/v1/webhooks/pagpix', json_decode($payload, true), [
            'X-Signature' => 'invalid_signature',
        ]);

        $response->assertStatus(401);
    }

    public function test_accepts_webhook_with_valid_signature_and_dispatches_job(): void
    {
        Queue::fake();

        $payload = json_encode(['id' => 'ext_001', 'status' => 'PAID', 'amount' => 100]);

        $validSignature = hash_hmac('sha256', $payload, 'test_webhook_secret_pagpix');

        $response = $this->postJson(
            '/api/v1/webhooks/pagpix',
            json_decode($payload, true),
            ['X-Signature' => $validSignature]
        );

        $response->assertStatus(200);

        Queue::assertPushed(ProcessWebhookJob::class);
    }

    public function test_webhook_updates_transaction_status_to_paid(): void
    {
        $transaction = Transaction::factory()->create([
            'user_id'     => $this->user->id,
            'external_id' => 'ext_webhook_001',
            'amount'      => 100.00,
            'tax'         => 1.50,
            'status'      => TransactionStatus::PENDING,
            'type'        => TransactionType::DEPOSIT,
        ]);

        $payload = \App\DTOs\WebhookPayloadDTO::fromArray([
            'external_id' => 'ext_webhook_001',
            'status'      => TransactionStatus::PAID,
            'end2end'     => 'E2E001',
            'amount'      => 100.00,
            'paid_at'     => now()->toISOString(),
        ]);

        $job = new \App\Jobs\ProcessWebhookJob(AcquirerType::PAGPIX, $payload);
        $job->handle();

        $transaction->refresh();
        $this->assertEquals(TransactionStatus::PAID, $transaction->status);

        $this->user->refresh();
        $this->assertEquals(98.50, (float) $this->user->balance);
    }

    public function test_webhook_is_idempotent(): void
    {
        $transaction = Transaction::factory()->paid()->create([
            'user_id'     => $this->user->id,
            'external_id' => 'ext_webhook_002',
            'amount'      => 100.00,
            'tax'         => 1.50,
            'type'        => TransactionType::DEPOSIT,
        ]);

        $initialBalance = (float) $this->user->balance;

        $payload = \App\DTOs\WebhookPayloadDTO::fromArray([
            'external_id' => 'ext_webhook_002',
            'status'      => TransactionStatus::PAID,
            'end2end'     => 'E2E002',
            'amount'      => 100.00,
            'paid_at'     => now()->toISOString(),
        ]);

        $job = new \App\Jobs\ProcessWebhookJob(AcquirerType::PAGPIX, $payload);
        $job->handle();

        $this->user->refresh();
        $this->assertEquals($initialBalance, (float) $this->user->balance);
    }
}
