<?php

namespace App\Enums;

enum AcquirerType: string
{
    case PAGPIX  = 'PAGPIX';
    case RAPDYN  = 'RAPDYN';
    case WITETEC = 'WITETEC';
    case STRIKE  = 'STRIKE';
    case VERSELL = 'VERSELL';
    case BSPAY   = 'BSPAY';

    public function label(): string
    {
        return match($this) {
            self::PAGPIX  => 'PagPix',
            self::RAPDYN  => 'RapDyn',
            self::WITETEC => 'WiteTec',
            self::STRIKE  => 'Strike',
            self::VERSELL => 'Versell Pay',
            self::BSPAY   => 'BSPay',
        };
    }

    public function configKey(): string
    {
        return match($this) {
            self::PAGPIX  => 'pagpix',
            self::RAPDYN  => 'rapdyn',
            self::WITETEC => 'witetec',
            self::STRIKE  => 'strike',
            self::VERSELL => 'versell',
            self::BSPAY   => 'bspay',
        };
    }

    public function isActive(): bool
    {
        return (bool) config("acquirers.{$this->configKey()}.active", false);
    }
}
