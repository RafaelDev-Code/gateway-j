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
        // Valores em centavos (int) — consistente com o pipeline financeiro
        $amountCents = fake()->numberBetween(1000, 500000); // R$10 a R$5000
        $taxCents    = (int) round($amountCents * 0.015);

        return [
            'id'              => 'e' . strtolower(Str::random(32)),
            'end2end'         => null,
            'external_id'     => Str::uuid()->toString(),
            'user_id'         => User::factory(),
            'amount'          => $amountCents,
            'tax'             => $taxCents,
            'status'          => TransactionStatus::PENDING,
            'type'            => TransactionType::DEPOSIT,
            'nome'            => fake()->name(),
            'document'        => fake()->numerify('###########'),
            'descricao'       => fake()->sentence(),
            'postback_url'    => null,
            'postback_status' => 'PENDING',
            'is_api'          => true,
            'is_internal'     => false,
            'confirmed_at'    => null,
        ];
    }

    /**
     * forceFill necessário pois amount, tax, status, type e user_id estão em $guarded.
     * Factories são código interno/confiável e devem usar forceFill().
     */
    public function newModel(array $attributes = []): Transaction
    {
        return (new Transaction())->forceFill($attributes);
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
