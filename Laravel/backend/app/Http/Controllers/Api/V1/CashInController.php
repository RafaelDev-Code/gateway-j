<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Payment\GeneratePixAction;
use App\DTOs\CashInDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\CashInRequest;
use App\Http\Resources\TransactionResource;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;

class CashInController extends Controller
{
    public function __construct(
        private readonly GeneratePixAction $action,
    ) {}

    public function store(CashInRequest $request): JsonResponse
    {
        $user = $request->user();

        $dto = CashInDTO::fromRequest($request->validated(), $user);

        $transaction = $this->action->execute($dto);

        AuditLog::record(
            action:    'cashin.created',
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
