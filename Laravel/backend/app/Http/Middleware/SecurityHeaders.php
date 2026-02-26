<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Previne clickjacking
        $response->headers->set('X-Frame-Options', 'DENY');

        // Previne MIME sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Protecao XSS legada
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // HTTPS forcado
        $response->headers->set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
        );

        // Referrer
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissoes do browser
        $response->headers->set(
            'Permissions-Policy',
            'geolocation=(), microphone=(), camera=(), payment=()'
        );

        // API nao gera HTML - CSP restritiva
        $response->headers->set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");

        // Remove headers que revelam stack
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }
}
