<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Enums\AcquirerType;
use App\Filament\Resources\UserResource;
use App\Models\User;
use Filament\Actions;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewUser extends ViewRecord
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // Botão editar
            Actions\EditAction::make(),

            // Trocar adquirente
            Actions\Action::make('change_acquirer')
                ->label('Trocar Adquirente')
                ->icon('heroicon-o-arrows-right-left')
                ->color('warning')
                ->form([
                    Forms\Components\Select::make('payment_pix')
                        ->label('Nova Adquirente')
                        ->options(\App\Enums\AcquirerType::class)
                        ->required()
                        ->default(fn () => $this->record->payment_pix->value),
                ])
                ->action(function (array $data) {
                    $this->record->update(['payment_pix' => $data['payment_pix']]);
                    Notification::make()->title('Adquirente atualizada com sucesso.')->success()->send();
                    $this->refreshFormData(['payment_pix']);
                }),

            // Permissões rápidas
            Actions\Action::make('permissions')
                ->label('Permissões')
                ->icon('heroicon-o-shield-check')
                ->color('info')
                ->form([
                    Forms\Components\Toggle::make('cash_in_active')
                        ->label('Cash-In ativo')
                        ->default(fn () => $this->record->cash_in_active),
                    Forms\Components\Toggle::make('cash_out_active')
                        ->label('Cash-Out ativo')
                        ->default(fn () => $this->record->cash_out_active),
                    Forms\Components\Toggle::make('checkout_active')
                        ->label('Checkout ativo')
                        ->default(fn () => $this->record->checkout_active),
                    Forms\Components\Toggle::make('documents_checked')
                        ->label('KYC aprovado')
                        ->default(fn () => $this->record->documents_checked),
                    Forms\Components\Toggle::make('blocked_credentials')
                        ->label('Bloquear credenciais de API')
                        ->default(fn () => $this->record->blocked_credentials),
                    Forms\Components\TextInput::make('auto_cashout_limit')
                        ->label('Limite saque automático (R$)')
                        ->numeric()->step(0.01)->minValue(0)
                        ->placeholder('Deixe vazio para desativar')
                        ->default(fn () => $this->record->auto_cashout_limit),
                ])
                ->action(function (array $data) {
                    $this->record->update([
                        'cash_in_active'      => $data['cash_in_active'],
                        'cash_out_active'     => $data['cash_out_active'],
                        'checkout_active'     => $data['checkout_active'],
                        'documents_checked'   => $data['documents_checked'],
                        'blocked_credentials' => $data['blocked_credentials'],
                        'auto_cashout_limit'  => $data['auto_cashout_limit'] ?: null,
                    ]);
                    Notification::make()->title('Permissões atualizadas.')->success()->send();
                }),

            // Ban / Desbanir
            Actions\Action::make('ban')
                ->label(fn () => $this->record->isBanned() ? 'Desbanir Conta' : 'Banir Conta')
                ->icon(fn () => $this->record->isBanned() ? 'heroicon-o-check-circle' : 'heroicon-o-no-symbol')
                ->color(fn () => $this->record->isBanned() ? 'success' : 'danger')
                ->requiresConfirmation()
                ->form(fn () => $this->record->isBanned() ? [] : [
                    Forms\Components\Textarea::make('ban_reason')
                        ->label('Motivo do banimento')->required()->rows(3),
                ])
                ->action(function (array $data) {
                    if ($this->record->isBanned()) {
                        $this->record->update(['banned_at' => null, 'ban_reason' => null]);
                        Notification::make()->title('Conta desbanida.')->success()->send();
                    } else {
                        $this->record->update([
                            'banned_at'  => now(),
                            'ban_reason' => $data['ban_reason'],
                        ]);
                        Notification::make()->title('Conta banida.')->warning()->send();
                    }
                })
                ->visible(fn () => ! $this->record->isAdmin()),

            // Link WhatsApp
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
