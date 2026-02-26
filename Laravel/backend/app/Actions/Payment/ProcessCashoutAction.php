<?php

namespace App\Actions\Payment;

use App\DTOs\CashOutDTO;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Exceptions\AcquirerException;
use App\Exceptions\InsufficientBalanceException;
use App\Exceptions\InvalidPinException;
use App\Models\AuditLog;
use App\Models\Transaction;
use App\Services\AntiFraudService;
use App\Services\Acquirers\AcquirerFactory;
use App\Services\TaxCalculator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProcessCashoutAction
{
    public function __construct(
        private readonly TaxCalculator    $taxCalculator,
        private readonly AntiFraudService $antiFraud,
    ) {}

    public function execute(CashOutDTO $dto, string $pin): Transaction
    {
        $user = $dto->user;

        // Validacoes de negocio
        if (! $user->canCashOut()) {
            throw new \RuntimeException('Cash-out nao disponivel para este usuario.');
        }

        if (! $user->hasPin()) {
            throw new \RuntimeException('Configure um PIN antes de realizar saques.');
        }

        // Valida PIN usando hash_equals internamente (sem timing attack)
        if (! $user->verifyPin($pin)) {
            AuditLog::record('cashout.invalid_pin', ['user_id' => $user->id]);
            throw new InvalidPinException();
        }

        // Anti-fraude
        if (! $this->antiFraud->canWithdraw($user, $dto->amount)) {
            throw new \RuntimeException('Operacao bloqueada pelo sistema de seguranca.');
        }

        if (! $this->antiFraud->isAmountValid($dto->amount)) {
            throw new \RuntimeException('Valor invalido para transacao.');
        }

        // Calcula taxa e total necessario
        $tax   = $this->taxCalculator->calculateCashOut($user, $dto->amount);
        $total = $dto->amount + $tax;

        // Verifica saldo
        if ($user->balance < $total) {
            throw new InsufficientBalanceException();
        }

        // Obtem adquirente
        $acquirer = AcquirerFactory::make($user->payment_pix);

        // Tudo em transacao atomica: debita saldo, cria transacao, chama adquirente
        $transaction = DB::transaction(function () use ($dto, $user, $tax, $total, $acquirer) {
            // Debita saldo imediatamente (lock row para evitar race condition)
            $locked = \App\Models\User::lockForUpdate()->find($user->id);

            if ($locked->balance < $total) {
                throw new InsufficientBalanceException();
            }

            $locked->decrement('balance', $total);

            // Cria transacao pendente
            $txId = config('gateway.transaction_prefix', 'e') . Str::random(32);

            $transaction = Transaction::create([
                'id'          => $txId,
                'user_id'     => $user->id,
                'amount'      => $dto->amount,
                'tax'         => $tax,
                'status'      => TransactionStatus::PENDING,
                'type'        => TransactionType::WITHDRAW,
                'nome'        => $dto->recipientName,
                'document'    => $dto->recipientDocument,
                'descricao'   => $dto->description,
                'postback_url'=> $dto->postbackUrl,
                'is_api'      => $dto->isApi,
            ]);

            return $transaction;
        });

        // Chama adquirente FORA da transacao de banco
        // (falha da adquirente nao reverte o debito - sera processado via webhook)
        try {
            $result = $acquirer->processCashout($dto);
            $transaction->update(['external_id' => $result['external_id']]);
        } catch (AcquirerException $e) {
            // Reverte o saldo se a adquirente falhar imediatamente
            DB::table('users')->where('id', $user->id)->increment('balance', $total);
            $transaction->update(['status' => TransactionStatus::CANCELLED]);
            throw $e;
        }

        return $transaction;
    }
}
