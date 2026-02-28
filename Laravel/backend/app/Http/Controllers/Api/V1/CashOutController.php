<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Payment\ProcessCashoutAction;
use App\DTOs\CashOutDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\CashOutRequest;
use App\Http\Resources\TransactionResource;
use App\Models\AuditLog;
use App\Models\Transaction;
use App\Enums\TransactionType;
use Illuminate\Http\JsonResponse;

class CashOutController extends Controller
{
    public function __construct(
        private readonly ProcessCashoutAction $action,
    ) {}

    public function store(CashOutRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        // HIGH-11: Idempotency Key — previne saques duplicados por retry de rede
        $idempotencyKey = $request->header('Idempotency-Key');

        if (empty($idempotencyKey)) {
            return response()->json([
                'message' => 'O header Idempotency-Key é obrigatório para saques.',
                'error'   => 'IDEMPOTENCY_KEY_REQUIRED',
            ], 422);
        }

        if (strlen($idempotencyKey) > 128) {
            return response()->json([
                'message' => 'Idempotency-Key deve ter no máximo 128 caracteres.',
                'error'   => 'IDEMPOTENCY_KEY_TOO_LONG',
            ], 422);
        }

        // Se já existe um saque com a mesma chave para este usuário, retorna o existente
        $existing = Transaction::where('user_id', $user->id)
            ->where('idempotency_key', $idempotencyKey)
            ->where('type', TransactionType::WITHDRAW)
            ->first();

        if ($existing) {
            return response()->json(new TransactionResource($existing), 200);
        }

        $dto = CashOutDTO::fromRequest($data, $user, $idempotencyKey);

        $transaction = $this->action->execute($dto, $data['pin']);

        AuditLog::record(
            action:    'cashout.created',
            context:   ['transaction_id' => $transaction->id, 'amount' => $transaction->amount],
            userId:    $user->id,
            modelType: 'Transaction',
            modelId:   $transaction->id,
        );

        return response()->json(
            new TransactionResource($transaction),
            201
        );
    }
}
