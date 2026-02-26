<?php

namespace App\Contracts;

use App\DTOs\CashInDTO;
use App\DTOs\CashOutDTO;
use App\DTOs\WebhookPayloadDTO;
use Illuminate\Http\Request;

interface AcquirerInterface
{
    /**
     * Gera um QR Code PIX para deposito.
     * Retorna array com: qr_code, qr_code_text, external_id
     */
    public function generatePix(CashInDTO $dto): array;

    /**
     * Processa um saque PIX.
     * Retorna array com: external_id, status
     */
    public function processCashout(CashOutDTO $dto): array;

    /**
     * Valida a assinatura do webhook recebido.
     * Rejeita se retornar false.
     */
    public function validateWebhookSignature(Request $request): bool;

    /**
     * Transforma o payload cru do webhook em um DTO padronizado.
     */
    public function parseWebhookPayload(Request $request): WebhookPayloadDTO;
}
