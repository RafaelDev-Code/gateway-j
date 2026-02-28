<?php

namespace App\Filament\Pages;

use App\Enums\AcquirerType;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class AcquirersPage extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-building-library';
    protected static ?string $navigationLabel = 'Adquirentes';
    protected static ?int $navigationSort = 21;
    protected static string $view = 'filament.pages.acquirers';
    protected static ?string $title = 'Adquirentes';

    public array $acquirers = [];

    public function mount(): void
    {
        $this->acquirers = collect(AcquirerType::cases())->mapWithKeys(function (AcquirerType $type) {
            $key = $type->configKey();
            return [$type->value => [
                'name'   => $type->label(),
                'key'    => $type->value,
                'active' => config("acquirers.{$key}.active", false),
                'url'    => config("acquirers.{$key}.url", ''),
                'api_key'=> config("acquirers.{$key}.key", config("acquirers.{$key}.client_id", '')),
            ]];
        })->toArray();
    }

    public function getAcquirerStats(): array
    {
        return collect(AcquirerType::cases())->map(function (AcquirerType $type) {
            $userCount = \App\Models\User::where('payment_pix', $type->value)->count();
            return [
                'name'       => $type->label(),
                'value'      => $type->value,
                'active'     => $type->isActive(),
                'user_count' => $userCount,
            ];
        })->toArray();
    }
}
