<?php

namespace Database\Factories;

use App\Models\IntegrationKey;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
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
            'client_secret' => hash('sha256', $rawSecret),
            'name'          => fake()->words(3, true),
            'description'   => fake()->sentence(),
            'domain'        => fake()->domainName(),
            'active'        => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['active' => false]);
    }
}
