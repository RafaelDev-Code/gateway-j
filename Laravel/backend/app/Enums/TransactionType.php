<?php

namespace App\Enums;

enum TransactionType: string
{
    case DEPOSIT           = 'DEPOSIT';
    case WITHDRAW          = 'WITHDRAW';
    case INTERNAL_TRANSFER = 'INTERNAL_TRANSFER';

    public function label(): string
    {
        return match($this) {
            self::DEPOSIT           => 'Deposito',
            self::WITHDRAW          => 'Saque',
            self::INTERNAL_TRANSFER => 'Transferencia Interna',
        };
    }

    public function isDebit(): bool
    {
        return in_array($this, [self::WITHDRAW, self::INTERNAL_TRANSFER]);
    }
}
