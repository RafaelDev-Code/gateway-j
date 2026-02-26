<?php

namespace App\Jobs;

use App\Models\Transaction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendPostbackJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public int $tries   = 5;
    public int $timeout = 30;
    public array $backoff = [10, 30, 60, 120, 300]; // Retry exponencial

    public function __construct(
        private readonly string $transactionId,
    ) {
        $this->onQueue('postbacks');
    }

    public function handle(): void
    {
        $transaction = Transaction::find($this->transactionId);

        if (! $transaction || ! $transaction->postback_url) {
            return;
        }

        $url = $transaction->postback_url; // Acessor decripta automaticamente

        if (empty($url)) {
            return;
        }

        $payload = [
            'id'           => $transaction->id,
            'status'       => $transaction->status->value,
            'type'         => $transaction->type->value,
            'amount'       => number_format((float) $transaction->amount, 2, '.', ''),
            'tax'          => number_format((float) $transaction->tax, 2, '.', ''),
            'net_amount'   => number_format($transaction->netAmount(), 2, '.', ''),
            'confirmed_at' => $transaction->confirmed_at?->toIso8601String(),
        ];

        Http::timeout(config('gateway.postback.timeout', 10))
            ->retry(1)
            ->post($url, $payload);

        $transaction->update(['postback_status' => 'SENT']);
    }

    public function failed(\Throwable $exception): void
    {
        // Marca como falho sem logar dados da URL (pode conter dados do merchant)
        Transaction::where('id', $this->transactionId)
            ->update(['postback_status' => 'FAILED']);

        Log::warning('SendPostbackJob falhou', [
            'transaction_id' => $this->transactionId,
        ]);
    }
}
