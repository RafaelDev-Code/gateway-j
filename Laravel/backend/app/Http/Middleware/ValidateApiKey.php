<?php

namespace App\Http\Middleware;

use App\Models\IntegrationKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $clientId     = $request->header('X-Client-Id');
        $clientSecret = $request->header('X-Client-Secret');

        // Ambos os headers são obrigatórios
        if (empty($clientId) || empty($clientSecret)) {
            return response()->json(['message' => 'Nao autorizado.'], Response::HTTP_UNAUTHORIZED);
        }

        $integrationKey = IntegrationKey::where('client_id', $clientId)
            ->where('active', true)
            ->with('user')
            ->first();

        if (! $integrationKey || ! $integrationKey->user) {
            return response()->json(['message' => 'Nao autorizado.'], Response::HTTP_UNAUTHORIZED);
        }

        // Verifica o secret — timing-safe, suporta bcrypt e SHA-256 legado
        if (! $integrationKey->verifySecret($clientSecret)) {
            return response()->json(['message' => 'Nao autorizado.'], Response::HTTP_UNAUTHORIZED);
        }

        if ($integrationKey->user->trashed()) {
            return response()->json(['message' => 'Nao autorizado.'], Response::HTTP_UNAUTHORIZED);
        }

        if ($integrationKey->user->banned_at !== null) {
            return response()->json(['message' => 'Conta suspensa.'], Response::HTTP_FORBIDDEN);
        }

        if ($integrationKey->user->blocked_credentials) {
            return response()->json(['message' => 'Acesso bloqueado.'], Response::HTTP_FORBIDDEN);
        }

        auth()->setUser($integrationKey->user);
        $request->merge(['_integration_key' => $integrationKey]);

        return $next($request);
    }
}
