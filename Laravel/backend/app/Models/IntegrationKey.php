<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class IntegrationKey extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'client_id',
        'name',
        'description',
        'domain',
        'active',
    ];

    protected $hidden = [
        'client_secret',
        'next_secret_hash',
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
     * Verifica o client_secret de forma timing-safe.
     * Suporta bcrypt (novo padrão) e SHA-256 (legado).
     * Se autenticar via SHA-256, faz upgrade automático para bcrypt.
     */
    public function verifySecret(string $secret): bool
    {
        // Verificação primária: bcrypt (novo padrão)
        // Captura RuntimeException caso o hash não seja bcrypt (configuração verify_algorithm)
        try {
            if (Hash::check($secret, $this->client_secret)) {
                return true;
            }
        } catch (\RuntimeException) {
            // Hash não é bcrypt — tenta fallback SHA-256 abaixo
        }

        // Fallback: SHA-256 legado (chaves criadas antes da migração)
        $sha256Hash = hash('sha256', $secret);
        if (hash_equals($this->client_secret, $sha256Hash)) {
            // Upgrade automático para bcrypt na próxima autenticação
            $this->forceFill(['client_secret' => Hash::make($secret)])->save();
            return true;
        }

        return false;
    }

    /**
     * Rotaciona o secret: salva o novo hash como next_secret_hash.
     * Após confirmar que o novo secret está em uso, chamar commitRotation().
     * Retorna o novo secret em texto plano (exibir UMA VEZ).
     */
    public function rotateSecret(): string
    {
        $newSecret = self::generateClientSecret();
        $this->forceFill(['next_secret_hash' => Hash::make($newSecret)])->save();
        return $newSecret;
    }

    /**
     * Promove next_secret_hash para client_secret, completando a rotação.
     */
    public function commitRotation(): void
    {
        if ($this->next_secret_hash) {
            $this->forceFill([
                'client_secret'   => $this->next_secret_hash,
                'next_secret_hash' => null,
            ])->save();
        }
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
