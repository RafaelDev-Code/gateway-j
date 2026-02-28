<?php

namespace App\DTOs;

use App\Enums\TransactionStatus;

final readonly class WebhookPayloadDTO
{
    public function __construct(
        public string            $externalId,
        public TransactionStatus $status,
        public int               $amountCents,
        public ?string           $end2end    = null,
        public ?string           $payerName  = null,
        public ?string           $eventId    = null,
        public array             $rawPayload = [],
    ) {}

    public static function fromArray(array $data): self
    {
        $status = $data['status'] instanceof TransactionStatus
            ? $data['status']
            : TransactionStatus::from($data['status']);

        // Adquirentes enviam o valor em reais (float/string) — converter para centavos via bcmath
        $rawAmount   = (string) ($data['amount'] ?? 0);
        $amountCents = (int) bcmul($rawAmount, '100', 0);

        // event_id: chave de deduplicação única por evento da adquirente
        $eventId = $data['event_id'] ?? $data['id'] ?? null;

        return new self(
            externalId:  $data['external_id'],
            status:      $status,
            amountCents: $amountCents,
            end2end:     $data['end2end'] ?? null,
            payerName:   $data['payer_name'] ?? null,
            eventId:     $eventId ? (string) $eventId : null,
            rawPayload:  $data,
        );
    }
}
