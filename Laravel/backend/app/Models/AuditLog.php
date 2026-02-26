<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    public const UPDATED_AT = null; // Apenas created_at

    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'context',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'context' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Registra acao de auditoria sem dados sensiveis.
     * Campos nunca incluidos no context: password, pin, client_secret, tokens
     */
    public static function record(
        string  $action,
        array   $context = [],
        ?int    $userId = null,
        ?string $modelType = null,
        ?string $modelId = null,
    ): void {
        $request = request();

        static::create([
            'user_id'    => $userId ?? ($request->user()?->id),
            'action'     => $action,
            'model_type' => $modelType,
            'model_id'   => $modelId,
            'context'    => static::sanitizeContext($context),
            'ip_address' => $request->ip(),
            'user_agent' => substr($request->userAgent() ?? '', 0, 500),
        ]);
    }

    /**
     * Remove campos sensiveis do contexto antes de persistir.
     */
    private static function sanitizeContext(array $context): array
    {
        $sensitiveFields = [
            'password', 'pin', 'client_secret', 'token', 'secret',
            'authorization', 'apikey', 'api_key', 'senha', 'key',
        ];

        return array_filter(
            $context,
            fn ($key) => ! in_array(strtolower($key), $sensitiveFields),
            ARRAY_FILTER_USE_KEY
        );
    }
}
