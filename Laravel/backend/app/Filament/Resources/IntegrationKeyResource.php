<?php

namespace App\Filament\Resources;

use App\Filament\Resources\IntegrationKeyResource\Pages;
use App\Models\IntegrationKey;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class IntegrationKeyResource extends Resource
{
    protected static ?string $model = IntegrationKey::class;
    protected static ?string $navigationIcon  = 'heroicon-o-key';
    protected static ?string $navigationLabel = 'Chaves de API';
    protected static ?string $modelLabel      = 'Chave de API';
    protected static ?int $navigationSort     = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('user_id')
                ->label('Merchant')
                ->relationship('user', 'username')
                ->searchable()
                ->required(),
            Forms\Components\TextInput::make('name')
                ->label('Nome da integracao')
                ->required(),
            Forms\Components\TextInput::make('description')
                ->label('Descricao'),
            Forms\Components\TextInput::make('domain')
                ->label('Dominio autorizado'),
            Forms\Components\Toggle::make('active')
                ->label('Ativa')
                ->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.username')->label('Merchant')->searchable(),
                Tables\Columns\TextColumn::make('client_id')->label('Client ID')->copyable(),
                Tables\Columns\TextColumn::make('name')->label('Nome'),
                Tables\Columns\TextColumn::make('domain')->label('Dominio'),
                Tables\Columns\IconColumn::make('active')->label('Ativa')->boolean(),
                Tables\Columns\TextColumn::make('created_at')->label('Criado em')->dateTime('d/m/Y'),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('active')->label('Ativas'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListIntegrationKeys::route('/'),
            'create' => Pages\CreateIntegrationKey::route('/create'),
            'edit'   => Pages\EditIntegrationKey::route('/{record}/edit'),
        ];
    }
}
