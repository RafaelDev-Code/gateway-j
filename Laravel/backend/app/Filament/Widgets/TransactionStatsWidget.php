<?php

namespace App\Filament\Widgets;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Transaction;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class TransactionStatsWidget extends BaseWidget
{
    protected static ?int $sort = 1;
    protected int | string | array $columnSpan = 'full';

    protected function getStats(): array
    {
        $today = today();

        $depositsToday = Transaction::paid()
            ->deposits()
            ->whereDate('confirmed_at', $today)
            ->sum('amount');

        $withdrawalsToday = Transaction::whereDate('created_at', $today)
            ->withdrawals()
            ->sum('amount');

        $pendingCount = Transaction::pending()->count();

        $totalBalance = \App\Models\User::sum('balance');

        return [
            Stat::make('Depositos Hoje', 'R$ ' . number_format((float)$depositsToday, 2, ',', '.'))
                ->description('Transacoes pagas hoje')
                ->icon('heroicon-o-arrow-down-circle')
                ->color('success'),

            Stat::make('Saques Hoje', 'R$ ' . number_format((float)$withdrawalsToday, 2, ',', '.'))
                ->description('Saques processados hoje')
                ->icon('heroicon-o-arrow-up-circle')
                ->color('danger'),

            Stat::make('Pendentes', $pendingCount)
                ->description('Transacoes aguardando confirmacao')
                ->icon('heroicon-o-clock')
                ->color('warning'),

            Stat::make('Saldo em Circulacao', 'R$ ' . number_format((float)$totalBalance, 2, ',', '.'))
                ->description('Soma dos saldos de todos os merchants')
                ->icon('heroicon-o-currency-dollar')
                ->color('primary'),
        ];
    }
}
