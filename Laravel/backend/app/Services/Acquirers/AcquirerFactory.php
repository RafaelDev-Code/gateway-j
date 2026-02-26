<?php

namespace App\Services\Acquirers;

use App\Contracts\AcquirerInterface;
use App\Enums\AcquirerType;
use App\Exceptions\AcquirerException;

class AcquirerFactory
{
    private static array $map = [
        AcquirerType::PAGPIX->value  => PagPixAcquirer::class,
        AcquirerType::RAPDYN->value  => RapDynAcquirer::class,
        AcquirerType::WITETEC->value => WiteTecAcquirer::class,
        AcquirerType::STRIKE->value  => StrikeAcquirer::class,
        AcquirerType::VERSELL->value => VersellAcquirer::class,
        AcquirerType::BSPAY->value   => BSPayAcquirer::class,
    ];

    /**
     * Resolve a implementacao da adquirente a partir do enum.
     */
    public static function make(AcquirerType $type): AcquirerInterface
    {
        $class = self::$map[$type->value] ?? null;

        if (! $class) {
            throw new AcquirerException("Adquirente nao suportada: {$type->value}");
        }

        if (! $type->isActive()) {
            throw new AcquirerException("Adquirente {$type->label()} nao esta ativa.");
        }

        return app($class);
    }

    /**
     * Resolve pelo nome string da adquirente (ex: vindo do banco).
     */
    public static function makeByName(string $name): AcquirerInterface
    {
        $type = AcquirerType::tryFrom(strtoupper($name));

        if (! $type) {
            throw new AcquirerException("Adquirente invalida: {$name}");
        }

        return self::make($type);
    }
}
