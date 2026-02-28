<?php

namespace App\Services\Acquirers;

use App\DTOs\CashInDTO;
use App\DTOs\CashOutDTO;
use App\DTOs\WebhookPayloadDTO;
use App\Enums\TransactionStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RapDynAcquirer extends BaseAcquirer
{
    protected string $configKey = 'rapdyn';

    public function generatePix(CashInDTO $dto): array
    {
        $response = $this->http()
            ->withToken($this->config('key'))
            ->post($this->config('url') . 'api/transfers/in', [
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
            ->withToken($this->config('key'))
            ->post($this->config('url') . 'api/transfers/out', [
                'amount'      => (int) round($dto->amount * 100),
                'pix_key'     => $dto->pixKey,
                'description' => $dto->description,
                'recipient'   => [
                    'name'     => $dto->recipientName,
                    'document' => $dto->recipientDocument,
                ],
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
            Log::critical('RapDyn webhook_secret nao configurado — requisicao rejeitada.', ['ip' => $request->ip()]);
            return false;
        }

        $signature = $request->header('X-RapDyn-Signature', '');
        return $this->validateHmac($request->getContent(), $signature, $secret);
    }

    public function parseWebhookPayload(Request $request): WebhookPayloadDTO
    {
        $payload = $request->json()->all();
        $this->logWebhookReceived('rapdyn', $payload);

        $statusMap = [
            'PAID'      => TransactionStatus::PAID,
            'FAILED'    => TransactionStatus::CANCELLED,
            'CANCELLED' => TransactionStatus::CANCELLED,
            'REVERSED'  => TransactionStatus::REVERSED,
        ];

        return new WebhookPayloadDTO(
            externalId: $payload['id'] ?? '',
            status:     $statusMap[$payload['status'] ?? ''] ?? TransactionStatus::PENDING,
            amountCents: isset($payload['amount']) ? (int) $payload['amount'] : 0,
            end2end:    $payload['end2end'] ?? null,
            payerName:  $payload['payer']['name'] ?? null,
        );
    }
}
