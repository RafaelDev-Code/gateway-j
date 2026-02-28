<?php

namespace App\Filament\Resources;

use App\Enums\DocumentStatus;
use App\Filament\Resources\UserDocumentResource\Pages;
use App\Models\UserDocument;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Storage;

class UserDocumentResource extends Resource
{
    protected static ?string $model = UserDocument::class;
    protected static ?string $navigationIcon  = 'heroicon-o-document-check';
    protected static ?string $navigationLabel = 'Documentos';
    protected static ?string $modelLabel      = 'Documento';
    protected static ?int $navigationSort      = 4;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('status')
                ->label('Status')
                ->options([
                    DocumentStatus::PENDING->value  => 'Pendente',
                    DocumentStatus::APPROVED->value => 'Aprovado',
                    DocumentStatus::REJECTED->value => 'Rejeitado',
                ])
                ->required(),
            Forms\Components\Textarea::make('rejection_reason')
                ->label('Motivo da rejeicao')
                ->visible(fn ($get) => $get('status') === DocumentStatus::REJECTED->value)
                ->required(fn ($get) => $get('status') === DocumentStatus::REJECTED->value),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.username')
                    ->label('Merchant')
                    ->searchable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Tipo'),
                Tables\Columns\TextColumn::make('mime_type')
                    ->label('MIME')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('file_size')
                    ->label('Tamanho')
                    ->formatStateUsing(fn ($state) => $state ? number_format($state / 1024, 1) . ' KB' : '-')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Status')
                    ->colors([
                        'warning' => DocumentStatus::PENDING->value,
                        'success' => DocumentStatus::APPROVED->value,
                        'danger'  => DocumentStatus::REJECTED->value,
                    ]),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Enviado em')
                    ->dateTime('d/m/Y H:i'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        DocumentStatus::PENDING->value  => 'Pendente',
                        DocumentStatus::APPROVED->value => 'Aprovado',
                        DocumentStatus::REJECTED->value => 'Rejeitado',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('view_document')
                    ->label('Visualizar')
                    ->icon('heroicon-o-eye')
                    ->color('info')
                    ->action(function (UserDocument $record) {
                        if (! $record->file_path) {
                            Notification::make()
                                ->title('Arquivo nao encontrado')
                                ->danger()
                                ->send();
                            return;
                        }

                        $url = Storage::disk('private')->temporaryUrl(
                            $record->file_path,
                            now()->addMinutes(5)
                        );

                        redirect($url);
                    })
                    ->openUrlInNewTab(),
                Tables\Actions\Action::make('approve')
                    ->label('Aprovar')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(function (UserDocument $record) {
                        $record->forceFill([
                            'status'      => DocumentStatus::APPROVED,
                            'reviewed_by' => auth()->id(),
                            'reviewed_at' => now(),
                        ])->save();

                        Notification::make()
                            ->title('Documento aprovado')
                            ->success()
                            ->send();
                    })
                    ->visible(fn (UserDocument $record) => $record->status === DocumentStatus::PENDING),
                Tables\Actions\Action::make('reject')
                    ->label('Rejeitar')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->form([
                        Forms\Components\Textarea::make('rejection_reason')
                            ->label('Motivo da rejeicao')
                            ->required(),
                    ])
                    ->action(function (UserDocument $record, array $data) {
                        $record->forceFill([
                            'status'           => DocumentStatus::REJECTED,
                            'rejection_reason' => $data['rejection_reason'],
                            'reviewed_by'      => auth()->id(),
                            'reviewed_at'      => now(),
                        ])->save();

                        Notification::make()
                            ->title('Documento rejeitado')
                            ->warning()
                            ->send();
                    })
                    ->visible(fn (UserDocument $record) => $record->status === DocumentStatus::PENDING),
                Tables\Actions\EditAction::make()->label('Editar'),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUserDocuments::route('/'),
            'edit'  => Pages\EditUserDocument::route('/{record}/edit'),
        ];
    }
}
