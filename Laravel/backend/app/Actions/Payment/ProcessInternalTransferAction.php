<?php

namespace App\Actions\Payment;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Exceptions\InsufficientBalanceException;
use App\Exceptions\InvalidPinException;
use App\Models\AuditLog;
use App\Models\Transaction;
use App\Models\User;
use App\Services\TaxCalculator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProcessInternalTransferAction
{
    public function __construct(
        private readonly TaxCalculator $taxCalculator,
    ) {}

    public function execute(User $sender, string $targetUsername, int $amountCents, string $pin): array
    {
        // Valida PIN
        if (! $sender->hasPin() || ! $sender->verifyPin($pin)) {
            AuditLog::record('transfer.invalid_pin', ['sender_id' => $sender->id]);
            throw new InvalidPinException();
        }

        // Busca destinatario
        $recipient = User::where('username', $targetUsername)->first();

        if (! $recipient) {
            throw new \RuntimeException('Usuario de destino nao encontrado.');
        }

        if ($recipient->id === $sender->id) {
            throw new \RuntimeException('Nao e possivel transferir para si mesmo.');
        }

        $taxCents   = $this->taxCalculator->calculateCashOut($sender, $amountCents);
        $totalCents = $amountCents + $taxCents;

        // Transacao atomica: debita origem, credita destino, cria registros
        $result = DB::transaction(function () use ($sender, $recipient, $amountCents, $taxCents, $totalCents) {
            // Lock ambos os usuarios para evitar race conditions
            $lockedSender    = User::lockForUpdate()->find($sender->id);
            $lockedRecipient = User::lockForUpdate()->find($recipient->id);

            if ($lockedSender->balance < $totalCents) {
                throw new InsufficientBalanceException();
            }

            $lockedSender->decrement('balance', $totalCents);
            $lockedRecipient->increment('balance', $amountCents); // Destinatario recebe valor cheio (sem taxa)

            $txIdOut = config('gateway.transaction_prefix', 'e') . Str::random(32);
            $txIdIn  = config('gateway.transaction_prefix', 'e') . Str::random(32);

            // Registro do sender (saida) — forceFill pois campos críticos estão em $guarded
            $senderTx = (new Transaction())->forceFill([
                'id'          => $txIdOut,
                'external_id' => $txIdIn,
                'user_id'     => $lockedSender->id,
                'amount'      => $amountCents,
                'tax'         => $taxCents,
                'status'      => TransactionStatus::PAID,
                'type'        => TransactionType::INTERNAL_TRANSFER,
                'nome'        => $lockedRecipient->name,
                'descricao'   => "Transferencia para {$lockedRecipient->username}",
                'is_internal' => true,
                'confirmed_at' => now(),
            ]);
            $senderTx->save();

            // Registro do recipient (entrada)
            $recipientTx = (new Transaction())->forceFill([
                'id'          => $txIdIn,
                'external_id' => $txIdOut,
                'user_id'     => $lockedRecipient->id,
                'amount'      => $amountCents,
                'tax'         => 0,
                'status'      => TransactionStatus::PAID,
                'type'        => TransactionType::DEPOSIT,
                'nome'        => $lockedSender->name,
                'descricao'   => "Transferencia de {$lockedSender->username}",
                'is_internal' => true,
                'confirmed_at' => now(),
            ]);
            $recipientTx->save();

            return [$senderTx, $recipientTx];
        });

        return $result;
    }
}
