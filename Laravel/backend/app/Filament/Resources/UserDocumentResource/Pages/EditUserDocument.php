<?php

namespace App\Filament\Resources\UserDocumentResource\Pages;

use App\Filament\Resources\UserDocumentResource;
use Filament\Resources\Pages\EditRecord;

class EditUserDocument extends EditRecord
{
    protected static string $resource = UserDocumentResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $data['reviewed_by'] = auth()->id();
        $data['reviewed_at'] = now();
        return $data;
    }
}
