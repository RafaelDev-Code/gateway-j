<?php

namespace App\Models;

use App\Enums\DocumentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDocument extends Model
{
    /**
     * Campos aceitos via mass assignment (input do usuário).
     * status e reviewed_by só podem ser setados via forceFill() pelo sistema admin.
     */
    protected $fillable = [
        'user_id',
        'type',
        'file_path',
        'file_hash',
        'mime_type',
        'file_size',
        'rejection_reason',
        'reviewed_at',
    ];

    protected $hidden = [
        'file_path', // Nunca expor o path interno do storage
    ];

    protected function casts(): array
    {
        return [
            'status'      => DocumentStatus::class,
            'reviewed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
