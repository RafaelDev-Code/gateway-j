<?php

namespace App\Filament\Resources\UserDocumentResource\Pages;

use App\Filament\Resources\UserDocumentResource;
use Filament\Resources\Pages\ListRecords;

class ListUserDocuments extends ListRecords
{
    protected static string $resource = UserDocumentResource::class;
}
