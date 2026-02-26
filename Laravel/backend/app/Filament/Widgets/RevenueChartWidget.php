<?php

namespace App\Filament\Widgets;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Transaction;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class RevenueChartWidget extends ChartWidget
{
    protected static ?string $heading = 'Volume Financeiro (ultimos 7 dias)';
    protected static ?int $sort = 2;

    protected function getData(): array
    {
        $days    = collect(range(6, 0))->map(fn ($d) => now()->subDays($d));
        $labels  = $days->map(fn ($d) => $d->format('d/m'));

        $deposits = $days->map(fn ($d) => Transaction::paid()
            ->deposits()
            ->whereDate('confirmed_at', $d)
            ->sum('amount')
        );

        $withdrawals = $days->map(fn ($d) => Transaction::withdrawals()
            ->whereDate('created_at', $d)
            ->sum('amount')
        );

        return [
            'datasets' => [
                [
                    'label'           => 'Depositos (R$)',
                    'data'            => $deposits->values()->toArray(),
                    'backgroundColor' => 'rgba(34, 197, 94, 0.2)',
                    'borderColor'     => 'rgb(34, 197, 94)',
                ],
                [
                    'label'           => 'Saques (R$)',
                    'data'            => $withdrawals->values()->toArray(),
                    'backgroundColor' => 'rgba(239, 68, 68, 0.2)',
                    'borderColor'     => 'rgb(239, 68, 68)',
                ],
            ],
            'labels' => $labels->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
