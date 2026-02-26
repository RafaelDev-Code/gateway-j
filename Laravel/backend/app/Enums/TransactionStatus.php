<?php

namespace App\Enums;

enum TransactionStatus: string
{
    case PAID      = 'PAID';
    case PENDING   = 'PENDING';
    case CANCELLED = 'CANCELLED';
    case REVERSED  = 'REVERSED';

    public function label(): string
    {
        return match($this) {
            self::PAID      => 'Pago',
            self::PENDING   => 'Pendente',
            self::CANCELLED => 'Cancelado',
            self::REVERSED  => 'Estornado',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PAID      => 'success',
            self::PENDING   => 'warning',
            self::CANCELLED => 'danger',
            self::REVERSED  => 'gray',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::PAID, self::CANCELLED, self::REVERSED]);
    }
}
