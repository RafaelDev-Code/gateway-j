<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\AcquirerType;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessWebhookJob;
use App\Services\Acquirers\AcquirerFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class WebhookController extends Controller
{
    public function pagpix(Request $request): JsonResponse
    {
        return $this->handle($request, AcquirerType::PAGPIX);
    }

    public function rapdyn(Request $request): JsonResponse
    {
        return $this->handle($request, AcquirerType::RAPDYN);
    }

    public function witetec(Request $request): JsonResponse
    {
        return $this->handle($request, AcquirerType::WITETEC);
    }

    public function strike(Request $request): JsonResponse
    {
        return $this->handle($request, AcquirerType::STRIKE);
    }

    public function versell(Request $request): JsonResponse
    {
        return $this->handle($request, AcquirerType::VERSELL);
    }

    public function bspay(Request $request): JsonResponse
    {
        return $this->handle($request, AcquirerType::BSPAY);
    }

    private function handle(Request $request, AcquirerType $type): JsonResponse
    {
        try {
            $acquirer = AcquirerFactory::make($type);

            // Valida assinatura ANTES de processar qualquer dado
            if (! $acquirer->validateWebhookSignature($request)) {
                Log::warning("Webhook com assinatura invalida: {$type->value}", [
                    'ip' => $request->ip(),
                ]);
                return response()->json(['message' => 'Nao autorizado.'], Response::HTTP_UNAUTHORIZED);
            }

            // Parse o payload em DTO padronizado
            $payload = $acquirer->parseWebhookPayload($request);

            // Dispatch para fila de alta prioridade (retorna 200 imediatamente)
            ProcessWebhookJob::dispatch($type, $payload)
                ->onQueue('webhooks');

            return response()->json(['message' => 'OK'], Response::HTTP_OK);

        } catch (\Throwable $e) {
            Log::error("Erro ao receber webhook {$type->value}: " . $e->getMessage());

            // Retorna 200 para evitar reenvio infinito da adquirente
            return response()->json(['message' => 'OK'], Response::HTTP_OK);
        }
    }
}
