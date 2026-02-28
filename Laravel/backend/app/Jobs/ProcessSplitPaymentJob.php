<?php

namespace App\Jobs;

use App\Enums\TransactionStatus;
use App\Models\Transaction;
use App\Services\TaxCalculator;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessSplitPaymentJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public int $tries   = 5;
    public int $timeout = 60;
    public array $backoff = [10, 30, 60, 120, 300];

    public function __construct(
        private readonly string $transactionId,
    ) {
        $this->onQueue('payments');
    }

    public function handle(TaxCalculator $taxCalculator): void
    {
        DB::transaction(function () use ($taxCalculator) {
            // Bloqueia a transação para evitar processamento duplo concorrente
            $transaction = Transaction::with('splits.targetUser')
                ->where('id', $this->transactionId)
                ->lockForUpdate()
                ->first();

            if (! $transaction) {
                return;
            }

            // Só processa splits se a transação estiver confirmada como PAID
            if ($transaction->status !== TransactionStatus::PAID) {
                Log::warning('ProcessSplitPaymentJob: transacao nao esta PAID, abortando splits', [
                    'transaction_id' => $this->transactionId,
                    'status'         => $transaction->status->value,
                ]);
                return;
            }

            $netAmount = $transaction->netAmount();

            foreach ($transaction->splits as $split) {
                // Idempotência dentro da transação: pula splits já processados
                if ($split->processed) {
                    continue;
                }

                if (! $split->targetUser) {
                    Log::warning('ProcessSplitPaymentJob: usuario destino nao encontrado', [
                        'split_id'       => $split->id,
                        'transaction_id' => $this->transactionId,
                    ]);
                    continue;
                }

                $splitAmount = $taxCalculator->calculateSplit($netAmount, $split->percentage);

                // Bloqueia a row do usuário destino antes de creditar
                // Previne race condition com outros créditos/débitos simultâneos
                DB::table('users')
                    ->where('id', $split->target_user_id)
                    ->lockForUpdate()
                    ->increment('balance', $splitAmount);

                $split->update([
                    'amount'       => $splitAmount,
                    'processed'    => true,
                    'processed_at' => now(),
                ]);
            }
        });
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessSplitPaymentJob falhou definitivamente', [
            'transaction_id' => $this->transactionId,
            'error'          => $exception->getMessage(),
        ]);
    }
}
