<?php

namespace App\Filament\Resources\IntegrationKeyResource\Pages;

use App\Filament\Resources\IntegrationKeyResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListIntegrationKeys extends ListRecords
{
    protected static string $resource = IntegrationKeyResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
