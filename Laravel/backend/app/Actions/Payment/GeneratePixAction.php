<?php

namespace App\Actions\Payment;

use App\DTOs\CashInDTO;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Exceptions\AcquirerException;
use App\Models\SplitTransaction;
use App\Models\Transaction;
use App\Services\AntiFraudService;
use App\Services\Acquirers\AcquirerFactory;
use App\Services\TaxCalculator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GeneratePixAction
{
    public function __construct(
        private readonly TaxCalculator    $taxCalculator,
        private readonly AntiFraudService $antiFraud,
    ) {}

    public function execute(CashInDTO $dto): Transaction
    {
        // Validacoes de negocio
        if (! $dto->user->canCashIn()) {
            throw new \RuntimeException('Cash-in nao disponivel para este usuario.');
        }

        if (! $this->antiFraud->isAmountValid($dto->amountCents)) {
            throw new \RuntimeException('Valor invalido para transacao.');
        }

        // Calcula taxa em centavos
        $taxCents = $this->taxCalculator->calculateCashIn($dto->user, $dto->amountCents);

        // Obtem adquirente do usuario
        $acquirer = AcquirerFactory::make($dto->user->payment_pix);

        // Chama API da adquirente
        $acquirerResult = $acquirer->generatePix($dto);

        if (empty($acquirerResult['external_id'])) {
            throw new AcquirerException('Adquirente nao retornou ID valido.');
        }

        // Persiste tudo em uma transacao atomica
        $transaction = DB::transaction(function () use ($dto, $taxCents, $acquirerResult) {
            $txId = config('gateway.transaction_prefix', 'e') . Str::random(32);

            $transaction = (new Transaction())->forceFill([
                'id'           => $txId,
                'external_id'  => $acquirerResult['external_id'],
                'user_id'      => $dto->user->id,
                'amount'       => $dto->amountCents,
                'tax'          => $taxCents,
                'status'       => TransactionStatus::PENDING,
                'type'         => TransactionType::DEPOSIT,
                'nome'         => $dto->payerName,
                'document'     => $dto->payerDocument,
                'descricao'    => $dto->description,
                'postback_url' => $dto->postbackUrl,
                'is_api'       => $dto->isApi,
            ]);
            $transaction->save();

            // Persiste splits se houver
            foreach ($dto->splits as $split) {
                SplitTransaction::create([
                    'transaction_id' => $txId,
                    'target_user_id' => $split['user_id'],
                    'percentage'     => $split['percentage'],
                    'processed'      => false,
                ]);
            }

            return $transaction;
        });

        // Adiciona o QR code no objeto retornado (nao persistido no banco)
        $transaction->setAttribute('qr_code', $acquirerResult['qr_code']);
        $transaction->setAttribute('qr_code_text', $acquirerResult['qr_code_text']);

        return $transaction;
    }
}
