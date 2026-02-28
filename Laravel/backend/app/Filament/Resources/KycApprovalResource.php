<?php

namespace App\Filament\Resources;

use App\Enums\UserRole;
use App\Filament\Resources\KycApprovalResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class KycApprovalResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationIcon = 'heroicon-o-document-check';
    protected static ?string $navigationLabel = 'Aprovações KYC';
    protected static ?string $modelLabel = 'Solicitação KYC';
    protected static ?string $pluralModelLabel = 'Aprovações KYC';
    protected static ?int $navigationSort = 2;
    protected static ?string $slug = 'kyc-approvals';

    // Apenas users que tenham docs pendentes e ainda não aprovados
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->where('role', UserRole::USER->value)
            ->where('documents_checked', false)
            ->whereHas('documents');
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nome')
                    ->searchable()->sortable()
                    ->description(fn (User $u) => $u->email),

                Tables\Columns\TextColumn::make('cnpj')
                    ->label('CNPJ')->placeholder('—'),

                Tables\Columns\TextColumn::make('telefone')
                    ->label('Telefone')->placeholder('—'),

                Tables\Columns\TextColumn::make('documents_count')
                    ->label('Docs enviados')
                    ->counts('documents')
                    ->badge()->color('info'),

                Tables\Columns\TextColumn::make('pending_docs')
                    ->label('Docs pendentes')
                    ->getStateUsing(fn (User $u) => $u->documents()->where('status', 'PENDING')->count())
                    ->badge()->color('warning'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Cadastro')
                    ->dateTime('d/m/Y H:i')->sortable(),

                Tables\Columns\TextColumn::make('waiting_since')
                    ->label('Aguardando há')
                    ->getStateUsing(fn (User $u) => $u->created_at->diffForHumans()),
            ])
            ->filters([])
            ->actions([
                Tables\Actions\ViewAction::make()->label('Revisar'),
            ])
            ->defaultSort('created_at', 'asc');
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            // Dados do usuário
            Infolists\Components\Section::make('Dados do Solicitante')->schema([
                Infolists\Components\TextEntry::make('name')->label('Nome completo'),
                Infolists\Components\TextEntry::make('email')->label('E-mail')->copyable(),
                Infolists\Components\TextEntry::make('cnpj')->label('CNPJ')->placeholder('Não informado'),
                Infolists\Components\TextEntry::make('telefone')->label('Telefone')->placeholder('Não informado'),
                Infolists\Components\TextEntry::make('faturamento')->label('Faturamento declarado')->placeholder('—'),
                Infolists\Components\TextEntry::make('created_at')
                    ->label('Cadastro em')->dateTime('d/m/Y \à\s H:i'),
                Infolists\Components\TextEntry::make('waiting_since')
                    ->label('Aguardando aprovação há')
                    ->getStateUsing(fn (User $u) => $u->created_at->diffForHumans())
                    ->color('warning'),
            ])->columns(3),

            // Documentos
            Infolists\Components\Section::make('Documentos Enviados')->schema([
                Infolists\Components\RepeatableEntry::make('documents')
                    ->label('')
                    ->schema([
                        Infolists\Components\TextEntry::make('type')
                            ->label('Tipo de documento')
                            ->weight('bold'),
                        Infolists\Components\BadgeEntry::make('status')
                            ->label('Status')
                            ->color(fn (\App\Enums\DocumentStatus $state) => $state->color()),
                        Infolists\Components\TextEntry::make('mime_type')
                            ->label('Formato')->placeholder('—'),
                        Infolists\Components\TextEntry::make('file_size')
                            ->label('Tamanho')
                            ->getStateUsing(fn ($record) => $record->file_size
                                ? round($record->file_size / 1024, 1) . ' KB' : '—'),
                        Infolists\Components\TextEntry::make('created_at')
                            ->label('Enviado em')->dateTime('d/m/Y H:i'),
                        Infolists\Components\TextEntry::make('rejection_reason')
                            ->label('Motivo de rejeição')->placeholder('—')->color('danger'),
                    ])->columns(3),
            ]),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListKycApprovals::route('/'),
            'view'  => Pages\ReviewKyc::route('/{record}'),
        ];
    }
}
