<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class IntegrationKey extends Model
{
    protected $fillable = [
        'user_id',
        'client_id',
        'client_secret',
        'name',
        'description',
        'domain',
        'active',
    ];

    protected $hidden = [
        'client_secret',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function generateClientId(): string
    {
        return 'gw_' . Str::random(32);
    }

    public static function generateClientSecret(): string
    {
        return Str::random(64);
    }

    /**
     * Verifica client_secret usando hash_equals para prevenir timing attacks.
     */
    public function verifySecret(string $secret): bool
    {
        return hash_equals($this->client_secret, hash('sha256', $secret));
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
