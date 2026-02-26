<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BalanceResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BalanceController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json(new BalanceResource($request->user()));
    }
}
