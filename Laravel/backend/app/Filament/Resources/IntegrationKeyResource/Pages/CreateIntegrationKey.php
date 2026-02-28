<?php

namespace App\Filament\Resources\IntegrationKeyResource\Pages;

use App\Filament\Resources\IntegrationKeyResource;
use App\Models\IntegrationKey;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

class CreateIntegrationKey extends CreateRecord
{
    protected static string $resource = IntegrationKeyResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $rawSecret = IntegrationKey::generateClientSecret();

        $data['client_id'] = IntegrationKey::generateClientId();

        // Guarda o secret raw para exibir UMA VEZ apos criacao e o hash bcrypt para armazenamento
        $data['_raw_secret']   = $rawSecret;
        $data['client_secret'] = Hash::make($rawSecret);

        return $data;
    }

    protected function handleRecordCreation(array $data): Model
    {
        // client_secret nao esta em $fillable — usamos forceFill() diretamente
        $record = (new IntegrationKey())->forceFill($data);
        $record->save();

        session()->flash('raw_secret', $data['_raw_secret'] ?? null);

        return $record;
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
