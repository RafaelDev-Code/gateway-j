<?php

namespace App\Services\Acquirers;

use App\DTOs\CashInDTO;
use App\DTOs\CashOutDTO;
use App\DTOs\WebhookPayloadDTO;
use App\Enums\TransactionStatus;
use App\Exceptions\AcquirerException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PagPixAcquirer extends BaseAcquirer
{
    protected string $configKey = 'pagpix';

    public function generatePix(CashInDTO $dto): array
    {
        $response = $this->http()
            ->withHeaders([
                'Authorization' => 'Basic ' . base64_encode($this->config('key')),
                'Content-Type'  => 'application/json',
            ])
            ->post($this->config('url') . 'user/transactions', [
                'amount'      => (int) round($dto->amount * 100), // centavos
                'description' => $dto->description,
                'payer'       => [
                    'name'     => $dto->payerName,
                    'document' => $dto->payerDocument,
                ],
            ]);

        $data = $response->json();

        return [
            'qr_code'      => $data['qrcode'] ?? '',
            'qr_code_text' => $data['qrcode_text'] ?? '',
            'external_id'  => $data['id'] ?? '',
        ];
    }

    public function processCashout(CashOutDTO $dto): array
    {
        $response = $this->http()
            ->withHeaders([
                'Authorization' => 'Basic ' . base64_encode($this->config('key')),
                'Content-Type'  => 'application/json',
            ])
            ->post($this->config('url') . 'user/cashout', [
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
            'status'      => $data['status'] ?? 'PENDING',
        ];
    }

    public function validateWebhookSignature(Request $request): bool
    {
        $secret = $this->config('webhook_secret');

        if (empty($secret)) {
            Log::critical('PagPix webhook_secret nao configurado — requisicao rejeitada.', ['ip' => $request->ip()]);
            return false;
        }

        $signature = $request->header('X-PagPix-Signature', '');
        return $this->validateHmac($request->getContent(), $signature, $secret);
    }

    public function parseWebhookPayload(Request $request): WebhookPayloadDTO
    {
        $payload = $request->json()->all();
        $this->logWebhookReceived('pagpix', $payload);

        $statusMap = [
            'PAID'       => TransactionStatus::PAID,
            'FAILED'     => TransactionStatus::CANCELLED,
            'CHARGEBACK' => TransactionStatus::REVERSED,
            'CANCELLED'  => TransactionStatus::CANCELLED,
        ];

        return new WebhookPayloadDTO(
            externalId:  $payload['id'] ?? '',
            status:      $statusMap[$payload['status'] ?? ''] ?? TransactionStatus::PENDING,
            amountCents: isset($payload['amount']) ? (int) $payload['amount'] : 0, // PagPix envia em centavos
            end2end:     $payload['end2end_id'] ?? null,
            payerName:   $payload['payer']['name'] ?? null,
            rawPayload:  [], // Nunca passa payload raw para o DTO
        );
    }
}
