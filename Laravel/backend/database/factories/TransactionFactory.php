<?php

namespace Database\Factories;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        $amount = fake()->randomFloat(2, 10, 5000);
        $tax    = round($amount * 0.015, 2);

        return [
            'id'             => strtoupper(Str::random(20)),
            'end2end'        => null,
            'external_id'    => Str::uuid()->toString(),
            'user_id'        => User::factory(),
            'amount'         => $amount,
            'tax'            => $tax,
            'status'         => TransactionStatus::PENDING,
            'type'           => TransactionType::DEPOSIT,
            'nome'           => fake()->name(),
            'document'       => fake()->numerify('###########'),
            'descricao'      => fake()->sentence(),
            'postback_url'   => null,
            'postback_status'=> 'PENDING',
            'is_api'         => true,
            'is_internal'    => false,
            'confirmed_at'   => null,
        ];
    }

    public function paid(): static
    {
        return $this->state(fn () => [
            'status'       => TransactionStatus::PAID,
            'confirmed_at' => now(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => ['status' => TransactionStatus::CANCELLED]);
    }

    public function deposit(): static
    {
        return $this->state(fn () => ['type' => TransactionType::DEPOSIT]);
    }

    public function withdrawal(): static
    {
        return $this->state(fn () => ['type' => TransactionType::WITHDRAW]);
    }

    public function withPostback(?string $url = null): static
    {
        return $this->state(fn () => [
            'postback_url' => $url ?? fake()->url(),
        ]);
    }
}
