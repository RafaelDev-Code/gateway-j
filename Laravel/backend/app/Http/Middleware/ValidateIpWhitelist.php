<?php

namespace App\Http\Middleware;

use App\Models\IpWhitelist;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateIpWhitelist
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Nao autorizado.'], Response::HTTP_UNAUTHORIZED);
        }

        $ip = $request->ip();

        if (! IpWhitelist::isAllowed($user->id, $ip)) {
            return response()->json(['message' => 'Nao autorizado.'], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
