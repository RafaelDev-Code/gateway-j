<?php

namespace App\Filament\Resources;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Filament\Resources\TransactionResource\Pages;
use App\Models\Transaction;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TransactionResource extends Resource
{
    protected static ?string $model = Transaction::class;
    protected static ?string $navigationIcon  = 'heroicon-o-banknotes';
    protected static ?string $navigationLabel = 'Transacoes';
    protected static ?string $modelLabel      = 'Transacao';
    protected static ?string $pluralModelLabel= 'Transacoes';
    protected static ?int $navigationSort     = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([]); // Transacoes sao somente leitura
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->searchable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('user.username')
                    ->label('Merchant')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Status')
                    ->colors([
                        'success' => TransactionStatus::PAID->value,
                        'warning' => TransactionStatus::PENDING->value,
                        'danger'  => TransactionStatus::CANCELLED->value,
                        'gray'    => TransactionStatus::REVERSED->value,
                    ]),
                Tables\Columns\BadgeColumn::make('type')
                    ->label('Tipo')
                    ->colors([
                        'success' => TransactionType::DEPOSIT->value,
                        'danger'  => TransactionType::WITHDRAW->value,
                        'info'    => TransactionType::INTERNAL_TRANSFER->value,
                    ]),
                Tables\Columns\TextColumn::make('amount')
                    ->label('Valor')
                    ->money('BRL')
                    ->sortable(),
                Tables\Columns\TextColumn::make('tax')
                    ->label('Taxa')
                    ->money('BRL'),
                Tables\Columns\TextColumn::make('nome')
                    ->label('Nome')
                    ->limit(30),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Criado em')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('confirmed_at')
                    ->label('Confirmado em')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(TransactionStatus::class),
                Tables\Filters\SelectFilter::make('type')
                    ->options(TransactionType::class),
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        \Filament\Forms\Components\DatePicker::make('from')->label('De'),
                        \Filament\Forms\Components\DatePicker::make('until')->label('Ate'),
                    ])
                    ->query(fn ($query, $data) => $query
                        ->when($data['from'], fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
                        ->when($data['until'], fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
                    ),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->defaultSort('created_at', 'desc')
            ->poll('30s'); // Atualiza a cada 30s automaticamente
    }

    public static function canCreate(): bool
    {
        return false; // Transacoes nao sao criadas manualmente
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTransactions::route('/'),
            'view'  => Pages\ViewTransaction::route('/{record}'),
        ];
    }
}
