<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Regra de validação que bloqueia URLs com destino em endereços privados/internos.
 *
 * Previne SSRF (Server-Side Request Forgery) em campos de postback_url.
 *
 * LIMITAÇÃO — DNS rebinding:
 * Esta regra valida o host no momento da requisição. Um atacante com controle
 * de DNS pode fazer o domínio resolver para IP público na validação e para IP
 * privado no momento do envio (DNS rebinding). Para mitigação completa, o
 * serviço que faz o POST de postback deve TAMBÉM verificar o IP resolvido
 * imediatamente antes de cada requisição (double-check), com cache de TTL
 * máximo de 60 segundos. Ver SendPostbackJob para implementação futura.
 */
class SafeUrl implements ValidationRule
{
    /**
     * Prefixos e hosts de IPs/nomes privados proibidos.
     * Cobre RFC 1918 (IPv4 privado), link-local, loopback, metadata cloud.
     */
    private const BLOCKED_PREFIXES = [
        '10.',
        '172.16.', '172.17.', '172.18.', '172.19.',
        '172.20.', '172.21.', '172.22.', '172.23.',
        '172.24.', '172.25.', '172.26.', '172.27.',
        '172.28.', '172.29.', '172.30.', '172.31.',
        '192.168.',
        '127.',
        '0.',
        '169.254.',
    ];

    private const BLOCKED_HOSTS = [
        'localhost',
        '::1',
        '[::1]',     // IPv6 loopback em formato URI (RFC 2732)
        'metadata.google.internal',
        'postgres',
        'redis',
        'mysql',
        'db',
    ];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            return;
        }

        $parsed = parse_url($value);
        $host   = strtolower($parsed['host'] ?? '');

        if (empty($host)) {
            $fail('URL de postback inválida.');
            return;
        }

        // Em produção exige HTTPS
        if (app()->environment('production') && ($parsed['scheme'] ?? '') !== 'https') {
            $fail('URLs de postback devem usar HTTPS em produção.');
            return;
        }

        // Bloqueia nomes de host internos conhecidos
        if (in_array($host, self::BLOCKED_HOSTS, true)) {
            $fail('URLs de postback não podem apontar para endereços internos.');
            return;
        }

        // Bloqueia prefixos de IP privado/reservado
        foreach (self::BLOCKED_PREFIXES as $prefix) {
            if (str_starts_with($host, $prefix)) {
                $fail('URLs de postback não podem apontar para endereços internos.');
                return;
            }
        }

        // Bloqueia IPs privados/reservados literais na URL (IPv4 e IPv6)
        // Trata formato IPv6 em URI: [::1] → ::1
        $ipToCheck = trim($host, '[]');
        if (filter_var($ipToCheck, FILTER_VALIDATE_IP)) {
            if (! filter_var($ipToCheck, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                $fail('URLs de postback não podem usar endereços IP privados ou reservados.');
                return;
            }
        }
    }
}
