<?php

namespace App\Models;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

class Transaction extends Model
{
    use HasFactory;
    protected $primaryKey = 'id';
    public $incrementing  = false;
    protected $keyType    = 'string';

    /**
     * Campos críticos protegidos contra mass assignment (MEDIUM-20).
     * user_id, amount, tax, status, type NUNCA devem ser preenchidos via input do usuário.
     * Use forceFill() nos Action/Job classes onde esses campos precisam ser setados internamente.
     */
    protected $guarded = [
        'user_id',
        'amount',
        'tax',
        'status',
        'type',
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
            'amount'       => 'integer',
            'tax'          => 'integer',
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

    /**
     * Retorna o valor líquido em centavos (int).
     */
    public function netAmount(): int
    {
        return (int) $this->amount - (int) $this->tax;
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
