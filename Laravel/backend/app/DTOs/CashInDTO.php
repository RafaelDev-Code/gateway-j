<?php

namespace App\DTOs;

use App\Models\User;

final readonly class CashInDTO
{
    public function __construct(
        public User    $user,
        public int     $amountCents,
        public string  $payerName,
        public string  $payerDocument,
        public string  $description,
        public ?string $postbackUrl  = null,
        public array   $splits       = [],
        public bool    $isApi        = true,
    ) {}

    public static function fromRequest(array $data, User $user): self
    {
        // Converte reais (string/float da API) para centavos (int) via bcmath
        $amountCents = (int) bcmul((string) ($data['valor'] ?? 0), '100', 0);

        return new self(
            user:          $user,
            amountCents:   $amountCents,
            payerName:     trim($data['nome']),
            payerDocument: preg_replace('/\D/', '', $data['cpf']),
            description:   trim($data['descricao'] ?? ''),
            postbackUrl:   $data['postback'] ?? null,
            splits:        $data['split'] ?? [],
            isApi:         true,
        );
    }
}
