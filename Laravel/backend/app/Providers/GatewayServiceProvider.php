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
            )->by($request->ip());
        });
    }
}
