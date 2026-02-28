<?php

namespace App\Providers;

use App\Services\AntiFraudService;
use App\Services\TaxCalculator;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class GatewayServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind de services como singletons para reuso entre requests (Octane)
        $this->app->singleton(TaxCalculator::class);
        $this->app->singleton(AntiFraudService::class);
    }

    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    private function configureRateLimiting(): void
    {
        // Rate limit padrao para todas as rotas de API
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(
                config('gateway.rate_limits.api', 60)
            )->by($request->bearerToken() ?? $request->ip())
             ->response(fn () => response()->json(
                 ['message' => 'Muitas requisicoes. Aguarde e tente novamente.'],
                 429
             ));
        });

        // Cash-in: 30 req/min por token
        RateLimiter::for('cashin', function (Request $request) {
            return Limit::perMinute(
                config('gateway.rate_limits.cashin', 30)
            )->by($request->bearerToken() ?? $request->ip());
        });

        // Cash-out: 10 req/min por token (operacao critica)
        RateLimiter::for('cashout', function (Request $request) {
            return Limit::perMinute(
                config('gateway.rate_limits.cashout', 10)
            )->by($request->bearerToken() ?? $request->ip());
        });

        // Transferencias: 10 req/min por token
        RateLimiter::for('transfer', function (Request $request) {
            return Limit::perMinute(
                config('gateway.rate_limits.transfer', 10)
            )->by($request->bearerToken() ?? $request->ip());
        });

        // Webhooks: 300 req/min por IP (alto volume de adquirentes)
        RateLimiter::for('webhooks', function (Request $request) {
            return Limit::perMinute(
                config('gateway.rate_limits.webhooks', 300)
            )->by($request->ip());
        });

        // Admin login: 5 tentativas/min por IP (anti brute force)
        RateLimiter::for('admin', function (Request $request) {
            return Limit::perMinute(
                config('gateway.rate_limits.admin_login', 5)
            )->by($request->ip())
             ->response(fn () => response()->json(
                 ['message' => 'Muitas tentativas de login. Aguarde e tente novamente.'],
                 429
             ));
        });

        // Registro: 5 contas/hora por IP (previne criacao em massa de contas)
        RateLimiter::for('register', function (Request $request) {
            return Limit::perHour(
                config('gateway.rate_limits.register', 5)
            )->by($request->ip())
             ->response(fn () => response()->json(
                 ['message' => 'Limite de cadastros atingido. Tente novamente mais tarde.'],
                 429
             ));
        });

        // PIN: 5 tentativas/15 min por user_id (protege brute-force 0000-9999)
        RateLimiter::for('pin', function (Request $request) {
            $key = $request->user()?->id ?? $request->ip();
            return Limit::perMinutes(15,
                config('gateway.rate_limits.pin', 5)
            )->by($key)
             ->response(fn () => response()->json(
                 ['message' => 'Muitas tentativas de PIN. Aguarde 15 minutos.'],
                 429
             ));
        });

        // Forgot-password: 5 req/hora por IP
        RateLimiter::for('forgot_password', function (Request $request) {
            return Limit::perHour(
                config('gateway.rate_limits.forgot_password', 5)
            )->by($request->ip())
             ->response(fn () => response()->json(
                 ['message' => 'Muitas solicitacoes de recuperacao de senha. Tente mais tarde.'],
                 429
             ));
        });
    }
}
