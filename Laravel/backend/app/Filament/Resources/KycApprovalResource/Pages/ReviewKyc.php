<?php

namespace App\Filament\Resources\KycApprovalResource\Pages;

use App\Enums\DocumentStatus;
use App\Enums\UserRole;
use App\Filament\Resources\KycApprovalResource;
use App\Models\User;
use App\Models\UserDocument;
use Filament\Actions;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ReviewKyc extends ViewRecord
{
    protected static string $resource = KycApprovalResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // Aprovar tudo
            Actions\Action::make('approve_all')
                ->label('✅ Aprovar Conta')
                ->icon('heroicon-o-check-badge')
                ->color('success')
                ->requiresConfirmation()
                ->modalHeading('Aprovar todos os documentos?')
                ->modalDescription('Isso irá aprovar todos os documentos pendentes e liberar o acesso do merchant.')
                ->form([
                    Forms\Components\Select::make('manager_id')
                        ->label('Atribuir Gerente (opcional)')
                        ->options(fn () => User::where('role', UserRole::MANAGER->value)
                            ->pluck('name', 'id'))
                        ->searchable()
                        ->nullable(),
                ])
                ->action(function (array $data) {
                    /** @var User $user */
                    $user = $this->record;

                    $user->documents()
                        ->where('status', DocumentStatus::PENDING->value)
                        ->update([
                            'status'      => DocumentStatus::APPROVED->value,
                            'reviewed_by' => auth()->id(),
                            'reviewed_at' => now(),
                        ]);

                    $user->update([
                        'documents_checked' => true,
                        'cash_in_active'    => true,
                        'manager_id'        => $data['manager_id'] ?? null,
                    ]);

                    Notification::make()
                        ->title("Merchant {$user->name} aprovado!")
                        ->success()->send();

                    $this->redirect(KycApprovalResource::getUrl());
                }),

            // Rejeitar documento específico
            Actions\Action::make('reject_doc')
                ->label('❌ Rejeitar Documento')
                ->icon('heroicon-o-x-circle')
                ->color('danger')
                ->form([
                    Forms\Components\Select::make('document_id')
                        ->label('Selecione o documento')
                        ->options(fn () => $this->record->documents()
                            ->where('status', DocumentStatus::PENDING->value)
                            ->get()
                            ->mapWithKeys(fn (UserDocument $d) => [$d->id => $d->type]))
                        ->required(),
                    Forms\Components\Textarea::make('rejection_reason')
                        ->label('Motivo da rejeição')
                        ->required()
                        ->placeholder('Ex: CNPJ ilegível, por favor reenvie com melhor qualidade.')
                        ->rows(3),
                ])
                ->action(function (array $data) {
                    UserDocument::findOrFail($data['document_id'])
                        ->forceFill([
                            'status'           => DocumentStatus::REJECTED,
                            'rejection_reason' => $data['rejection_reason'],
                            'reviewed_by'      => auth()->id(),
                            'reviewed_at'      => now(),
                        ])->save();

                    Notification::make()
                        ->title('Documento rejeitado. O merchant será notificado.')
                        ->warning()->send();

                    $this->refreshFormData([]);
                })
                ->visible(fn () => $this->record->documents()
                    ->where('status', DocumentStatus::PENDING->value)->exists()),

            // Rejeitar conta inteiramente
            Actions\Action::make('reject_all')
                ->label('Rejeitar Conta')
                ->icon('heroicon-o-no-symbol')
                ->color('gray')
                ->requiresConfirmation()
                ->form([
                    Forms\Components\Textarea::make('rejection_reason')
                        ->label('Motivo da rejeição geral')
                        ->required()->rows(3),
                ])
                ->action(function (array $data) {
                    $user = $this->record;
                    $user->documents()
                        ->where('status', DocumentStatus::PENDING->value)
                        ->update([
                            'status'           => DocumentStatus::REJECTED->value,
                            'rejection_reason' => $data['rejection_reason'],
                            'reviewed_by'      => auth()->id(),
                            'reviewed_at'      => now(),
                        ]);

                    Notification::make()
                        ->title("Conta de {$user->name} rejeitada.")
                        ->danger()->send();

                    $this->redirect(KycApprovalResource::getUrl());
                }),

            // WhatsApp
            Actions\Action::make('whatsapp')
                ->label('WhatsApp')
                ->icon('heroicon-o-chat-bubble-left-right')
                ->color('success')
                ->url(fn () => 'https://wa.me/55' . preg_replace('/\D/', '', $this->record->telefone ?? ''))
                ->openUrlInNewTab()
                ->visible(fn () => filled($this->record->telefone)),
        ];
    }
}
