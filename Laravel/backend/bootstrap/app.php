<?php

use App\Http\Middleware\EnsureUserNotBanned;
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
            'not.banned'       => EnsureUserNotBanned::class,
        ]);

        // Rate limiters configurados no GatewayServiceProvider

    })
    ->withExceptions(function (Exceptions $exceptions): void {

        // Em producao: respostas de erro genericas sem stack trace
        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                // HttpResponseException já carrega a resposta pronta (ex: ThrottleRequests 429)
                // Deve passar direto sem ser reembrulhada
                if ($e instanceof \Illuminate\Http\Exceptions\HttpResponseException) {
                    return $e->getResponse();
                }

                // AuthenticationException sempre é 401 (não 500)
                if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    return response()->json(['message' => 'Nao autenticado.'], 401);
                }

                // ValidationException: delega ao handler padrão do Laravel (retorna 422)
                // Retornar null aqui faz o Laravel continuar para o próximo handler
                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    return null;
                }

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
