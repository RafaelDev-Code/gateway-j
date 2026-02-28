<?php

namespace App\Jobs;

use App\DTOs\WebhookPayloadDTO;
use App\Enums\AcquirerType;
use App\Enums\TransactionStatus;
use App\Models\AuditLog;
use App\Models\Transaction;
use App\Models\WebhookEvent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessWebhookJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 60;
    public array $backoff = [5, 30, 60];

    public function __construct(
        private readonly AcquirerType      $acquirerType,
        private readonly WebhookPayloadDTO $payload,
    ) {
        $this->onQueue('webhooks');
    }

    public function handle(): void
    {
        DB::transaction(function () {
            // ----------------------------------------------------------------
            // 1. DEDUPLICAÇÃO ATÔMICA via INSERT ... ON CONFLICT DO NOTHING
            //    Usar insertOrIgnore() que usa ON CONFLICT DO NOTHING no PostgreSQL.
            //    Isso é transação-safe: não aborta a transação em caso de conflito.
            //    insertOrIgnore() retorna 0 se o registro já existe, 1 se inserido.
            // ----------------------------------------------------------------
            $eventId = $this->payload->eventId ?? $this->payload->externalId;

            $inserted = DB::table('webhook_events')->insertOrIgnore([
                'provider'          => $this->acquirerType->value,
                'provider_event_id' => $eventId,
                'transaction_id'    => null,
                'status'            => 'received',
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);

            if ($inserted === 0) {
                Log::info('Webhook já processado (dedup atômica), ignorando.', [
                    'acquirer'          => $this->acquirerType->value,
                    'provider_event_id' => $eventId,
                ]);
                return;
            }

            // ----------------------------------------------------------------
            // 2. Busca e bloqueia a transação DENTRO da transação de banco
            //    lockForUpdate() só tem efeito dentro de DB::transaction()
            // ----------------------------------------------------------------
            $transaction = Transaction::where('external_id', $this->payload->externalId)
                ->lockForUpdate()
                ->first();

            if (! $transaction) {
                Log::warning('Webhook: transacao nao encontrada', [
                    'acquirer'    => $this->acquirerType->value,
                    'external_id' => $this->payload->externalId,
                ]);
                // Atualiza o WebhookEvent para refletir falha de lookup
                WebhookEvent::where('provider', $this->acquirerType->value)
                    ->where('provider_event_id', $eventId)
                    ->update(['status' => 'not_found']);
                return;
            }

            // ----------------------------------------------------------------
            // 3. Idempotência e validação de transição de status
            // ----------------------------------------------------------------
            $newStatus = $this->payload->status;

            // Já está no status desejado — nada a fazer
            if ($transaction->status === $newStatus) {
                WebhookEvent::where('provider', $this->acquirerType->value)
                    ->where('provider_event_id', $eventId)
                    ->update(['status' => 'skipped_idempotent', 'transaction_id' => $transaction->id]);
                return;
            }

            // REVERSED é uma transição especial: só válida a partir de PAID
            if ($newStatus === TransactionStatus::REVERSED) {
                if ($transaction->status !== TransactionStatus::PAID) {
                    Log::warning('Webhook: tentativa de reversal de transacao nao PAID', [
                        'acquirer'       => $this->acquirerType->value,
                        'transaction_id' => $transaction->id,
                        'current_status' => $transaction->status->value,
                    ]);
                    WebhookEvent::where('provider', $this->acquirerType->value)
                        ->where('provider_event_id', $eventId)
                        ->update(['status' => 'skipped_invalid_reversal', 'transaction_id' => $transaction->id]);
                    return;
                }
            } elseif ($transaction->status->isTerminal()) {
                // Qualquer outra transição a partir de status terminal é ignorada
                WebhookEvent::where('provider', $this->acquirerType->value)
                    ->where('provider_event_id', $eventId)
                    ->update(['status' => 'skipped_terminal', 'transaction_id' => $transaction->id]);
                return;
            }

            // ----------------------------------------------------------------
            // 4. Validação de valor: payload deve bater com o esperado (±1 centavo)
            //    Previne crédito de valor diferente do cobrado
            // ----------------------------------------------------------------
            if ($newStatus === TransactionStatus::PAID) {
                // Ambos já em centavos: DTO converte na criação, transaction.amount é bigint
                $payloadAmountCents  = $this->payload->amountCents;
                $expectedAmountCents = (int) $transaction->amount;

                if (abs($payloadAmountCents - $expectedAmountCents) > 1) {
                    Log::critical('Webhook: divergencia de valor — operacao abortada', [
                        'acquirer'        => $this->acquirerType->value,
                        'external_id'     => $this->payload->externalId,
                        'payload_cents'   => $payloadAmountCents,
                        'expected_cents'  => $expectedAmountCents,
                    ]);
                    WebhookEvent::where('provider', $this->acquirerType->value)
                        ->where('provider_event_id', $eventId)
                        ->update(['status' => 'amount_mismatch', 'transaction_id' => $transaction->id]);
                    return;
                }
            }

            // ----------------------------------------------------------------
            // 5. Atualiza status da transação (previousStatus usado no reversal)
            // ----------------------------------------------------------------
            $previousStatus = $transaction->status;

            // forceFill necessário pois status está em $guarded no modelo Transaction
            $transaction->forceFill([
                'status'       => $newStatus,
                'end2end'      => $this->payload->end2end ?? $transaction->end2end,
                'confirmed_at' => $newStatus === TransactionStatus::PAID ? now() : null,
            ])->save();

            // ----------------------------------------------------------------
            // 6. Crédito de saldo para depósitos confirmados (PAID)
            // ----------------------------------------------------------------
            if ($newStatus === TransactionStatus::PAID && $transaction->type->value === 'DEPOSIT') {
                // netAmount() já retorna centavos (int) após Fix 4
                $netAmountCents = $transaction->netAmount();

                DB::table('users')
                    ->where('id', $transaction->user_id)
                    ->increment('balance', $netAmountCents);

                // Splits são processados em job separado (não bloqueia esta transação)
                if ($transaction->splits()->exists()) {
                    ProcessSplitPaymentJob::dispatch($transaction->id)
                        ->onQueue('payments');
                }
            }

            // ----------------------------------------------------------------
            // 7. Estorno: debita saldo — garante que saldo não fica negativo
            // ----------------------------------------------------------------
            if ($newStatus === TransactionStatus::REVERSED && $previousStatus === TransactionStatus::PAID) {
                // netAmount() já retorna centavos (int) após Fix 4
                $netAmountCents = $transaction->netAmount();

                $affected = DB::table('users')
                    ->where('id', $transaction->user_id)
                    ->where('balance', '>=', $netAmountCents)
                    ->decrement('balance', $netAmountCents);

                if ($affected === 0) {
                    Log::critical('Webhook: saldo insuficiente para estorno — requer intervencao manual', [
                        'acquirer'       => $this->acquirerType->value,
                        'transaction_id' => $transaction->id,
                        'net_cents'      => $netAmountCents,
                    ]);
                    // Lança exceção para que o Job seja reprocessado / alertado
                    throw new \RuntimeException(
                        "Saldo insuficiente para estorno da transacao {$transaction->id}"
                    );
                }
            }

            // ----------------------------------------------------------------
            // 8. Vincula o WebhookEvent à transação processada
            // ----------------------------------------------------------------
            WebhookEvent::where('provider', $this->acquirerType->value)
                ->where('provider_event_id', $eventId)
                ->update(['status' => 'processed', 'transaction_id' => $transaction->id]);

            AuditLog::record(
                action:    "webhook.{$this->acquirerType->value}.{$newStatus->value}",
                context:   ['transaction_id' => $transaction->id],
                modelType: 'Transaction',
                modelId:   $transaction->id,
            );
        });

        // Notificações FORA da transaction (falha não deve reverter o crédito)
        $transaction = Transaction::where('external_id', $this->payload->externalId)->first();

        if ($transaction?->postback_url) {
            SendPostbackJob::dispatch($transaction->id)->onQueue('postbacks');
        }

        if ($this->payload->status === TransactionStatus::PAID) {
            SendPushcutNotificationJob::dispatch($transaction?->id ?? '')->onQueue('notifications');
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessWebhookJob falhou definitivamente', [
            'acquirer'    => $this->acquirerType->value,
            'external_id' => $this->payload->externalId,
            'error'       => $exception->getMessage(),
        ]);
    }
}
