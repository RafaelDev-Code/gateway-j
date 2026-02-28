<?php

namespace App\Exceptions;

use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

class InvalidPinException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('PIN invalido.');
    }

    public function render(): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'error'   => 'INVALID_PIN',
        ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}
