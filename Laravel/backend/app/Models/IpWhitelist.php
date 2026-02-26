<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IpWhitelist extends Model
{
    protected $fillable = ['user_id', 'ip_address', 'label'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function isAllowed(int $userId, string $ip): bool
    {
        $whitelist = self::where('user_id', $userId)->pluck('ip_address');

        if ($whitelist->isEmpty()) {
            return true; // Sem whitelist configurada = permite qualquer IP
        }

        return $whitelist->contains($ip);
    }
}
