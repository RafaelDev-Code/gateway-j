<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInput
{
    /**
     * Campos que NAO devem ser sanitizados (MEDIUM-22).
     * Campos de senha/PIN podem conter caracteres especiais legítimos como <, >, & e ;.
     * strip_tags neles quebraria senhas com esses caracteres.
     */
    protected array $except = [
        'password',
        'password_confirmation',
        'current_password',
        'new_password',
        'pin',
        'pin_confirmation',
        'current_pin',
        'client_secret',
        'token',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $input = $request->all();
        $request->merge($this->sanitize($input));

        return $next($request);
    }

    private function sanitize(array $data): array
    {
        $sanitized = [];

        foreach ($data as $key => $value) {
            if (in_array($key, $this->except)) {
                $sanitized[$key] = $value;
                continue;
            }

            if (is_array($value)) {
                $sanitized[$key] = $this->sanitize($value);
            } elseif (is_string($value)) {
                // Remove tags HTML e whitespace extra
                $sanitized[$key] = trim(strip_tags($value));
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }
}
