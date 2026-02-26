<?php

namespace App\Filament\Resources\IntegrationKeyResource\Pages;

use App\Filament\Resources\IntegrationKeyResource;
use App\Models\IntegrationKey;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Facades\Notification;

class CreateIntegrationKey extends CreateRecord
{
    protected static string $resource = IntegrationKeyResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $rawSecret = IntegrationKey::generateClientSecret();

        // Salva secret hashado
        $data['client_id']     = IntegrationKey::generateClientId();
        $data['client_secret'] = hash('sha256', $rawSecret);

        // Guarda o secret raw para exibir UMA VEZ apos criacao
        session()->flash('raw_secret', $rawSecret);

        return $data;
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
