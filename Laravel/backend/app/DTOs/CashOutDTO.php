<?php

namespace App\DTOs;

use App\Models\User;

final readonly class CashOutDTO
{
    public function __construct(
        public User    $user,
        public int     $amountCents,
        public string  $pixKey,
        public string  $recipientName,
        public string  $recipientDocument,
        public string  $description,
        public ?string $postbackUrl     = null,
        public bool    $isApi           = true,
        public ?string $idempotencyKey  = null,
    ) {}

    public static function fromRequest(array $data, User $user, ?string $idempotencyKey = null): self
    {
        // Converte reais (string/float da API) para centavos (int) via bcmath
        $amountCents = (int) bcmul((string) ($data['valor'] ?? 0), '100', 0);

        return new self(
            user:              $user,
            amountCents:       $amountCents,
            pixKey:            trim($data['key']),
            recipientName:     trim($data['nome']),
            recipientDocument: preg_replace('/\D/', '', $data['cpf']),
            description:       trim($data['descricao'] ?? ''),
            postbackUrl:       $data['postback'] ?? null,
            isApi:             true,
            idempotencyKey:    $idempotencyKey,
        );
    }
}
