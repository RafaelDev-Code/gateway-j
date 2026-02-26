<?php

namespace App\Exceptions;

use RuntimeException;

class InsufficientBalanceException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('Saldo insuficiente para realizar esta operacao.');
    }

    public function render(): array
    {
        return ['message' => $this->getMessage()];
    }
}
