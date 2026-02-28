<?php

namespace Database\Factories;

use App\Models\IntegrationKey;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\IntegrationKey>
 */
class IntegrationKeyFactory extends Factory
{
    protected $model = IntegrationKey::class;

    public function definition(): array
    {
        $rawSecret = Str::random(64);

        return [
            'user_id'       => User::factory(),
            'client_id'     => 'gw_' . Str::random(32),
            'client_secret' => Hash::make($rawSecret),
            'name'          => fake()->words(3, true),
            'description'   => fake()->sentence(),
            'domain'        => fake()->domainName(),
            'active'        => true,
        ];
    }

    /**
     * forceFill necessário pois client_secret não está em $fillable
     * (campo sensível protegido contra mass assignment).
     */
    public function newModel(array $attributes = []): IntegrationKey
    {
        return (new IntegrationKey())->forceFill($attributes);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['active' => false]);
    }

    /**
     * Retorna a factory com um secret bruto conhecido para uso em testes.
     */
    public function withRawSecret(string $rawSecret): static
    {
        return $this->state(fn () => [
            'client_secret' => Hash::make($rawSecret),
        ]);
    }
}
