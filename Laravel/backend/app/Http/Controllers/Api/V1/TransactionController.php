<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $transactions = Transaction::forUser($request->user()->id)
            ->when($request->status, fn ($q, $v) => $q->where('status', strtoupper($v)))
            ->when($request->type, fn ($q, $v) => $q->where('type', strtoupper($v)))
            ->when($request->from, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->to, fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->select(['id', 'status', 'type', 'amount', 'tax', 'nome', 'descricao', 'created_at', 'confirmed_at'])
            ->latest()
            ->paginate(50);

        return response()->json(TransactionResource::collection($transactions));
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $transaction = Transaction::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->select(['id', 'status', 'type', 'amount', 'tax', 'nome', 'document', 'descricao', 'external_id', 'end2end', 'created_at', 'confirmed_at'])
            ->firstOrFail();

        return response()->json(new TransactionResource($transaction));
    }
}
