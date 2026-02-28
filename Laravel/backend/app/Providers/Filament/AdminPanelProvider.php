<?php

namespace App\Providers\Filament;

use App\Filament\Pages\AcquirersPage;
use App\Filament\Resources\GatewayConfigResource;
use App\Filament\Resources\IntegrationKeyResource;
use App\Filament\Resources\KycApprovalResource;
use App\Filament\Resources\ManagerResource;
use App\Filament\Resources\TransactionResource;
use App\Filament\Resources\UserDocumentResource;
use App\Filament\Resources\UserResource;
use App\Filament\Widgets\RecentTransactionsWidget;
use App\Filament\Widgets\RevenueChartWidget;
use App\Filament\Widgets\TransactionStatsWidget;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path(env('ADMIN_URL_PREFIX', 'admin'))
            ->login()
            ->brandName('')
            ->colors([
                'primary' => Color::Rose,
            ])

            // -------------------------------------------------------
            // Resources
            // -------------------------------------------------------
            ->resources([
                UserResource::class,
                KycApprovalResource::class,
                ManagerResource::class,
                TransactionResource::class,
                IntegrationKeyResource::class,
                UserDocumentResource::class,
                GatewayConfigResource::class,
            ])

            // -------------------------------------------------------
            // Pages customizadas
            // -------------------------------------------------------
            ->pages([
                Pages\Dashboard::class,
                AcquirersPage::class,
            ])

            // -------------------------------------------------------
            // Widgets do Dashboard
            // -------------------------------------------------------
            ->widgets([
                TransactionStatsWidget::class,
                RevenueChartWidget::class,
                RecentTransactionsWidget::class,
            ])

            // -------------------------------------------------------
            // Grupos de navegação (sem ícones nos grupos para evitar conflito com ícones dos itens)
            // -------------------------------------------------------
            // ->navigationGroups([...]) removido: Filament exige ícone só no grupo OU nos itens, não em ambos.

            // -------------------------------------------------------
            // Middleware
            // -------------------------------------------------------
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ])
            ->authGuard('web');
    }
}
