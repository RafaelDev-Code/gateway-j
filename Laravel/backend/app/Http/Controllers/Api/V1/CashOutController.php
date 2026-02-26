<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Payment\ProcessCashoutAction;
use App\DTOs\CashOutDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\CashOutRequest;
use App\Http\Resources\TransactionResource;
use App\Models\AuditLog;
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

        $dto = CashOutDTO::fromRequest($data, $user);

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
