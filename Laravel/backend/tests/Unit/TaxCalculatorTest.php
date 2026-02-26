<?php

namespace Tests\Unit;

use App\Models\GatewayConfig;
use App\Models\User;
use App\Services\TaxCalculator;
use Tests\TestCase;

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
            'tax_cashin' => 2.0,
            'tax_min'    => 1.0,
        ]);

        $this->instance(GatewayConfig::class, $config);

        $user = new User([
            'taxa_cashin_individual' => null,
            'taxa_min_individual'    => null,
        ]);

        // 2% de R$100 = R$2,00 (acima do minimo R$1,00)
        $tax = $this->calculator->calculateCashIn($user, 100.0);
        $this->assertEquals(2.0, $tax);
    }

    public function test_uses_individual_tax_over_global(): void
    {
        $user = new User([
            'taxa_cashin_individual' => 1.5,
            'taxa_min_individual'    => 0.5,
        ]);

        // 1.5% de R$100 = R$1,50 (acima do minimo R$0,50)
        $tax = $this->calculator->calculateCashIn($user, 100.0);
        $this->assertEqualsWithDelta(1.5, $tax, 0.0001);
    }

    public function test_applies_minimum_tax(): void
    {
        $user = new User([
            'taxa_cashin_individual' => 2.0,
            'taxa_min_individual'    => 5.0,
        ]);

        // 2% de R$10 = R$0,20 < minimo R$5,00 => cobra R$5,00
        $tax = $this->calculator->calculateCashIn($user, 10.0);
        $this->assertEquals(5.0, $tax);
    }

    public function test_calculates_split_amount_correctly(): void
    {
        $splitAmount = $this->calculator->calculateSplit(100.0, 30);
        $this->assertEquals(30.0, $splitAmount);
    }

    public function test_calculates_total_for_cashout(): void
    {
        $user = new User([
            'taxa_cashout_individual' => 2.0,
            'taxa_min_individual'     => 1.0,
        ]);

        $total = $this->calculator->totalForCashOut($user, 100.0);
        $this->assertEqualsWithDelta(102.0, $total, 0.0001);
    }
}
