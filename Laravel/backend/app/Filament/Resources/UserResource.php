<?php

namespace App\Filament\Resources;

use App\Enums\AcquirerType;
use App\Enums\UserRole;
use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Number;

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationLabel = 'Merchants';
    protected static ?string $modelLabel = 'Merchant';
    protected static ?string $pluralModelLabel = 'Merchants';
    protected static ?int $navigationSort = 1;

    // -------------------------------------------------------------------------
    // FORM (create / edit)
    // -------------------------------------------------------------------------
    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Dados Pessoais')->schema([
                Forms\Components\TextInput::make('name')
                    ->label('Nome completo')->required()->maxLength(100),
                Forms\Components\TextInput::make('username')
                    ->label('Username')->required()->unique(ignoreRecord: true)->maxLength(50),
                Forms\Components\TextInput::make('email')
                    ->label('E-mail')->email()->required()->unique(ignoreRecord: true),
                Forms\Components\TextInput::make('telefone')
                    ->label('Telefone')->maxLength(20),
                Forms\Components\TextInput::make('cnpj')
                    ->label('CNPJ')->maxLength(20),
                Forms\Components\TextInput::make('faturamento')
                    ->label('Faturamento mensal declarado')->maxLength(50),
            ])->columns(2),

            Forms\Components\Section::make('Segurança')->schema([
                Forms\Components\TextInput::make('password')
                    ->label('Senha')->password()
                    ->dehydrateStateUsing(fn ($s) => $s ? Hash::make($s) : null)
                    ->dehydrated(fn ($s) => filled($s))
                    ->required(fn ($ctx) => $ctx === 'create'),
                Forms\Components\Select::make('role')
                    ->label('Papel')->options(UserRole::class)->required(),
            ])->columns(2),

            Forms\Components\Section::make('Configurações de Pagamento')->schema([
                Forms\Components\Select::make('payment_pix')
                    ->label('Adquirente')->options(AcquirerType::class)->required(),
                Forms\Components\Toggle::make('cash_in_active')->label('Cash-In ativo'),
                Forms\Components\Toggle::make('cash_out_active')->label('Cash-Out ativo'),
                Forms\Components\Toggle::make('checkout_active')->label('Checkout ativo'),
                Forms\Components\Toggle::make('documents_checked')->label('Documentos verificados'),
                Forms\Components\Toggle::make('blocked_credentials')->label('Credenciais bloqueadas'),
            ])->columns(2),

            Forms\Components\Section::make('Saque Automático')->schema([
                Forms\Components\TextInput::make('auto_cashout_limit')
                    ->label('Limite de saque automático (R$)')
                    ->numeric()->step(0.01)->minValue(0)
                    ->placeholder('Deixe vazio para desativar'),
            ])->columns(1),

            Forms\Components\Section::make('Taxas Individuais')->schema([
                Forms\Components\TextInput::make('taxa_cashin_individual')
                    ->label('Taxa Cash-In (%)')->numeric()->step(0.01)
                    ->placeholder('Usa taxa global se vazio'),
                Forms\Components\TextInput::make('taxa_cashout_individual')
                    ->label('Taxa Cash-Out (%)')->numeric()->step(0.01)
                    ->placeholder('Usa taxa global se vazio'),
                Forms\Components\TextInput::make('taxa_min_individual')
                    ->label('Taxa mínima (R$)')->numeric()->step(0.01)
                    ->placeholder('Usa taxa global se vazio'),
            ])->columns(3),

            Forms\Components\Section::make('Gerente')->schema([
                Forms\Components\Select::make('manager_id')
                    ->label('Gerente responsável')
                    ->relationship(
                        name: 'manager',
                        titleAttribute: 'name',
                        modifyQueryUsing: fn (Builder $q) => $q->where('role', UserRole::MANAGER->value),
                    )
                    ->searchable()->preload()->nullable(),
            ]),
        ]);
    }

    // -------------------------------------------------------------------------
    // TABLE
    // -------------------------------------------------------------------------
    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')->sortable()->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('name')
                    ->label('Nome')->searchable()->sortable()
                    ->description(fn (User $u) => $u->email),

                Tables\Columns\TextColumn::make('cnpj')
                    ->label('CNPJ')->searchable()->toggleable(),

                Tables\Columns\TextColumn::make('balance')
                    ->label('Saldo')->money('BRL')->sortable()
                    ->color(fn (User $u) => $u->balance > 0 ? 'success' : 'gray'),

                Tables\Columns\TextColumn::make('transactions_sum_amount')
                    ->label('Faturamento total')
                    ->money('BRL')
                    ->sortable()
                    ->toggleable()
                    ->getStateUsing(fn (User $u) => $u->transactions()
                        ->where('status', 'PAID')->where('type', 'DEPOSIT')->sum('amount')),

                Tables\Columns\BadgeColumn::make('role')
                    ->label('Papel')
                    ->color(fn (UserRole $state) => $state->color()),

                Tables\Columns\BadgeColumn::make('payment_pix')
                    ->label('Adquirente')
                    ->color('info'),

                Tables\Columns\IconColumn::make('cash_in_active')
                    ->label('Cash-In')->boolean(),
                Tables\Columns\IconColumn::make('cash_out_active')
                    ->label('Cash-Out')->boolean(),
                Tables\Columns\IconColumn::make('documents_checked')
                    ->label('KYC')->boolean(),

                Tables\Columns\TextColumn::make('last_login_at')
                    ->label('Último acesso')->dateTime('d/m/Y H:i')
                    ->sortable()->toggleable()->placeholder('Nunca'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Cadastro')->dateTime('d/m/Y')->sortable(),

                Tables\Columns\IconColumn::make('banned_at')
                    ->label('Banido')
                    ->boolean()
                    ->trueIcon('heroicon-o-no-symbol')
                    ->falseIcon('heroicon-o-check-circle')
                    ->trueColor('danger')
                    ->falseColor('success')
                    ->getStateUsing(fn (User $u) => ! is_null($u->banned_at)),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('role')->options(UserRole::class),
                Tables\Filters\SelectFilter::make('payment_pix')->label('Adquirente')->options(AcquirerType::class),
                Tables\Filters\TernaryFilter::make('documents_checked')->label('KYC aprovado'),
                Tables\Filters\Filter::make('banned')
                    ->label('Banidos')
                    ->query(fn (Builder $q) => $q->whereNotNull('banned_at')),
                Tables\Filters\Filter::make('active')
                    ->label('Ativos (não banidos)')
                    ->query(fn (Builder $q) => $q->whereNull('banned_at'))
                    ->default(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()->label('Perfil'),
                Tables\Actions\EditAction::make(),

                Tables\Actions\Action::make('ban')
                    ->label(fn (User $u) => $u->isBanned() ? 'Desbanir' : 'Banir')
                    ->icon(fn (User $u) => $u->isBanned() ? 'heroicon-o-check-circle' : 'heroicon-o-no-symbol')
                    ->color(fn (User $u) => $u->isBanned() ? 'success' : 'danger')
                    ->requiresConfirmation()
                    ->form(fn (User $u) => $u->isBanned() ? [] : [
                        Forms\Components\Textarea::make('ban_reason')
                            ->label('Motivo do banimento')->required()->rows(3),
                    ])
                    ->action(function (User $record, array $data) {
                        if ($record->isBanned()) {
                            $record->update(['banned_at' => null, 'ban_reason' => null]);
                            Notification::make()->title('Usuário desbanido com sucesso.')->success()->send();
                        } else {
                            $record->update(['banned_at' => now(), 'ban_reason' => $data['ban_reason']]);
                            Notification::make()->title('Usuário banido.')->warning()->send();
                        }
                    })
                    ->visible(fn (User $u) => ! $u->isAdmin()),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    // -------------------------------------------------------------------------
    // INFOLIST (view / perfil completo)
    // -------------------------------------------------------------------------
    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            // Status de banimento
            Infolists\Components\Section::make()
                ->schema([
                    Infolists\Components\TextEntry::make('banned_at')
                        ->label('⛔ CONTA BANIDA')
                        ->dateTime('d/m/Y H:i')
                        ->color('danger')
                        ->weight('bold')
                        ->visible(fn (User $u) => $u->isBanned()),
                    Infolists\Components\TextEntry::make('ban_reason')
                        ->label('Motivo')
                        ->color('danger')
                        ->visible(fn (User $u) => $u->isBanned()),
                ])
                ->visible(fn (User $u) => $u->isBanned())
                ->extraAttributes(['class' => 'bg-red-50 border border-red-200']),

            // KPIs financeiros
            Infolists\Components\Section::make('Resumo Financeiro')->schema([
                Infolists\Components\TextEntry::make('balance')
                    ->label('Saldo atual')
                    ->money('BRL')
                    ->size(Infolists\Components\TextEntry\TextEntrySize::Large)
                    ->weight('bold')
                    ->color('success'),
                Infolists\Components\TextEntry::make('total_revenue')
                    ->label('Faturamento total')
                    ->money('BRL')
                    ->size(Infolists\Components\TextEntry\TextEntrySize::Large)
                    ->weight('bold')
                    ->getStateUsing(fn (User $u) => $u->totalRevenue()),
                Infolists\Components\TextEntry::make('average_ticket')
                    ->label('Ticket médio')
                    ->money('BRL')
                    ->getStateUsing(fn (User $u) => $u->averageTicket()),
                Infolists\Components\TextEntry::make('transactions_count')
                    ->label('Total de transações')
                    ->getStateUsing(fn (User $u) => $u->transactions()
                        ->where('status', 'PAID')->count() . ' pagas'),
            ])->columns(4),

            // Dados pessoais
            Infolists\Components\Section::make('Dados do Merchant')->schema([
                Infolists\Components\TextEntry::make('name')->label('Nome completo'),
                Infolists\Components\TextEntry::make('username')->label('Username'),
                Infolists\Components\TextEntry::make('email')->label('E-mail')
                    ->copyable(),
                Infolists\Components\TextEntry::make('telefone')->label('Telefone')
                    ->placeholder('Não informado'),
                Infolists\Components\TextEntry::make('cnpj')->label('CNPJ')
                    ->placeholder('Não informado'),
                Infolists\Components\TextEntry::make('faturamento')->label('Faturamento declarado')
                    ->placeholder('Não informado'),
                Infolists\Components\TextEntry::make('reference')->label('Código de referência')
                    ->placeholder('—')
                    ->copyable(),
                Infolists\Components\TextEntry::make('ref_used')->label('Indicado por')
                    ->placeholder('—'),
            ])->columns(3),

            // Timeline
            Infolists\Components\Section::make('Histórico')->schema([
                Infolists\Components\TextEntry::make('created_at')
                    ->label('Data de cadastro')->dateTime('d/m/Y \à\s H:i'),
                Infolists\Components\TextEntry::make('email_verified_at')
                    ->label('E-mail verificado em')->dateTime('d/m/Y \à\s H:i')
                    ->placeholder('Não verificado')
                    ->color(fn ($state) => $state ? 'success' : 'warning'),
                Infolists\Components\TextEntry::make('last_login_at')
                    ->label('Último acesso')->dateTime('d/m/Y \à\s H:i')
                    ->placeholder('Nunca acessou'),
                Infolists\Components\TextEntry::make('last_transaction_date')
                    ->label('Última transação')
                    ->getStateUsing(fn (User $u) => optional($u->lastTransaction())->created_at)
                    ->dateTime('d/m/Y \à\s H:i')
                    ->placeholder('Nenhuma transação'),
            ])->columns(4),

            // Status e permissões
            Infolists\Components\Section::make('Status & Permissões')->schema([
                Infolists\Components\BadgeEntry::make('role')
                    ->label('Papel')
                    ->color(fn (UserRole $state) => $state->color()),
                Infolists\Components\BadgeEntry::make('payment_pix')
                    ->label('Adquirente')->color('info'),
                Infolists\Components\IconEntry::make('cash_in_active')
                    ->label('Cash-In ativo')->boolean(),
                Infolists\Components\IconEntry::make('cash_out_active')
                    ->label('Cash-Out ativo')->boolean(),
                Infolists\Components\IconEntry::make('checkout_active')
                    ->label('Checkout ativo')->boolean(),
                Infolists\Components\IconEntry::make('documents_checked')
                    ->label('KYC aprovado')->boolean(),
                Infolists\Components\IconEntry::make('blocked_credentials')
                    ->label('Credenciais bloqueadas')
                    ->boolean()
                    ->trueIcon('heroicon-o-no-symbol')
                    ->falseIcon('heroicon-o-check-circle')
                    ->trueColor('danger')
                    ->falseColor('success'),
                Infolists\Components\TextEntry::make('auto_cashout_limit')
                    ->label('Limite saque automático')
                    ->money('BRL')
                    ->placeholder('Desativado'),
            ])->columns(4),

            // Taxas individuais
            Infolists\Components\Section::make('Taxas Individuais')->schema([
                Infolists\Components\TextEntry::make('taxa_cashin_individual')
                    ->label('Taxa Cash-In')->suffix('%')->placeholder('Usa global'),
                Infolists\Components\TextEntry::make('taxa_cashout_individual')
                    ->label('Taxa Cash-Out')->suffix('%')->placeholder('Usa global'),
                Infolists\Components\TextEntry::make('taxa_min_individual')
                    ->label('Taxa mínima (R$)')->money('BRL')->placeholder('Usa global'),
            ])->columns(3),

            // Gerente
            Infolists\Components\Section::make('Gerente Responsável')->schema([
                Infolists\Components\TextEntry::make('manager.name')
                    ->label('Nome')->placeholder('Sem gerente atribuído'),
                Infolists\Components\TextEntry::make('manager.email')
                    ->label('E-mail')->placeholder('—'),
            ])->columns(2),

            // Documentos
            Infolists\Components\Section::make('Documentos KYC')->schema([
                Infolists\Components\RepeatableEntry::make('documents')
                    ->label('')
                    ->schema([
                        Infolists\Components\TextEntry::make('type')->label('Tipo'),
                        Infolists\Components\BadgeEntry::make('status')
                            ->label('Status')
                            ->color(fn (\App\Enums\DocumentStatus $state) => $state->color()),
                        Infolists\Components\TextEntry::make('rejection_reason')
                            ->label('Motivo rejeição')->placeholder('—'),
                        Infolists\Components\TextEntry::make('created_at')
                            ->label('Enviado em')->dateTime('d/m/Y H:i'),
                    ])->columns(4),
            ]),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit'   => Pages\EditUser::route('/{record}/edit'),
            'view'   => Pages\ViewUser::route('/{record}'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('role', '!=', UserRole::ADMIN->value);
    }
}
