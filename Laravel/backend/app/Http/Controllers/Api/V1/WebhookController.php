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

            // 1. Valida assinatura HMAC antes de qualquer processamento
            if (! $acquirer->validateWebhookSignature($request)) {
                Log::warning("Webhook com assinatura invalida: {$type->value}", [
                    'ip' => $request->ip(),
                ]);
                return response()->json(['message' => 'Nao autorizado.'], Response::HTTP_UNAUTHORIZED);
            }

            // 2. Valida janela de tempo: rejeita eventos com mais de 5 minutos
            // Protege contra replay de assinaturas válidas capturadas anteriormente
            $timestamp = (int) $request->header('X-Webhook-Timestamp', 0);
            if ($timestamp > 0 && abs(time() - $timestamp) > 300) {
                Log::warning("Webhook com timestamp expirado: {$type->value}", [
                    'ip'        => $request->ip(),
                    'timestamp' => $timestamp,
                    'drift_sec' => abs(time() - $timestamp),
                ]);
                return response()->json(['message' => 'Timestamp expirado.'], Response::HTTP_BAD_REQUEST);
            }

            // 3. Parse o payload em DTO padronizado
            $payload = $acquirer->parseWebhookPayload($request);

            // 4. Dispatch para fila — deduplicação atômica ocorre dentro do Job
            ProcessWebhookJob::dispatch($type, $payload)
                ->onQueue('webhooks');

            return response()->json(['message' => 'OK'], Response::HTTP_OK);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Payload inválido — erro do remetente, não reenviar
            Log::warning("Webhook {$type->value}: payload inválido", [
                'ip'     => $request->ip(),
                'errors' => $e->errors(),
            ]);
            return response()->json(['message' => 'Payload invalido.'], Response::HTTP_UNPROCESSABLE_ENTITY);

        } catch (\InvalidArgumentException | \UnexpectedValueException $e) {
            // Erro de parsing do payload — retorna 400 sem reenvio
            Log::warning("Webhook {$type->value}: erro de parsing", [
                'ip'    => $request->ip(),
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Formato de payload invalido.'], Response::HTTP_BAD_REQUEST);

        } catch (\Throwable $e) {
            // Erro inesperado — loga com contexto para debugging, retorna 200 para evitar
            // reenvio infinito (adquirente interpreta 4xx/5xx como falha de entrega)
            Log::error("Webhook {$type->value}: erro inesperado ao receber", [
                'ip'        => $request->ip(),
                'exception' => get_class($e),
                'message'   => $e->getMessage(),
                'file'      => $e->getFile(),
                'line'      => $e->getLine(),
            ]);

            return response()->json(['message' => 'OK'], Response::HTTP_OK);
        }
    }
}
