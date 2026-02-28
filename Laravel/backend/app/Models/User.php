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
        'site',
        'cnpj',
        'faturamento',
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
        'last_login_at',
    ];

    /**
     * Campos controlados exclusivamente por ações administrativas internas.
     * Nunca devem ser alterados via fill() ou update() diretamente.
     * Use forceFill() apenas dentro de Actions/Services confiáveis.
     */
    protected array $adminOnly = [
        'balance',
        'role',
        'banned_at',
        'ban_reason',
        'manager_id',
        'blocked_credentials',
        'auto_cashout_limit',
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
            'balance'           => 'integer',
            'email_verified_at'  => 'datetime',
            'last_login_at'      => 'datetime',
            'banned_at'          => 'datetime',
            'deleted_at'         => 'datetime',
            'blocked_credentials' => 'boolean',
            'auto_cashout_limit' => 'integer',
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

    public function getCnpjAttribute(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }
        try {
            return Crypt::decryptString($value);
        } catch (\Exception) {
            return $value; // Fallback para registros antigos em texto plano
        }
    }

    public function setCnpjAttribute(?string $value): void
    {
        $this->attributes['cnpj'] = $value ? Crypt::encryptString($value) : null;
    }

    // --------------------------------------------------------
    // Helpers de negocio
    // --------------------------------------------------------

    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    public function isManager(): bool
    {
        return $this->role === UserRole::MANAGER;
    }

    public function isBanned(): bool
    {
        return ! is_null($this->banned_at);
    }

    /**
     * Retorna o faturamento total em centavos (int).
     */
    public function totalRevenue(): int
    {
        return (int) $this->transactions()
            ->where('status', \App\Enums\TransactionStatus::PAID)
            ->where('type', \App\Enums\TransactionType::DEPOSIT)
            ->sum('amount');
    }

    /**
     * Retorna o ticket médio em centavos (int).
     */
    public function averageTicket(): int
    {
        return (int) ($this->transactions()
            ->where('status', \App\Enums\TransactionStatus::PAID)
            ->where('type', \App\Enums\TransactionType::DEPOSIT)
            ->avg('amount') ?? 0);
    }

    public function lastTransaction(): ?\App\Models\Transaction
    {
        return $this->transactions()->latest()->first();
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

    public function manager(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function managedUsers(): HasMany
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    // --------------------------------------------------------
    // Filament Admin Access
    // --------------------------------------------------------

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->isAdmin();
    }
}
