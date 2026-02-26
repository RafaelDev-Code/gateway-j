<?php

namespace App\DTOs;

use App\Models\User;

final readonly class CashOutDTO
{
    public function __construct(
        public User   $user,
        public float  $amount,
        public string $pixKey,
        public string $recipientName,
        public string $recipientDocument,
        public string $description,
        public ?string $postbackUrl = null,
        public bool   $isApi        = true,
    ) {}

    public static function fromRequest(array $data, User $user): self
    {
        return new self(
            user:               $user,
            amount:             (float) $data['valor'],
            pixKey:             trim($data['key']),
            recipientName:      trim($data['nome']),
            recipientDocument:  preg_replace('/\D/', '', $data['cpf']),
            description:        trim($data['descricao'] ?? ''),
            postbackUrl:        $data['postback'] ?? null,
            isApi:              true,
        );
    }
}
