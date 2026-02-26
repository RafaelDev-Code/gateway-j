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

    public function execute(User $sender, string $targetUsername, float $amount, string $pin): array
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

        $tax   = $this->taxCalculator->calculateCashOut($sender, $amount);
        $total = $amount + $tax;

        // Transacao atomica: debita origem, credita destino, cria registros
        $result = DB::transaction(function () use ($sender, $recipient, $amount, $tax, $total) {
            // Lock ambos os usuarios para evitar race conditions
            $lockedSender    = User::lockForUpdate()->find($sender->id);
            $lockedRecipient = User::lockForUpdate()->find($recipient->id);

            if ($lockedSender->balance < $total) {
                throw new InsufficientBalanceException();
            }

            $lockedSender->decrement('balance', $total);
            $lockedRecipient->increment('balance', $amount); // Destinatario recebe valor cheio

            $txIdOut = config('gateway.transaction_prefix', 'e') . Str::random(32);
            $txIdIn  = config('gateway.transaction_prefix', 'e') . Str::random(32);

            // Registro do sender (saida)
            $senderTx = Transaction::create([
                'id'         => $txIdOut,
                'external_id'=> $txIdIn,
                'user_id'    => $lockedSender->id,
                'amount'     => $amount,
                'tax'        => $tax,
                'status'     => TransactionStatus::PAID,
                'type'       => TransactionType::INTERNAL_TRANSFER,
                'nome'       => $lockedRecipient->name,
                'descricao'  => "Transferencia para {$lockedRecipient->username}",
                'is_internal'=> true,
                'confirmed_at'=> now(),
            ]);

            // Registro do recipient (entrada)
            $recipientTx = Transaction::create([
                'id'         => $txIdIn,
                'external_id'=> $txIdOut,
                'user_id'    => $lockedRecipient->id,
                'amount'     => $amount,
                'tax'        => 0,
                'status'     => TransactionStatus::PAID,
                'type'       => TransactionType::DEPOSIT,
                'nome'       => $lockedSender->name,
                'descricao'  => "Transferencia de {$lockedSender->username}",
                'is_internal'=> true,
                'confirmed_at'=> now(),
            ]);

            return [$senderTx, $recipientTx];
        });

        return $result;
    }
}
