<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserNotBanned
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        if ($user->banned_at !== null) {
            return response()->json([
                'message' => 'Conta suspensa. Entre em contato com o suporte.',
            ], Response::HTTP_FORBIDDEN);
        }

        if ($user->blocked_credentials) {
            return response()->json([
                'message' => 'Acesso bloqueado. Entre em contato com o suporte.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
