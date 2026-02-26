<?php

namespace App\Jobs;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendPushcutNotificationJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public int $tries   = 2;
    public int $timeout = 15;
    public array $backoff = [30, 120];

    public function __construct(
        private readonly string $transactionId,
    ) {
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        $transaction = Transaction::find($this->transactionId);

        if (! $transaction) {
            return;
        }

        $user = User::find($transaction->user_id);

        if (! $user || ! $user->pushcut_link) {
            return;
        }

        $pushcutUrl = $user->pushcut_link;

        if (! filter_var($pushcutUrl, FILTER_VALIDATE_URL)) {
            Log::warning('SendPushcutNotificationJob: URL Pushcut invalida', [
                'user_id'        => $user->id,
                'transaction_id' => $this->transactionId,
            ]);
            return;
        }

        $amount     = number_format((float) $transaction->amount, 2, ',', '.');
        $netAmount  = number_format($transaction->netAmount(), 2, ',', '.');
        $type       = $transaction->type->label();
        $status     = $transaction->status->label();

        $payload = [
            'title'    => "Transacao {$status}",
            'text'     => "{$type} de R$ {$amount} (liquido: R$ {$netAmount}) - ID: {$this->transactionId}",
            'input'    => $this->transactionId,
        ];

        try {
            Http::timeout(10)
                ->post($pushcutUrl, $payload);
        } catch (ConnectionException $e) {
            Log::warning('SendPushcutNotificationJob: falha de conexao', [
                'user_id'        => $user->id,
                'transaction_id' => $this->transactionId,
                'error'          => $e->getMessage(),
            ]);
            $this->release(60);
        } catch (\Throwable $e) {
            Log::error('SendPushcutNotificationJob: erro inesperado', [
                'transaction_id' => $this->transactionId,
                'error'          => $e->getMessage(),
            ]);
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SendPushcutNotificationJob falhou definitivamente', [
            'transaction_id' => $this->transactionId,
            'error'          => $exception->getMessage(),
        ]);
    }
}
