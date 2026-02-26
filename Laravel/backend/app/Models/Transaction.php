<?php

namespace App\Models;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

class Transaction extends Model
{
    protected $primaryKey = 'id';
    public $incrementing  = false;
    protected $keyType    = 'string';

    protected $fillable = [
        'id',
        'end2end',
        'external_id',
        'user_id',
        'amount',
        'tax',
        'status',
        'type',
        'nome',
        'descricao',
        'document',
        'postback_url',
        'postback_status',
        'is_api',
        'is_internal',
        'confirmed_at',
    ];

    /**
     * postback_url nao exposta em serializacao - contem URL do merchant
     */
    protected $hidden = [
        'postback_url',
    ];

    protected function casts(): array
    {
        return [
            'status'       => TransactionStatus::class,
            'type'         => TransactionType::class,
            'amount'       => 'decimal:6',
            'tax'          => 'decimal:6',
            'is_api'       => 'boolean',
            'is_internal'  => 'boolean',
            'confirmed_at' => 'datetime',
            'created_at'   => 'datetime',
            'updated_at'   => 'datetime',
        ];
    }

    // --------------------------------------------------------
    // Encriptacao da postback_url
    // --------------------------------------------------------

    public function getPostbackUrlAttribute(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }
        try {
            return Crypt::decryptString($value);
        } catch (\Exception) {
            return null;
        }
    }

    public function setPostbackUrlAttribute(?string $value): void
    {
        $this->attributes['postback_url'] = $value ? Crypt::encryptString($value) : null;
    }

    // --------------------------------------------------------
    // Helpers
    // --------------------------------------------------------

    public function isPending(): bool
    {
        return $this->status === TransactionStatus::PENDING;
    }

    public function isPaid(): bool
    {
        return $this->status === TransactionStatus::PAID;
    }

    public function netAmount(): float
    {
        return (float) $this->amount - (float) $this->tax;
    }

    // --------------------------------------------------------
    // Relationships
    // --------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function splits(): HasMany
    {
        return $this->hasMany(SplitTransaction::class);
    }

    // --------------------------------------------------------
    // Scopes
    // --------------------------------------------------------

    public function scopePaid($query)
    {
        return $query->where('status', TransactionStatus::PAID);
    }

    public function scopePending($query)
    {
        return $query->where('status', TransactionStatus::PENDING);
    }

    public function scopeDeposits($query)
    {
        return $query->where('type', TransactionType::DEPOSIT);
    }

    public function scopeWithdrawals($query)
    {
        return $query->where('type', TransactionType::WITHDRAW);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
