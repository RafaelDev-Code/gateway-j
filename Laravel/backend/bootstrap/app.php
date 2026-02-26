<?php

use App\Http\Middleware\ForceHttps;
use App\Http\Middleware\LogApiRequest;
use App\Http\Middleware\SanitizeInput;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\ValidateApiKey;
use App\Http\Middleware\ValidateIpWhitelist;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web:      __DIR__ . '/../routes/web.php',
        api:      __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health:   '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // Middlewares globais (em toda requisicao)
        $middleware->append(ForceHttps::class);
        $middleware->append(SecurityHeaders::class);
        $middleware->append(SanitizeInput::class);

        // Aliases para uso nas rotas
        $middleware->alias([
            'validate.api.key' => ValidateApiKey::class,
            'validate.ip'      => ValidateIpWhitelist::class,
            'log.api'          => LogApiRequest::class,
        ]);

        // Rate limiters configurados no GatewayServiceProvider

    })
    ->withExceptions(function (Exceptions $exceptions): void {

        // Em producao: respostas de erro genericas sem stack trace
        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                $statusCode = method_exists($e, 'getStatusCode')
                    ? $e->getStatusCode()
                    : 500;

                // Em producao nao vaza mensagem de erro de servidor
                $message = app()->environment('production') && $statusCode >= 500
                    ? 'Erro interno. Tente novamente.'
                    : $e->getMessage();

                return response()->json(
                    ['message' => $message],
                    $statusCode
                );
            }
        });

    })->create();
