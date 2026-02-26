<?php

namespace App\DTOs;

use App\Enums\TransactionStatus;

final readonly class WebhookPayloadDTO
{
    public function __construct(
        public string            $externalId,
        public TransactionStatus $status,
        public float             $amount,
        public ?string           $end2end    = null,
        public ?string           $payerName  = null,
        public array             $rawPayload = [],
    ) {}

    public static function fromArray(array $data): self
    {
        $status = $data['status'] instanceof TransactionStatus
            ? $data['status']
            : TransactionStatus::from($data['status']);

        return new self(
            externalId: $data['external_id'],
            status:     $status,
            amount:     (float) ($data['amount'] ?? 0),
            end2end:    $data['end2end'] ?? null,
            payerName:  $data['payer_name'] ?? null,
            rawPayload: $data,
        );
    }
}
