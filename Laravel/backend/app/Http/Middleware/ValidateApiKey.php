<?php

namespace App\Http\Middleware;

use App\Models\IntegrationKey;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('Apikey') ?? $request->header('Authorization');

        if (empty($apiKey)) {
            return response()->json(['message' => 'Nao autorizado.'], Response::HTTP_UNAUTHORIZED);
        }

        // Remove "Bearer " se presente
        $apiKey = str_replace('Bearer ', '', $apiKey);

        $integrationKey = IntegrationKey::where('client_id', $apiKey)
            ->where('active', true)
            ->with('user')
            ->first();

        if (! $integrationKey || ! $integrationKey->user) {
            return response()->json(['message' => 'Nao autorizado.'], Response::HTTP_UNAUTHORIZED);
        }

        if ($integrationKey->user->trashed()) {
            return response()->json(['message' => 'Nao autorizado.'], Response::HTTP_UNAUTHORIZED);
        }

        // Autentica o usuario via Sanctum para que auth() funcione
        auth()->setUser($integrationKey->user);
        $request->merge(['_integration_key' => $integrationKey]);

        return $next($request);
    }
}
