<?php

namespace App\Services\Acquirers;

use App\DTOs\CashInDTO;
use App\DTOs\CashOutDTO;
use App\DTOs\WebhookPayloadDTO;
use App\Enums\TransactionStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class BSPayAcquirer extends BaseAcquirer
{
    protected string $configKey = 'bspay';

    /**
     * BSPay usa OAuth2 client_credentials.
     * Token cacheado para evitar requests repetidos.
     */
    private function getAccessToken(): string
    {
        return Cache::remember(
            'bspay_access_token',
            config('gateway.cache.acquirer_token', 1800),
            function () {
                $response = $this->http()
                    ->post($this->config('url') . 'oauth/token', [
                        'grant_type'    => 'client_credentials',
                        'client_id'     => $this->config('client_id'),
                        'client_secret' => $this->config('client_secret'),
                    ]);

                return $response->json('access_token', '');
            }
        );
    }

    public function generatePix(CashInDTO $dto): array
    {
        $response = $this->http()
            ->withToken($this->getAccessToken())
            ->post($this->config('url') . 'pix/qrcode', [
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
            ->withToken($this->getAccessToken())
            ->post($this->config('url') . 'pix/payment', [
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
            Log::critical('BSPay webhook_secret nao configurado — requisicao rejeitada.', ['ip' => $request->ip()]);
            return false;
        }

        $signature = $request->header('X-BSPay-Signature', '');
        return $this->validateHmac($request->getContent(), $signature, $secret);
    }

    public function parseWebhookPayload(Request $request): WebhookPayloadDTO
    {
        $payload = $request->json()->all();
        $this->logWebhookReceived('bspay', $payload);

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
            end2end:    $payload['end2end'] ?? null,
        );
    }
}
