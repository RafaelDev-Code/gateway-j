<?php

namespace App\Filament\Resources;

use App\Enums\AcquirerType;
use App\Enums\UserRole;
use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Hash;

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationLabel = 'Merchants';
    protected static ?string $modelLabel = 'Merchant';
    protected static ?string $pluralModelLabel = 'Merchants';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Dados Pessoais')->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Nome')
                    ->required()
                    ->maxLength(100),
                Forms\Components\TextInput::make('username')
                    ->label('Username')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(50),
                Forms\Components\TextInput::make('email')
                    ->label('Email')
                    ->email()
                    ->required()
                    ->unique(ignoreRecord: true),
                Forms\Components\TextInput::make('telefone')
                    ->label('Telefone')
                    ->maxLength(20),
                Forms\Components\TextInput::make('cnpj')
                    ->label('CNPJ')
                    ->maxLength(20),
            ])->columns(2),

            Forms\Components\Section::make('Seguranca')->schema([
                Forms\Components\TextInput::make('password')
                    ->label('Senha')
                    ->password()
                    ->dehydrateStateUsing(fn ($state) => $state ? Hash::make($state) : null)
                    ->dehydrated(fn ($state) => filled($state))
                    ->required(fn ($context) => $context === 'create'),
                Forms\Components\Select::make('role')
                    ->label('Papel')
                    ->options(UserRole::class)
                    ->required(),
            ])->columns(2),

            Forms\Components\Section::make('Configuracoes de Pagamento')->schema([
                Forms\Components\Select::make('payment_pix')
                    ->label('Adquirente')
                    ->options(AcquirerType::class)
                    ->required(),
                Forms\Components\Toggle::make('cash_in_active')
                    ->label('Cash-In Ativo'),
                Forms\Components\Toggle::make('cash_out_active')
                    ->label('Cash-Out Ativo'),
                Forms\Components\Toggle::make('documents_checked')
                    ->label('Documentos Verificados'),
            ])->columns(2),

            Forms\Components\Section::make('Taxas Individuais (opcional)')->schema([
                Forms\Components\TextInput::make('taxa_cashin_individual')
                    ->label('Taxa Cash-In (%)')
                    ->numeric()
                    ->step(0.01)
                    ->placeholder('Usa taxa global se vazio'),
                Forms\Components\TextInput::make('taxa_cashout_individual')
                    ->label('Taxa Cash-Out (%)')
                    ->numeric()
                    ->step(0.01)
                    ->placeholder('Usa taxa global se vazio'),
                Forms\Components\TextInput::make('taxa_min_individual')
                    ->label('Taxa Minima (R$)')
                    ->numeric()
                    ->step(0.01)
                    ->placeholder('Usa taxa global se vazio'),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('name')->label('Nome')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('username')->searchable(),
                Tables\Columns\TextColumn::make('email')->searchable(),
                Tables\Columns\TextColumn::make('balance')
                    ->label('Saldo')
                    ->money('BRL')
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('role')
                    ->label('Papel')
                    ->colors([
                        'danger'  => UserRole::ADMIN->value,
                        'primary' => UserRole::USER->value,
                    ]),
                Tables\Columns\IconColumn::make('cash_in_active')
                    ->label('Cash-In')
                    ->boolean(),
                Tables\Columns\IconColumn::make('cash_out_active')
                    ->label('Cash-Out')
                    ->boolean(),
                Tables\Columns\IconColumn::make('documents_checked')
                    ->label('Docs OK')
                    ->boolean(),
                Tables\Columns\BadgeColumn::make('payment_pix')
                    ->label('Adquirente'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Criado em')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('role')
                    ->options(UserRole::class),
                Tables\Filters\SelectFilter::make('payment_pix')
                    ->options(AcquirerType::class),
                Tables\Filters\TernaryFilter::make('documents_checked')
                    ->label('Documentos Verificados'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit'   => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
