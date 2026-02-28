<?php

namespace Tests\Unit;

use App\Models\GatewayConfig;
use App\Models\User;
use App\Services\TaxCalculator;
use Tests\TestCase;

/**
 * Todos os valores monetários neste teste estão em CENTAVOS (int).
 * Conversão: R$100,00 = 10000 centavos, R$1,00 = 100 centavos.
 */
class TaxCalculatorTest extends TestCase
{
    private TaxCalculator $calculator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->calculator = new TaxCalculator();
    }

    public function test_uses_global_tax_when_no_individual_tax_set(): void
    {
        $config = new GatewayConfig([
            'tax_cashin' => 2.0,  // 2%
            'tax_min'    => 1.0,  // R$1,00 = 100 centavos
        ]);

        $this->instance(GatewayConfig::class, $config);

        $user = new User([
            'taxa_cashin_individual' => null,
            'taxa_min_individual'    => null,
        ]);

        // 2% de R$100,00 (10000 centavos) = R$2,00 (200 centavos) — acima do mínimo R$1,00 (100 centavos)
        $taxCents = $this->calculator->calculateCashIn($user, 10000);
        $this->assertIsInt($taxCents);
        $this->assertEquals(200, $taxCents);
    }

    public function test_uses_individual_tax_over_global(): void
    {
        $user = new User([
            'taxa_cashin_individual' => 1.5,  // 1.5%
            'taxa_min_individual'    => 0.5,  // R$0,50 = 50 centavos
        ]);

        // 1.5% de R$100,00 (10000 centavos) = R$1,50 (150 centavos) — acima do mínimo R$0,50 (50 centavos)
        $taxCents = $this->calculator->calculateCashIn($user, 10000);
        $this->assertIsInt($taxCents);
        $this->assertEquals(150, $taxCents);
    }

    public function test_applies_minimum_tax(): void
    {
        $user = new User([
            'taxa_cashin_individual' => 2.0,  // 2%
            'taxa_min_individual'    => 5.0,  // R$5,00 = 500 centavos
        ]);

        // 2% de R$10,00 (1000 centavos) = R$0,20 (20 centavos) — abaixo do mínimo R$5,00 (500 centavos)
        // Deve cobrar o mínimo: 500 centavos
        $taxCents = $this->calculator->calculateCashIn($user, 1000);
        $this->assertIsInt($taxCents);
        $this->assertEquals(500, $taxCents);
    }

    public function test_calculates_split_amount_correctly(): void
    {
        // 30% de R$100,00 (10000 centavos) = R$30,00 (3000 centavos)
        $splitCents = $this->calculator->calculateSplit(10000, 30);
        $this->assertIsInt($splitCents);
        $this->assertEquals(3000, $splitCents);
    }

    public function test_calculates_total_for_cashout(): void
    {
        $user = new User([
            'taxa_cashout_individual' => 2.0,  // 2%
            'taxa_min_individual'     => 1.0,  // R$1,00 = 100 centavos
        ]);

        // 2% de R$100,00 (10000 centavos) = R$2,00 (200 centavos) — taxa
        // Total = 10000 + 200 = 10200 centavos (R$102,00)
        $totalCents = $this->calculator->totalForCashOut($user, 10000);
        $this->assertIsInt($totalCents);
        $this->assertEquals(10200, $totalCents);
    }

    public function test_split_zero_percentage_returns_zero(): void
    {
        $this->assertEquals(0, $this->calculator->calculateSplit(10000, 0));
    }

    public function test_split_hundred_percentage_returns_full_amount(): void
    {
        $this->assertEquals(10000, $this->calculator->calculateSplit(10000, 100));
    }
}
