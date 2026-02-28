<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookEvent extends Model
{
    /**
     * Campos seguros para mass-assignment.
     * 'status' é omitido intencionalmente — use forceFill() para alterá-lo.
     */
    protected $fillable = [
        'provider',
        'provider_event_id',
        'transaction_id',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }
}
