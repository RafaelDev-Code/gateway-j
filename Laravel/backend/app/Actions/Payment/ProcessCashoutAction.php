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
use Illuminate\Support\Facades\Log;
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

        // Anti-fraude (recebe centavos)
        if (! $this->antiFraud->canWithdraw($user, $dto->amountCents)) {
            throw new \RuntimeException('Operacao bloqueada pelo sistema de seguranca.');
        }

        if (! $this->antiFraud->isAmountValid($dto->amountCents)) {
            throw new \RuntimeException('Valor invalido para transacao.');
        }

        // Calcula taxa e total em centavos
        $taxCents   = $this->taxCalculator->calculateCashOut($user, $dto->amountCents);
        $totalCents = $dto->amountCents + $taxCents;

        // Verifica saldo (ambos em centavos)
        if ($user->balance < $totalCents) {
            throw new InsufficientBalanceException();
        }

        // Obtem adquirente
        $acquirer = AcquirerFactory::make($user->payment_pix);

        // Tudo em transacao atomica: debita saldo, cria transacao, chama adquirente
        $transaction = DB::transaction(function () use ($dto, $user, $taxCents, $totalCents, $acquirer) {
            // Debita saldo imediatamente (lock row para evitar race condition)
            $locked = \App\Models\User::lockForUpdate()->find($user->id);

            if ($locked->balance < $totalCents) {
                throw new InsufficientBalanceException();
            }

            $locked->decrement('balance', $totalCents);

            // Cria transacao pendente
            $txId = config('gateway.transaction_prefix', 'e') . Str::random(32);

            $transaction = (new Transaction())->forceFill([
                'id'              => $txId,
                'user_id'         => $user->id,
                'amount'          => $dto->amountCents,
                'tax'             => $taxCents,
                'status'          => TransactionStatus::PENDING,
                'type'            => TransactionType::WITHDRAW,
                'nome'            => $dto->recipientName,
                'document'        => $dto->recipientDocument,
                'descricao'       => $dto->description,
                'postback_url'    => $dto->postbackUrl,
                'is_api'          => $dto->isApi,
                'idempotency_key' => $dto->idempotencyKey,
            ]);
            $transaction->save();

            return $transaction;
        });

        // Chama adquirente FORA da transacao de banco
        // (falha da adquirente nao reverte o debito - sera processado via webhook)
        try {
            $result = $acquirer->processCashout($dto);
            $transaction->update(['external_id' => $result['external_id']]);
        } catch (AcquirerException $e) {
            // Reverte saldo em transacao atomica separada para garantir consistencia
            try {
                DB::transaction(function () use ($user, $totalCents, $transaction): void {
                    DB::table('users')->where('id', $user->id)->increment('balance', $totalCents);
                    $transaction->forceFill(['status' => TransactionStatus::CANCELLED])->save();
                });
            } catch (\Throwable $revertException) {
                // Reversao falhou: saldo debitado mas adquirente nao processou.
                // Alerta critico: requer intervencao manual imediata.
                Log::critical('CRITICO: falha ao reverter saldo apos erro de adquirente.', [
                    'user_id'        => $user->id,
                    'transaction_id' => $transaction->id,
                    'valor_cents'    => $totalCents,
                    'erro_original'  => $e->getMessage(),
                    'erro_reversao'  => $revertException->getMessage(),
                ]);
            }
            throw $e;
        }

        return $transaction;
    }
}
