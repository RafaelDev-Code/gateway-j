<?php

namespace App\Enums;

enum UserRole: string
{
    case USER    = 'USER';
    case MANAGER = 'MANAGER';
    case ADMIN   = 'ADMIN';

    public function label(): string
    {
        return match($this) {
            self::USER    => 'Merchant',
            self::MANAGER => 'Gerente',
            self::ADMIN   => 'Administrador',
        };
    }

    public function isAdmin(): bool
    {
        return $this === self::ADMIN;
    }

    public function isManager(): bool
    {
        return $this === self::MANAGER;
    }

    public function color(): string
    {
        return match($this) {
            self::USER    => 'primary',
            self::MANAGER => 'warning',
            self::ADMIN   => 'danger',
        };
    }
}
