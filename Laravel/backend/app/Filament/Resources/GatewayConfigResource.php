<?php

namespace App\Filament\Resources;

use App\Filament\Resources\GatewayConfigResource\Pages;
use App\Models\GatewayConfig;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class GatewayConfigResource extends Resource
{
    protected static ?string $model = GatewayConfig::class;
    protected static ?string $navigationIcon  = 'heroicon-o-cog-6-tooth';
    protected static ?string $navigationLabel = 'Configuracoes';
    protected static ?string $modelLabel      = 'Configuracao';
    protected static ?int $navigationSort     = 10;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Taxas Globais')->schema([
                Forms\Components\TextInput::make('tax_cashin')
                    ->label('Taxa Cash-In (%)')
                    ->numeric()
                    ->step(0.01)
                    ->required(),
                Forms\Components\TextInput::make('tax_cashout')
                    ->label('Taxa Cash-Out (%)')
                    ->numeric()
                    ->step(0.01)
                    ->required(),
                Forms\Components\TextInput::make('tax_min')
                    ->label('Taxa Minima (R$)')
                    ->numeric()
                    ->step(0.01)
                    ->required(),
                Forms\Components\TextInput::make('tax_internal')
                    ->label('Taxa Transferencia Interna (%)')
                    ->numeric()
                    ->step(0.01),
            ])->columns(2),

            Forms\Components\Section::make('Anti-Fraude')->schema([
                Forms\Components\TextInput::make('anti_fraud_min')
                    ->label('Valor minimo para ativar anti-fraude (R$)')
                    ->helperText('0 = desativado')
                    ->numeric()
                    ->step(0.01),
            ]),

            Forms\Components\Section::make('Visual (usado pelo React frontend)')->schema([
                Forms\Components\TextInput::make('gateway_name')
                    ->label('Nome do Gateway'),
                Forms\Components\ColorPicker::make('primary_color')
                    ->label('Cor primaria'),
                Forms\Components\ColorPicker::make('secondary_color')
                    ->label('Cor secundaria'),
                Forms\Components\TextInput::make('logo_url')
                    ->label('URL do Logo')
                    ->url()
                    ->maxLength(500),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('tax_cashin')->label('Cash-In %'),
                Tables\Columns\TextColumn::make('tax_cashout')->label('Cash-Out %'),
                Tables\Columns\TextColumn::make('tax_min')->label('Taxa Min R$'),
                Tables\Columns\TextColumn::make('anti_fraud_min')->label('Anti-Fraude R$'),
                Tables\Columns\TextColumn::make('updated_at')->label('Atualizado')->dateTime('d/m/Y H:i'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ]);
    }

    public static function canCreate(): bool
    {
        return GatewayConfig::count() === 0;
    }

    public static function canDelete(\Illuminate\Database\Eloquent\Model $record): bool
    {
        return false; // Config nao pode ser deletada
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListGatewayConfigs::route('/'),
            'edit'  => Pages\EditGatewayConfig::route('/{record}/edit'),
        ];
    }
}
