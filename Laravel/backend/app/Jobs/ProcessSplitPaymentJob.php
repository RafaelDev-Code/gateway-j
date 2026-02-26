<?php

namespace App\Jobs;

use App\Models\SplitTransaction;
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
        $transaction = Transaction::with('splits.targetUser')
            ->find($this->transactionId);

        if (! $transaction) {
            return;
        }

        $netAmount = $transaction->netAmount();

        DB::transaction(function () use ($transaction, $netAmount, $taxCalculator) {
            foreach ($transaction->splits as $split) {
                if ($split->processed) {
                    continue;
                }

                if (! $split->targetUser) {
                    Log::warning('Split: usuario destino nao encontrado', [
                        'split_id' => $split->id,
                    ]);
                    continue;
                }

                $splitAmount = $taxCalculator->calculateSplit($netAmount, $split->percentage);

                DB::table('users')
                    ->where('id', $split->target_user_id)
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
        Log::error('ProcessSplitPaymentJob falhou', [
            'transaction_id' => $this->transactionId,
            'error'          => $exception->getMessage(),
        ]);
    }
}
