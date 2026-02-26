<?php

namespace App\Filament\Resources\IntegrationKeyResource\Pages;

use App\Filament\Resources\IntegrationKeyResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditIntegrationKey extends EditRecord
{
    protected static string $resource = IntegrationKeyResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }
}
