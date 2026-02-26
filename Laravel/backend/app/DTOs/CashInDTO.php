<?php

namespace App\DTOs;

use App\Models\User;

final readonly class CashInDTO
{
    public function __construct(
        public User   $user,
        public float  $amount,
        public string $payerName,
        public string $payerDocument,
        public string $description,
        public ?string $postbackUrl  = null,
        public array  $splits        = [],
        public bool   $isApi         = true,
    ) {}

    public static function fromRequest(array $data, User $user): self
    {
        return new self(
            user:          $user,
            amount:        (float) $data['valor'],
            payerName:     trim($data['nome']),
            payerDocument: preg_replace('/\D/', '', $data['cpf']),
            description:   trim($data['descricao'] ?? ''),
            postbackUrl:   $data['postback'] ?? null,
            splits:        $data['split'] ?? [],
            isApi:         true,
        );
    }
}
