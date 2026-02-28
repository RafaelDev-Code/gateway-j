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

        // CSP com duas políticas separadas (HIGH-13):
        // - /admin/* → CSP permissiva para Filament/Livewire (inline scripts/styles obrigatórios)
        // - demais rotas → CSP restritiva (apenas self, sem unsafe-eval)
        if ($request->is('admin') || $request->is('admin/*')) {
            $response->headers->set(
                'Content-Security-Policy',
                "default-src 'self'; " .
                "script-src 'self' 'unsafe-inline'; " .
                "style-src 'self' 'unsafe-inline' https://fonts.bunny.net; " .
                "font-src 'self' https://fonts.bunny.net data:; " .
                "img-src 'self' data: blob:; " .
                "connect-src 'self' ws: wss:; " .
                "frame-ancestors 'none'"
            );
        } else {
            $response->headers->set(
                'Content-Security-Policy',
                "default-src 'self'; " .
                "script-src 'self'; " .
                "style-src 'self'; " .
                "img-src 'self' data:; " .
                "connect-src 'self'; " .
                "frame-ancestors 'none'"
            );
        }

        // Remove headers que revelam stack
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }
}
