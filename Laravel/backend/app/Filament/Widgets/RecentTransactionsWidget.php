<?php

namespace App\Filament\Widgets;

use App\Enums\TransactionStatus;
use App\Models\Transaction;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class RecentTransactionsWidget extends BaseWidget
{
    protected static ?int $sort = 3;
    protected int | string | array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Transaction::with('user')
                    ->latest()
                    ->limit(20)
            )
            ->columns([
                Tables\Columns\TextColumn::make('id')->label('ID')->limit(20)->copyable(),
                Tables\Columns\TextColumn::make('user.username')->label('Merchant'),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'success' => TransactionStatus::PAID->value,
                        'warning' => TransactionStatus::PENDING->value,
                        'danger'  => TransactionStatus::CANCELLED->value,
                        'gray'    => TransactionStatus::REVERSED->value,
                    ]),
                Tables\Columns\TextColumn::make('type')->label('Tipo'),
                Tables\Columns\TextColumn::make('amount')->label('Valor')->money('BRL'),
                Tables\Columns\TextColumn::make('created_at')->label('Data')->dateTime('d/m/Y H:i'),
            ])
            ->paginated(false);
    }
}
