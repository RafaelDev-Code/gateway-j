<?php

namespace App\Filament\Resources;

use App\Enums\AcquirerType;
use App\Filament\Resources\GatewayConfigResource\Pages;
use App\Models\GatewayConfig;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class GatewayConfigResource extends Resource
{
    protected static ?string $model = GatewayConfig::class;
    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';
    protected static ?string $navigationLabel = 'Configurações';
    protected static ?string $modelLabel = 'Configuração';
    protected static ?string $pluralModelLabel = 'Configurações';
    protected static ?int $navigationSort = 20;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Taxas Globais')->schema([
                Forms\Components\TextInput::make('tax_cashin')
                    ->label('Taxa Cash-In (%)')->numeric()->step(0.01)->required(),
                Forms\Components\TextInput::make('tax_cashout')
                    ->label('Taxa Cash-Out (%)')->numeric()->step(0.01)->required(),
                Forms\Components\TextInput::make('tax_min')
                    ->label('Taxa mínima (R$)')->numeric()->step(0.01)->required(),
                Forms\Components\TextInput::make('tax_internal')
                    ->label('Taxa transferência interna (%)')->numeric()->step(0.01)->required(),
            ])->columns(2),

            Forms\Components\Section::make('Anti-Fraude')->schema([
                Forms\Components\TextInput::make('anti_fraud_min')
                    ->label('Valor mínimo para ativar anti-fraude (R$)')
                    ->numeric()->step(0.01)->required(),
            ]),

            Forms\Components\Section::make('Aparência')->schema([
                Forms\Components\TextInput::make('gateway_name')
                    ->label('Nome do gateway')->required()->maxLength(100),
                Forms\Components\ColorPicker::make('primary_color')->label('Cor primária'),
                Forms\Components\ColorPicker::make('secondary_color')->label('Cor secundária'),
                Forms\Components\TextInput::make('logo_url')->label('URL do logo')->url()->nullable(),
                Forms\Components\TextInput::make('favicon_url')->label('URL do favicon')->url()->nullable(),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('gateway_name')->label('Nome'),
                Tables\Columns\TextColumn::make('tax_cashin')->label('Cash-In (%)')->suffix('%'),
                Tables\Columns\TextColumn::make('tax_cashout')->label('Cash-Out (%)')->suffix('%'),
                Tables\Columns\TextColumn::make('tax_min')->label('Mín. R$')->money('BRL'),
                Tables\Columns\TextColumn::make('anti_fraud_min')->label('Anti-fraude R$')->money('BRL'),
                Tables\Columns\TextColumn::make('updated_at')->label('Atualizado em')->dateTime('d/m/Y H:i'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->paginated(false);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListGatewayConfigs::route('/'),
            'edit'  => Pages\EditGatewayConfig::route('/{record}/edit'),
        ];
    }
}
