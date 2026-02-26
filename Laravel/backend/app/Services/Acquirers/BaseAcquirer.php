<?php

namespace App\Services\Acquirers;

use App\Contracts\AcquirerInterface;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

abstract class BaseAcquirer implements AcquirerInterface
{
    protected string $configKey;

    protected function config(string $key, mixed $default = null): mixed
    {
        return config("acquirers.{$this->configKey}.{$key}", $default);
    }

    /**
     * HTTP Client pre-configurado com timeout, retry e sem log de credenciais.
     */
    protected function http(): PendingRequest
    {
        return Http::timeout(config('gateway.http.timeout', 30))
            ->connectTimeout(config('gateway.http.connect_timeout', 10))
            ->retry(
                config('gateway.http.retry_times', 2),
                config('gateway.http.retry_sleep', 500),
                fn (\Exception $e) => $e instanceof \Illuminate\Http\Client\ConnectionException
            )
            ->withoutRedirecting()
            ->throw(fn ($response, $e) => throw new \App\Exceptions\AcquirerException(
                "Erro na adquirente {$this->configKey}: HTTP {$response->status()}",
                $response->status()
            ));
    }

    /**
     * Gera HMAC-SHA256 para validacao de assinatura de webhook.
     * Usa hash_equals para prevenir timing attacks.
     */
    protected function validateHmac(string $payload, string $signature, string $secret): bool
    {
        $expected = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expected, $signature);
    }

    protected function logWebhookReceived(string $acquirer, array $payload): void
    {
        Log::channel('daily')->info("Webhook recebido: {$acquirer}", [
            'acquirer' => $acquirer,
            // Nunca logar payload completo - pode conter dados de pagamento
            'external_id' => $payload['id'] ?? $payload['transactionId'] ?? 'unknown',
        ]);
    }
}
