<?php

namespace App\Jobs;

use App\DTOs\WebhookPayloadDTO;
use App\Enums\AcquirerType;
use App\Enums\TransactionStatus;
use App\Models\AuditLog;
use App\Models\Transaction;
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
    public array $backoff = [5, 30, 60]; // Segundos entre tentativas

    public function __construct(
        private readonly AcquirerType     $acquirerType,
        private readonly WebhookPayloadDTO $payload,
    ) {
        $this->onQueue('webhooks');
    }

    public function handle(): void
    {
        $transaction = Transaction::where('external_id', $this->payload->externalId)
            ->lockForUpdate()
            ->first();

        if (! $transaction) {
            Log::warning('Webhook: transacao nao encontrada', [
                'acquirer'    => $this->acquirerType->value,
                'external_id' => $this->payload->externalId,
            ]);
            return;
        }

        // Idempotencia: ignora se ja processada
        if ($transaction->status->isTerminal()) {
            return;
        }

        DB::transaction(function () use ($transaction) {
            $previousStatus = $transaction->status;
            $newStatus      = $this->payload->status;

            $transaction->update([
                'status'       => $newStatus,
                'end2end'      => $this->payload->end2end ?? $transaction->end2end,
                'confirmed_at' => $newStatus === TransactionStatus::PAID ? now() : null,
            ]);

            // Credita saldo se PAID (apenas para depositos)
            if ($newStatus === TransactionStatus::PAID && $transaction->type->value === 'DEPOSIT') {
                $netAmount = $transaction->netAmount();
                DB::table('users')
                    ->where('id', $transaction->user_id)
                    ->increment('balance', $netAmount);

                // Processa splits em outro job para nao bloquear esta transacao
                if ($transaction->splits()->exists()) {
                    ProcessSplitPaymentJob::dispatch($transaction->id)
                        ->onQueue('payments');
                }
            }

            // Estorno: debita saldo
            if ($newStatus === TransactionStatus::REVERSED && $previousStatus === TransactionStatus::PAID) {
                $netAmount = $transaction->netAmount();
                DB::table('users')
                    ->where('id', $transaction->user_id)
                    ->decrement('balance', $netAmount);
            }

            AuditLog::record(
                action:    "webhook.{$this->acquirerType->configKey()}.{$newStatus->value}",
                context:   ['transaction_id' => $transaction->id],
                modelType: 'Transaction',
                modelId:   $transaction->id,
            );
        });

        // Dispara postback FORA da transacao de banco
        if ($transaction->postback_url) {
            SendPostbackJob::dispatch($transaction->id)
                ->onQueue('postbacks');
        }

        // Notificacao Pushcut ao merchant quando confirmado
        if ($this->payload->status === TransactionStatus::PAID) {
            SendPushcutNotificationJob::dispatch($transaction->id)
                ->onQueue('notifications');
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessWebhookJob falhou', [
            'acquirer'    => $this->acquirerType->value,
            'external_id' => $this->payload->externalId,
            'error'       => $exception->getMessage(),
        ]);
    }
}
