<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogApiRequest
{
    /**
     * Headers sensiveis que NUNCA aparecem no log
     */
    protected array $sensitiveHeaders = [
        'authorization', 'apikey', 'cookie', 'set-cookie',
    ];

    /**
     * Campos do body que NUNCA aparecem no log
     */
    protected array $sensitiveFields = [
        'password', 'pin', 'client_secret', 'token', 'key',
        'senha', 'authorization', 'apikey',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Log apenas em rotas de API (exclui webhooks por volume)
        if ($request->is('api/v1/webhooks/*')) {
            return $response;
        }

        try {
            AuditLog::record(
                action:  'api.' . strtolower($request->method()) . '.' . $this->normalizeRoute($request),
                context: [
                    'method'      => $request->method(),
                    'path'        => $request->path(),
                    'status_code' => $response->getStatusCode(),
                    'body'        => $this->sanitizeBody($request->all()),
                ],
                userId: $request->user()?->id,
            );
        } catch (\Throwable) {
            // Log nao deve quebrar a requisicao
        }

        return $response;
    }

    private function normalizeRoute(Request $request): string
    {
        $route = $request->route()?->getName() ?? $request->path();
        return str_replace(['/', '.'], '_', $route);
    }

    private function sanitizeBody(array $body): array
    {
        return array_filter(
            $body,
            fn ($key) => ! in_array(strtolower((string) $key), $this->sensitiveFields),
            ARRAY_FILTER_USE_KEY
        );
    }
}
