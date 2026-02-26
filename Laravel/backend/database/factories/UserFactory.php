<?php

namespace Database\Factories;

use App\Enums\AcquirerType;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'username'          => fake()->unique()->userName(),
            'name'              => fake()->name(),
            'email'             => fake()->unique()->safeEmail(),
            'password'          => static::$password ??= Hash::make('password'),
            'pin'               => null,
            'telefone'          => fake()->phoneNumber(),
            'cnpj'              => null,
            'faturamento'       => null,
            'balance'           => 0,
            'role'              => UserRole::USER,
            'payment_pix'       => AcquirerType::PAGPIX,
            'cash_in_active'    => true,
            'cash_out_active'   => true,
            'checkout_active'   => false,
            'documents_checked' => true,
            'reference'         => Str::random(20),
            'ref_used'          => null,
            'pushcut_link'      => null,
            'email_verified_at' => now(),
            'remember_token'    => Str::random(10),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => UserRole::ADMIN]);
    }

    public function withPin(string $pin = '1234'): static
    {
        return $this->state(fn () => ['pin' => Hash::make($pin)]);
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }

    public function withoutDocuments(): static
    {
        return $this->state(fn () => [
            'documents_checked' => false,
            'cash_in_active'    => false,
            'cash_out_active'   => false,
        ]);
    }
}
