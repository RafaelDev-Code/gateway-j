<?php

namespace App\Services\Acquirers;

use App\DTOs\CashInDTO;
use App\DTOs\CashOutDTO;
use App\DTOs\WebhookPayloadDTO;
use App\Enums\TransactionStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StrikeAcquirer extends BaseAcquirer
{
    protected string $configKey = 'strike';

    public function generatePix(CashInDTO $dto): array
    {
        $response = $this->http()
            ->withHeaders([
                'x-public-key' => $this->config('public_key'),
                'x-secret-key' => $this->config('secret_key'),
            ])
            ->post($this->config('url') . 'transaction', [
                'amount'      => (int) round($dto->amount * 100),
                'description' => $dto->description,
                'payer'       => [
                    'name'     => $dto->payerName,
                    'document' => $dto->payerDocument,
                ],
            ]);

        $data = $response->json();

        return [
            'qr_code'      => $data['qr_code'] ?? '',
            'qr_code_text' => $data['qr_code_text'] ?? '',
            'external_id'  => $data['id'] ?? '',
        ];
    }

    public function processCashout(CashOutDTO $dto): array
    {
        $response = $this->http()
            ->withHeaders([
                'x-public-key' => $this->config('public_key'),
                'x-secret-key' => $this->config('secret_key'),
            ])
            ->post($this->config('url') . 'v1/withdraw', [
                'amount'   => (int) round($dto->amount * 100),
                'pix_key'  => $dto->pixKey,
                'name'     => $dto->recipientName,
                'document' => $dto->recipientDocument,
            ]);

        $data = $response->json();

        return [
            'external_id' => $data['id'] ?? '',
            'status'      => 'PENDING',
        ];
    }

    public function validateWebhookSignature(Request $request): bool
    {
        $secret = $this->config('webhook_secret');

        if (empty($secret)) {
            Log::critical('Strike webhook_secret nao configurado — requisicao rejeitada.', ['ip' => $request->ip()]);
            return false;
        }

        $signature = $request->header('X-Strike-Signature', '');
        return $this->validateHmac($request->getContent(), $signature, $secret);
    }

    public function parseWebhookPayload(Request $request): WebhookPayloadDTO
    {
        $payload = $request->json()->all();
        $this->logWebhookReceived('strike', $payload);

        $statusMap = [
            'PAID'       => TransactionStatus::PAID,
            'FAILED'     => TransactionStatus::CANCELLED,
            'CANCELLED'  => TransactionStatus::CANCELLED,
            'CHARGEBACK' => TransactionStatus::REVERSED,
        ];

        return new WebhookPayloadDTO(
            externalId: $payload['id'] ?? '',
            status:     $statusMap[$payload['status'] ?? ''] ?? TransactionStatus::PENDING,
            amountCents: isset($payload['amount']) ? (int) $payload['amount'] : 0,
            end2end:    $payload['end2end_id'] ?? null,
        );
    }
}
