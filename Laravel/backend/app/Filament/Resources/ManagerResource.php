<?php

namespace App\Filament\Resources;

use App\Enums\UserRole;
use App\Filament\Resources\ManagerResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Hash;

class ManagerResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationIcon = 'heroicon-o-user-group';
    protected static ?string $navigationLabel = 'Gerentes';
    protected static ?string $modelLabel = 'Gerente';
    protected static ?string $pluralModelLabel = 'Gerentes';
    protected static ?int $navigationSort = 10;
    protected static ?string $slug = 'managers';

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('role', UserRole::MANAGER->value);
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Dados do Gerente')->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Nome completo')->required()->maxLength(100),
                Forms\Components\TextInput::make('username')
                    ->label('Username')->required()->unique(ignoreRecord: true)->maxLength(50),
                Forms\Components\TextInput::make('email')
                    ->label('E-mail')->email()->required()->unique(ignoreRecord: true),
                Forms\Components\TextInput::make('telefone')
                    ->label('Telefone')->maxLength(20),
            ])->columns(2),

            Forms\Components\Section::make('Acesso')->schema([
                Forms\Components\TextInput::make('password')
                    ->label('Senha')->password()
                    ->dehydrateStateUsing(fn ($s) => $s ? Hash::make($s) : null)
                    ->dehydrated(fn ($s) => filled($s))
                    ->required(fn ($ctx) => $ctx === 'create'),
                Forms\Components\Hidden::make('role')->default(UserRole::MANAGER->value),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nome')->searchable()->sortable()
                    ->description(fn (User $u) => $u->email),
                Tables\Columns\TextColumn::make('username')->label('Username')->searchable(),
                Tables\Columns\TextColumn::make('telefone')->label('Telefone')->placeholder('—'),
                Tables\Columns\TextColumn::make('managed_users_count')
                    ->label('Merchants gerenciados')
                    ->counts('managedUsers')
                    ->badge()->color('info'),
                Tables\Columns\TextColumn::make('last_login_at')
                    ->label('Último acesso')->dateTime('d/m/Y H:i')->placeholder('Nunca'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Criado em')->dateTime('d/m/Y')->sortable(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Section::make('Perfil do Gerente')->schema([
                Infolists\Components\TextEntry::make('name')->label('Nome'),
                Infolists\Components\TextEntry::make('username')->label('Username'),
                Infolists\Components\TextEntry::make('email')->label('E-mail')->copyable(),
                Infolists\Components\TextEntry::make('telefone')->label('Telefone')->placeholder('—'),
                Infolists\Components\TextEntry::make('last_login_at')
                    ->label('Último acesso')->dateTime('d/m/Y H:i')->placeholder('Nunca'),
                Infolists\Components\TextEntry::make('created_at')
                    ->label('Criado em')->dateTime('d/m/Y H:i'),
            ])->columns(3),

            Infolists\Components\Section::make('Merchants sob responsabilidade')->schema([
                Infolists\Components\RepeatableEntry::make('managedUsers')
                    ->label('')
                    ->schema([
                        Infolists\Components\TextEntry::make('name')->label('Nome'),
                        Infolists\Components\TextEntry::make('email')->label('E-mail'),
                        Infolists\Components\TextEntry::make('balance')->label('Saldo')->money('BRL'),
                        Infolists\Components\IconEntry::make('documents_checked')->label('KYC')->boolean(),
                    ])->columns(4),
            ]),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListManagers::route('/'),
            'create' => Pages\CreateManager::route('/create'),
            'edit'   => Pages\EditManager::route('/{record}/edit'),
            'view'   => Pages\ViewManager::route('/{record}'),
        ];
    }
}
