<?php

namespace Tests\Feature\Security;

use App\Models\GatewayConfig;
use App\Models\User;
use App\Services\TaxCalculator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CentavosMonetaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_tax_calculator_retorna_centavos_sem_float(): void
    {
        GatewayConfig::firstOrCreate([], [
            'tax_cashin'  => '2.0',
            'tax_cashout' => '2.0',
            'tax_min'     => '1.00',
        ]);

        $user = User::factory()->create([
            'taxa_cashin_individual'  => null,
            'taxa_cashout_individual' => null,
            'taxa_min_individual'     => null,
        ]);

        $calc = new TaxCalculator();

        // R$100,00 = 10000 centavos com 2% de taxa = R$2,00 = 200 centavos
        $taxCents = $calc->calculateCashIn($user, 10000);
        $this->assertIsInt($taxCents);
        $this->assertEquals(200, $taxCents);

        // Taxa mínima: R$1,00 = 100 centavos; R$1,00 com 2% = R$0,02 => usa mínimo
        $taxMin = $calc->calculateCashIn($user, 100);
        $this->assertIsInt($taxMin);
        $this->assertEquals(100, $taxMin); // usa taxa mínima de R$1,00

        // calculateSplit: 30% de 10000 = 3000
        $splitCents = $calc->calculateSplit(10000, 30);
        $this->assertIsInt($splitCents);
        $this->assertEquals(3000, $splitCents);
    }

    public function test_balance_armazenado_como_inteiro_em_centavos(): void
    {
        $user = User::factory()->create(['balance' => 5000]); // R$50,00

        $user->refresh();

        $this->assertIsInt($user->balance);
        $this->assertEquals(5000, $user->balance);
    }

    public function test_balance_api_retorna_reais_formatado(): void
    {
        $user = User::factory()->create(['balance' => 12350]); // R$123,50

        $response = $this->actingAs($user)->getJson('/api/v1/balance');

        $response->assertStatus(200);
        $response->assertJsonFragment(['balance' => '123.50']);
    }

    public function test_nenhum_float_em_operacoes_de_saldo(): void
    {
        // Testa que operações de increment/decrement funcionam corretamente com int
        $user = User::factory()->create(['balance' => 0]);

        // Simula crédito de R$100,00 (10000 centavos)
        \Illuminate\Support\Facades\DB::table('users')
            ->where('id', $user->id)
            ->increment('balance', 10000);

        $user->refresh();
        $this->assertEquals(10000, $user->balance);
        $this->assertIsInt($user->balance);

        // Simula débito de R$50,00 (5000 centavos)
        \Illuminate\Support\Facades\DB::table('users')
            ->where('id', $user->id)
            ->decrement('balance', 5000);

        $user->refresh();
        $this->assertEquals(5000, $user->balance);
    }
}
