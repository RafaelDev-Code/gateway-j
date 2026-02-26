<?php

namespace App\Models;

use App\Enums\AcquirerType;
use App\Enums\UserRole;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Crypt;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'username',
        'email',
        'password',
        'pin',
        'name',
        'telefone',
        'cnpj',
        'faturamento',
        'balance',
        'role',
        'payment_pix',
        'cash_in_active',
        'cash_out_active',
        'checkout_active',
        'documents_checked',
        'taxa_cashin_individual',
        'taxa_cashout_individual',
        'taxa_min_individual',
        'reference',
        'ref_used',
        'pushcut_link',
    ];

    /**
     * Campos NUNCA serializados em JSON ou respostas de API.
     * Previne vazamento de dados criticos.
     */
    protected $hidden = [
        'password',
        'pin',
        'remember_token',
        'pushcut_link',
        'taxa_cashin_individual',
        'taxa_cashout_individual',
        'taxa_min_individual',
    ];

    protected function casts(): array
    {
        return [
            'password'          => 'hashed',
            'pin'               => 'hashed',
            'role'              => UserRole::class,
            'payment_pix'       => AcquirerType::class,
            'cash_in_active'    => 'boolean',
            'cash_out_active'   => 'boolean',
            'checkout_active'   => 'boolean',
            'documents_checked' => 'boolean',
            'balance'           => 'decimal:6',
            'email_verified_at' => 'datetime',
            'deleted_at'        => 'datetime',
        ];
    }

    // --------------------------------------------------------
    // Accessors/Mutators - Encriptacao de campos sensiveis
    // --------------------------------------------------------

    public function getPushcutLinkAttribute(?string $value): ?string
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

    public function setPushcutLinkAttribute(?string $value): void
    {
        $this->attributes['pushcut_link'] = $value ? Crypt::encryptString($value) : null;
    }

    // --------------------------------------------------------
    // Helpers de negocio
    // --------------------------------------------------------

    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    public function canCashIn(): bool
    {
        return $this->cash_in_active && $this->documents_checked;
    }

    public function canCashOut(): bool
    {
        return $this->cash_out_active && $this->documents_checked;
    }

    public function hasPin(): bool
    {
        return ! empty($this->attributes['pin']);
    }

    public function verifyPin(string $pin): bool
    {
        return password_verify($pin, $this->attributes['pin']);
    }

    // --------------------------------------------------------
    // Relationships
    // --------------------------------------------------------

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function integrationKeys(): HasMany
    {
        return $this->hasMany(IntegrationKey::class);
    }

    public function ipWhitelists(): HasMany
    {
        return $this->hasMany(IpWhitelist::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(UserDocument::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(GatewayNotification::class);
    }

    // --------------------------------------------------------
    // Filament Admin Access
    // --------------------------------------------------------

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->isAdmin();
    }
}
