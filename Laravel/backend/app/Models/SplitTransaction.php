<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SplitTransaction extends Model
{
    protected $fillable = [
        'transaction_id',
        'target_user_id',
        'percentage',
        'amount',
        'processed',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'processed'    => 'boolean',
            'amount'       => 'integer',
            'processed_at' => 'datetime',
        ];
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function targetUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }
}
