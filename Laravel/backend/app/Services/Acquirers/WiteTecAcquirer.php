<?php

namespace App\Services\Acquirers;

use App\DTOs\CashInDTO;
use App\DTOs\CashOutDTO;
use App\DTOs\WebhookPayloadDTO;
use App\Enums\TransactionStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class WiteTecAcquirer extends BaseAcquirer
{
    protected string $configKey = 'witetec';

    /**
     * WiteTec requer token de autenticacao obtido via login.
     * Token e cacheado para evitar requests desnecessarios.
     */
    private function getAuthToken(): string
    {
        return Cache::remember(
            'witetec_auth_token',
            config('gateway.cache.acquirer_token', 1800),
            function () {
                $response = $this->http()
                    ->withHeader('x-api-key', $this->config('secret_key'))
                    ->post($this->config('url') . 'withdrawals/auth', [
                        'email'    => $this->config('merchant_email'),
                        'password' => $this->config('merchant_password'),
                    ]);

                return $response->json('token', '');
            }
        );
    }

    public function generatePix(CashInDTO $dto): array
    {
        $response = $this->http()
            ->withHeader('x-api-key', $this->config('secret_key'))
            ->post($this->config('url') . 'transactions', [
                'amount'      => (int) round($dto->amount * 100),
                'description' => $dto->description,
                'customer'    => [
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
        $token = $this->getAuthToken();

        $response = $this->http()
            ->withHeader('x-api-key', $this->config('secret_key'))
            ->withToken($token)
            ->post($this->config('url') . 'withdrawals', [
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
            Log::critical('WiteTec webhook_secret nao configurado — requisicao rejeitada.', ['ip' => $request->ip()]);
            return false;
        }

        $signature = $request->header('X-WiteTec-Signature', '');
        return $this->validateHmac($request->getContent(), $signature, $secret);
    }

    public function parseWebhookPayload(Request $request): WebhookPayloadDTO
    {
        $payload = $request->json()->all();
        $this->logWebhookReceived('witetec', $payload);

        $event = $payload['event'] ?? '';

        $statusMap = [
            'payment.success'    => TransactionStatus::PAID,
            'payment.failed'     => TransactionStatus::CANCELLED,
            'payment.chargeback' => TransactionStatus::REVERSED,
            'payment.dispute'    => TransactionStatus::REVERSED,
        ];

        return new WebhookPayloadDTO(
            externalId: $payload['data']['id'] ?? '',
            status:     $statusMap[$event] ?? TransactionStatus::PENDING,
            amountCents: isset($payload['data']['amount']) ? (int) $payload['data']['amount'] : 0,
            end2end:    $payload['data']['end2end'] ?? null,
        );
    }
}
