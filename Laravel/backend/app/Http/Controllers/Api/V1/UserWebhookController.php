<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\UserWebhook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class UserWebhookController extends Controller
{
    private const MAX_PER_USER = 10;

    /**
     * Eventos suportados pelo sistema de webhooks.
     * Manter em sincronia com o frontend (IntegracoesExternas.jsx TODOS_EVENTOS).
     */
    public const ALLOWED_EVENTS = [
        'payment.approved',
        'payment.failed',
        'payment.refunded',
        'payment.pending',
        'chargeback.opened',
        'chargeback.won',
        'chargeback.lost',
        'withdraw.requested',
        'withdraw.approved',
        'withdraw.failed',
    ];

    /**
     * Blocos CIDR de IPs privados/internos proibidos como destino de webhook.
     * Previne SSRF contra a infraestrutura interna.
     */
    private const BLOCKED_RANGES = [
        '10.',
        '172.16.', '172.17.', '172.18.', '172.19.',
        '172.20.', '172.21.', '172.22.', '172.23.',
        '172.24.', '172.25.', '172.26.', '172.27.',
        '172.28.', '172.29.', '172.30.', '172.31.',
        '192.168.',
        '127.',
        '0.',
        '169.254.',
        '::1',
        'localhost',
        'postgres',
        'redis',
        'mysql',
    ];

    public function index(Request $request): JsonResponse
    {
        $webhooks = UserWebhook::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($w) => $this->format($w));

        return response()->json(['data' => $webhooks]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $count = UserWebhook::where('user_id', $user->id)->count();
        if ($count >= self::MAX_PER_USER) {
            return response()->json([
                'message' => 'Limite de ' . self::MAX_PER_USER . ' webhooks atingido.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $validated = $request->validate([
            'url'      => ['required', 'url', 'max:500', $this->safeUrlRule()],
            'events'   => ['required', 'array', 'min:1', 'max:10'],
            'events.*' => ['required', 'string', Rule::in(self::ALLOWED_EVENTS)],
        ]);

        $validated['events'] = array_values(array_unique($validated['events']));

        $webhook = UserWebhook::create([
            'user_id'   => $user->id,
            'url'       => $validated['url'],
            'events'    => $validated['events'],
            'is_active' => true,
        ]);

        return response()->json(['data' => $this->format($webhook)], Response::HTTP_CREATED);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        // LOW-24: lookup por UUID público, não por ID sequencial
        $webhook = UserWebhook::where('user_id', $request->user()->id)
            ->where('uuid', $uuid)
            ->firstOrFail();

        $validated = $request->validate([
            'url'       => ['sometimes', 'url', 'max:500', $this->safeUrlRule()],
            'events'    => ['sometimes', 'array', 'min:1', 'max:10'],
            'events.*'  => ['sometimes', 'string', Rule::in(self::ALLOWED_EVENTS)],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (isset($validated['events'])) {
            $validated['events'] = array_values(array_unique($validated['events']));
        }

        $webhook->update($validated);

        return response()->json(['data' => $this->format($webhook->fresh())]);
    }

    public function destroy(Request $request, string $uuid): JsonResponse
    {
        // LOW-24: lookup por UUID público
        $webhook = UserWebhook::where('user_id', $request->user()->id)
            ->where('uuid', $uuid)
            ->firstOrFail();
        $webhook->delete();

        return response()->json(['message' => 'Webhook removido com sucesso.']);
    }

    private function format(UserWebhook $w): array
    {
        return [
            'id'         => $w->uuid,   // LOW-24: expõe UUID, não ID sequencial
            'url'        => $w->url,
            'events'     => $w->events,
            'is_active'  => $w->is_active,
            'created_at' => $w->created_at?->toIso8601String(),
        ];
    }

    /**
     * Regra de validação que bloqueia URLs internas/privadas (SSRF) — MEDIUM-16.
     *
     * LIMITAÇÃO — DNS rebinding (MEDIUM-16):
     * Esta regra valida o host no momento da requisição. Para proteção completa,
     * o worker que faz o HTTP POST de notificação deve TAMBÉM verificar o IP
     * resolvido imediatamente antes de cada envio (double-check, TTL máx 60s).
     * Alternativa mais segura: usar allowlist explícita de domínios por merchant,
     * em vez de blocklist de IPs — configurável por usuário em painel admin.
     */
    private function safeUrlRule(): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail): void {
            if (! is_string($value)) {
                return;
            }

            $parsed = parse_url($value);
            $host   = strtolower($parsed['host'] ?? '');

            if (empty($host)) {
                $fail('URL de webhook inválida.');
                return;
            }

            // Em produção, exige HTTPS
            if (app()->environment('production') && ($parsed['scheme'] ?? '') !== 'https') {
                $fail('URLs de webhook devem usar HTTPS em produção.');
                return;
            }

            // Bloqueia hosts privados/internos
            foreach (self::BLOCKED_RANGES as $blocked) {
                if (str_starts_with($host, $blocked) || $host === rtrim($blocked, '.')) {
                    $fail('URLs de webhook não podem apontar para endereços internos.');
                    return;
                }
            }

            // Bloqueia se o host resolve para IP privado
            if (filter_var($host, FILTER_VALIDATE_IP)) {
                if (
                    ! filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)
                ) {
                    $fail('URLs de webhook não podem usar endereços IP privados ou reservados.');
                    return;
                }
            }
        };
    }
}
