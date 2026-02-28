<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BalanceController;
use App\Http\Controllers\Api\V1\CashInController;
use App\Http\Controllers\Api\V1\CashOutController;
use App\Http\Controllers\Api\V1\DocumentController;
use App\Http\Controllers\Api\V1\IntegrationKeyController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PinController;
use App\Http\Controllers\Api\V1\TransactionController;
use App\Http\Controllers\Api\V1\TransferController;
use App\Http\Controllers\Api\V1\UserWebhookController;
use App\Http\Controllers\Api\V1\WebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Gateway de Pagamentos v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // --------------------------------------------------------
    // Rotas autenticadas por API key + whitelist de IP
    // --------------------------------------------------------
    Route::middleware([
        'validate.api.key',
        'validate.ip',
        'not.banned',
        'log.api',
        'throttle:api',
    ])->group(function () {

        // Saldo
        Route::get('/balance', [BalanceController::class, 'show'])
            ->name('api.v1.balance');

        // Cash-In (deposito PIX)
        Route::post('/pix/cashin', [CashInController::class, 'store'])
            ->middleware('throttle:cashin')
            ->name('api.v1.cashin');

        // Cash-Out (saque PIX)
        Route::post('/pix/cashout', [CashOutController::class, 'store'])
            ->middleware('throttle:cashout')
            ->name('api.v1.cashout');

        // Transferencia interna — desativada até ter tela no dashboard
        // Route::post('/transfers', [TransferController::class, 'store'])
        //     ->middleware('throttle:transfer')
        //     ->name('api.v1.transfer');

        // Consulta de transacoes
        Route::get('/transactions', [TransactionController::class, 'index'])
            ->name('api.v1.transactions.index');

        Route::get('/transactions/{id}', [TransactionController::class, 'show'])
            ->name('api.v1.transactions.show');

        // KYC - documentos
        Route::get('/documents', [DocumentController::class, 'index'])
            ->name('api.v1.documents.index');

        Route::post('/documents', [DocumentController::class, 'store'])
            ->name('api.v1.documents.store');
    });

    // --------------------------------------------------------
    // Autenticacao Sanctum (React Dashboard)
    // --------------------------------------------------------
    Route::post('/auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:admin')
        ->name('api.v1.auth.login');

    Route::post('/auth/register', [AuthController::class, 'register'])
        ->middleware('throttle:register')
        ->name('api.v1.auth.register');

    Route::middleware(['auth:sanctum', 'not.banned'])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout'])
            ->name('api.v1.auth.logout');

        Route::get('/auth/me', [AuthController::class, 'me'])
            ->name('api.v1.auth.me');

        Route::put('/auth/me', [AuthController::class, 'updateProfile'])
            ->name('api.v1.auth.update_profile');

        Route::put('/auth/password', [AuthController::class, 'changePassword'])
            ->name('api.v1.auth.change_password');

        // Dashboard: saldo, transacoes, documentos (mesmo contrato da API por key)
        Route::get('/balance', [BalanceController::class, 'show'])
            ->name('api.v1.dashboard.balance');

        Route::get('/transactions', [TransactionController::class, 'index'])
            ->name('api.v1.dashboard.transactions.index');

        Route::get('/transactions/{id}', [TransactionController::class, 'show'])
            ->name('api.v1.dashboard.transactions.show');

        Route::get('/documents', [DocumentController::class, 'index'])
            ->name('api.v1.dashboard.documents.index');

        Route::post('/documents', [DocumentController::class, 'store'])
            ->name('api.v1.dashboard.documents.store');

        // Criar recebimento (PIX/cashin) e saque (cashout) pelo dashboard
        Route::post('/pix/cashin', [CashInController::class, 'store'])
            ->middleware('throttle:cashin')
            ->name('api.v1.dashboard.cashin');

        Route::post('/pix/cashout', [CashOutController::class, 'store'])
            ->middleware('throttle:cashout')
            ->name('api.v1.dashboard.cashout');

        // PIN — throttle restritivo: 5 tentativas/15 min por user (HIGH-8)
        Route::post('/pin', [PinController::class, 'store'])
            ->middleware('throttle:pin')
            ->name('api.v1.pin.store');

        Route::put('/pin', [PinController::class, 'update'])
            ->middleware('throttle:pin')
            ->name('api.v1.pin.update');

        // Notificacoes do dashboard
        Route::get('/notifications', [NotificationController::class, 'index'])
            ->name('api.v1.notifications.index');

        Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount'])
            ->name('api.v1.notifications.unread_count');

        Route::put('/notifications/{id}/read', [NotificationController::class, 'markRead'])
            ->name('api.v1.notifications.mark_read');

        Route::post('/notifications/read-all', [NotificationController::class, 'markAll'])
            ->name('api.v1.notifications.mark_all');

        // Integration Keys (auto-servico)
        Route::get('/keys', [IntegrationKeyController::class, 'index'])
            ->name('api.v1.keys.index');

        Route::post('/keys', [IntegrationKeyController::class, 'store'])
            ->name('api.v1.keys.store');

        Route::delete('/keys/{id}', [IntegrationKeyController::class, 'destroy'])
            ->name('api.v1.keys.destroy');

        // Webhooks configurados pelo usuario (notificar sistema externo)
        Route::get('/user-webhooks', [UserWebhookController::class, 'index'])
            ->name('api.v1.user_webhooks.index');

        Route::post('/user-webhooks', [UserWebhookController::class, 'store'])
            ->name('api.v1.user_webhooks.store');

        Route::patch('/user-webhooks/{uuid}', [UserWebhookController::class, 'update'])
            ->name('api.v1.user_webhooks.update');

        Route::delete('/user-webhooks/{uuid}', [UserWebhookController::class, 'destroy'])
            ->name('api.v1.user_webhooks.destroy');
    });

    // --------------------------------------------------------
    // Webhooks das adquirentes (sem auth, com validacao HMAC)
    // --------------------------------------------------------
    Route::prefix('webhooks')
        ->middleware('throttle:webhooks')
        ->group(function () {

            Route::post('/pagpix',  [WebhookController::class, 'pagpix'])
                ->name('api.v1.webhook.pagpix');

            Route::post('/rapdyn',  [WebhookController::class, 'rapdyn'])
                ->name('api.v1.webhook.rapdyn');

            Route::post('/witetec', [WebhookController::class, 'witetec'])
                ->name('api.v1.webhook.witetec');

            Route::post('/strike',  [WebhookController::class, 'strike'])
                ->name('api.v1.webhook.strike');

            Route::post('/versell', [WebhookController::class, 'versell'])
                ->name('api.v1.webhook.versell');

            Route::post('/bspay',   [WebhookController::class, 'bspay'])
                ->name('api.v1.webhook.bspay');
        });
});
