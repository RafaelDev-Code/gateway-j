<?php

namespace App\Exceptions;

use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

class InsufficientBalanceException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('Saldo insuficiente para realizar esta operacao.');
    }

    public function render(): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'error'   => 'INSUFFICIENT_BALANCE',
        ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}
