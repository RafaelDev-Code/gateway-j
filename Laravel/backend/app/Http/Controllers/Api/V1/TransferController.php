<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Payment\ProcessInternalTransferAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\TransferRequest;
use App\Http\Resources\TransactionResource;
use Illuminate\Http\JsonResponse;

class TransferController extends Controller
{
    public function __construct(
        private readonly ProcessInternalTransferAction $action,
    ) {}

    public function store(TransferRequest $request): JsonResponse
    {
        $data = $request->validated();

        [$senderTx] = $this->action->execute(
            sender:         $request->user(),
            targetUsername: $data['username'],
            amount:         (float) $data['valor'],
            pin:            $data['pin'],
        );

        return response()->json(new TransactionResource($senderTx), 201);
    }
}
