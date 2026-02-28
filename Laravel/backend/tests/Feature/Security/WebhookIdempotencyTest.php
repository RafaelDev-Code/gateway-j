<?php

namespace Tests\Feature\Security;

use App\DTOs\WebhookPayloadDTO;
use App\Enums\AcquirerType;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Jobs\ProcessWebhookJob;
use App\Models\Transaction;
use App\Models\User;
use App\Models\WebhookEvent;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class WebhookIdempotencyTest extends TestCase
{
    use DatabaseTransactions;

    public function test_webhook_credita_saldo_apenas_uma_vez(): void
    {
        $user = User::factory()->create(['balance' => 0]);

        $transaction = (new Transaction())->forceFill([
            'id'          => 'e' . str_repeat('a', 32),
            'external_id' => 'ext_abc123',
            'user_id'     => $user->id,
            'amount'      => 10000, // R$100,00 em centavos
            'tax'         => 200,   // R$2,00
            'status'      => TransactionStatus::PENDING,
            'type'        => TransactionType::DEPOSIT,
            'nome'        => 'Pagador Teste',
            'descricao'   => 'Teste',
        ]);
        $transaction->save();

        $payload = new WebhookPayloadDTO(
            externalId:  'ext_abc123',
            status:      TransactionStatus::PAID,
            amountCents: 10000,
            eventId:     'evt_abc123',
        );

        // Primeiro processamento — deve creditar
        (new ProcessWebhookJob(AcquirerType::PAGPIX, $payload))->handle();

        $user->refresh();
        $this->assertEquals(9800, $user->balance); // amount - tax = 10000 - 200

        // Segundo processamento (replay) — NÃO deve creditar novamente
        (new ProcessWebhookJob(AcquirerType::PAGPIX, $payload))->handle();

        $user->refresh();
        $this->assertEquals(9800, $user->balance, 'Saldo não deve ser creditado duas vezes');

        // Apenas um WebhookEvent deve existir
        $this->assertEquals(1, WebhookEvent::where('provider_event_id', 'evt_abc123')->count());

        // Transação deve estar em status terminal
        $transaction->refresh();
        $this->assertEquals(TransactionStatus::PAID, $transaction->status);
    }

    public function test_webhook_com_valor_divergente_e_abortado(): void
    {
        $user = User::factory()->create(['balance' => 0]);

        (new Transaction())->forceFill([
            'id'          => 'e' . str_repeat('b', 32),
            'external_id' => 'ext_diverge',
            'user_id'     => $user->id,
            'amount'      => 10000, // R$100,00
            'tax'         => 0,
            'status'      => TransactionStatus::PENDING,
            'type'        => TransactionType::DEPOSIT,
            'nome'        => 'Pagador',
            'descricao'   => '',
        ])->save();

        // Webhook envia R$50,00 mas transação espera R$100,00
        $payload = new WebhookPayloadDTO(
            externalId:  'ext_diverge',
            status:      TransactionStatus::PAID,
            amountCents: 5000,
            eventId:     'evt_diverge',
        );

        (new ProcessWebhookJob(AcquirerType::PAGPIX, $payload))->handle();

        $user->refresh();
        $this->assertEquals(0, $user->balance, 'Saldo não deve ser creditado com valor divergente');

        // Status não deve ter mudado para PAID
        $tx = Transaction::where('external_id', 'ext_diverge')->first();
        $this->assertEquals(TransactionStatus::PENDING, $tx->status);
    }

    public function test_webhook_transacao_ja_paga_e_ignorada(): void
    {
        $user = User::factory()->create(['balance' => 10000]);

        (new Transaction())->forceFill([
            'id'           => 'e' . str_repeat('c', 32),
            'external_id'  => 'ext_terminal',
            'user_id'      => $user->id,
            'amount'       => 5000,
            'tax'          => 0,
            'status'       => TransactionStatus::PAID, // já está paga
            'type'         => TransactionType::DEPOSIT,
            'nome'         => 'Pagador',
            'descricao'    => '',
            'confirmed_at' => now(),
        ])->save();

        $payload = new WebhookPayloadDTO(
            externalId:  'ext_terminal',
            status:      TransactionStatus::PAID,
            amountCents: 5000,
            eventId:     'evt_terminal',
        );

        (new ProcessWebhookJob(AcquirerType::PAGPIX, $payload))->handle();

        $user->refresh();
        $this->assertEquals(10000, $user->balance, 'Saldo não deve mudar para transação já terminal');
    }

    public function test_reversal_nao_deixa_saldo_negativo(): void
    {
        $user = User::factory()->create(['balance' => 0]); // saldo zerado

        // Transação que foi paga
        (new Transaction())->forceFill([
            'id'           => 'e' . str_repeat('d', 32),
            'external_id'  => 'ext_reversal',
            'user_id'      => $user->id,
            'amount'       => 5000,
            'tax'          => 0,
            'status'       => TransactionStatus::PAID,
            'type'         => TransactionType::DEPOSIT,
            'nome'         => 'Pagador',
            'descricao'    => '',
            'confirmed_at' => now(),
        ])->save();

        $payload = new WebhookPayloadDTO(
            externalId:  'ext_reversal',
            status:      TransactionStatus::REVERSED,
            amountCents: 5000,
            eventId:     'evt_reversal',
        );

        // Deve lançar RuntimeException pois saldo é 0 e não pode decrementar
        try {
            (new ProcessWebhookJob(AcquirerType::PAGPIX, $payload))->handle();
            $this->fail('Esperava RuntimeException para reversal com saldo insuficiente');
        } catch (\RuntimeException $e) {
            $this->assertStringContainsString('Saldo insuficiente', $e->getMessage());
        }

        // Saldo nunca deve ficar negativo
        $user->refresh();
        $this->assertGreaterThanOrEqual(0, $user->balance, 'Saldo nunca deve ficar negativo');
    }
}
