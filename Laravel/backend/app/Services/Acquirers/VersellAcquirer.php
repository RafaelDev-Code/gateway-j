<?php

namespace App\Services\Acquirers;

use App\DTOs\CashInDTO;
use App\DTOs\CashOutDTO;
use App\DTOs\WebhookPayloadDTO;
use App\Enums\TransactionStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VersellAcquirer extends BaseAcquirer
{
    protected string $configKey = 'versell';

    public function generatePix(CashInDTO $dto): array
    {
        $response = $this->http()
            ->withHeaders([
                'vspi' => $this->config('client_id'),
                'vsps' => $this->config('secret'),
            ])
            ->post($this->config('url') . 'api/v1/gateway/request-qrcode', [
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
                'vspi' => $this->config('client_id'),
                'vsps' => $this->config('secret'),
            ])
            ->post($this->config('url') . 'api/v1/gateway/pix-payment', [
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
            Log::critical('Versell webhook_secret nao configurado — requisicao rejeitada.', ['ip' => $request->ip()]);
            return false;
        }

        $signature = $request->header('X-Versell-Signature', '');
        return $this->validateHmac($request->getContent(), $signature, $secret);
    }

    public function parseWebhookPayload(Request $request): WebhookPayloadDTO
    {
        $payload = $request->json()->all();
        $this->logWebhookReceived('versell', $payload);

        $statusMap = [
            'PAID'                 => TransactionStatus::PAID,
            'PAID_OUT'             => TransactionStatus::PAID,
            'withdraw successfully' => TransactionStatus::PAID,
            'FAILED'               => TransactionStatus::CANCELLED,
            'EXPIRED'              => TransactionStatus::CANCELLED,
            'CANCELLED'            => TransactionStatus::CANCELLED,
            'CHARGEBACK'           => TransactionStatus::REVERSED,
            'PENDING'              => TransactionStatus::PENDING,
        ];

        return new WebhookPayloadDTO(
            externalId: $payload['id'] ?? '',
            status:     $statusMap[$payload['status'] ?? ''] ?? TransactionStatus::PENDING,
            amountCents: isset($payload['amount']) ? (int) $payload['amount'] : 0,
            end2end:    $payload['end2end'] ?? null,
        );
    }
}
