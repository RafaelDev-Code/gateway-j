<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class GatewayConfig extends Model
{
    protected $fillable = [
        'tax_cashin',
        'tax_cashout',
        'tax_min',
        'tax_internal',
        'anti_fraud_min',
        'gateway_name',
        'primary_color',
        'secondary_color',
        'logo_url',
        'favicon_url',
    ];

    protected function casts(): array
    {
        return [
            'tax_cashin'     => 'decimal:4',
            'tax_cashout'    => 'decimal:4',
            'tax_min'        => 'decimal:6',
            'tax_internal'   => 'decimal:4',
            'anti_fraud_min' => 'decimal:6',
        ];
    }

    /**
     * Retorna a config global cacheada no Redis.
     * Unica linha em producao - evita N+1 queries de config.
     */
    public static function current(): self
    {
        return Cache::remember(
            'gateway_config',
            config('gateway.cache.gateway_config', 3600),
            fn () => self::firstOrCreate([], [
                'tax_cashin'  => 2.0,
                'tax_cashout' => 2.0,
                'tax_min'     => 1.0,
            ])
        );
    }

    /**
     * Invalida cache apos update.
     */
    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget('gateway_config'));
        static::deleted(fn () => Cache::forget('gateway_config'));
    }
}
