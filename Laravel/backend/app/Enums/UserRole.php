<?php

namespace App\Enums;

enum UserRole: string
{
    case USER  = 'USER';
    case ADMIN = 'ADMIN';

    public function label(): string
    {
        return match($this) {
            self::USER  => 'Merchant',
            self::ADMIN => 'Administrador',
        };
    }

    public function isAdmin(): bool
    {
        return $this === self::ADMIN;
    }
}
