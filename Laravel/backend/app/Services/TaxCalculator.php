<?php

namespace App\Services;

use App\Models\GatewayConfig;
use App\Models\User;

class TaxCalculator
{
    /**
     * Calcula a taxa de cash-in em centavos.
     * Taxas individuais têm prioridade sobre a configuração global.
     *
     * @param  int  $amountCents  Valor em centavos
     * @return int  Taxa em centavos
     */
    public function calculateCashIn(User $user, int $amountCents): int
    {
        $config = GatewayConfig::current();

        // taxa percentual (ex: 2.0 = 2%)
        $ratePercent = $user->taxa_cashin_individual !== null
            ? (string) $user->taxa_cashin_individual
            : (string) $config->tax_cashin;

        // taxa mínima em reais -> centavos
        $taxMinReais = $user->taxa_min_individual !== null
            ? (string) $user->taxa_min_individual
            : (string) $config->tax_min;
        $taxMinCents = (int) bcmul($taxMinReais, '100', 0);

        // taxa calculada: amountCents * (rate / 100)
        $rateFraction = bcdiv($ratePercent, '100', 10);
        $taxCents     = (int) bcmul((string) $amountCents, $rateFraction, 0);

        return max($taxMinCents, $taxCents);
    }

    /**
     * Calcula a taxa de cash-out em centavos.
     *
     * @param  int  $amountCents  Valor em centavos
     * @return int  Taxa em centavos
     */
    public function calculateCashOut(User $user, int $amountCents): int
    {
        $config = GatewayConfig::current();

        // taxa percentual (ex: 2.0 = 2%)
        $ratePercent = $user->taxa_cashout_individual !== null
            ? (string) $user->taxa_cashout_individual
            : (string) $config->tax_cashout;

        // taxa mínima em reais -> centavos
        $taxMinReais = $user->taxa_min_individual !== null
            ? (string) $user->taxa_min_individual
            : (string) $config->tax_min;
        $taxMinCents = (int) bcmul($taxMinReais, '100', 0);

        // taxa calculada: amountCents * (rate / 100)
        $rateFraction = bcdiv($ratePercent, '100', 10);
        $taxCents     = (int) bcmul((string) $amountCents, $rateFraction, 0);

        return max($taxMinCents, $taxCents);
    }

    /**
     * Calcula o valor do split em centavos baseado no percentual.
     *
     * @param  int  $netAmountCents  Valor líquido em centavos
     * @param  int  $percentage      Percentual (1-100)
     * @return int  Valor do split em centavos
     */
    public function calculateSplit(int $netAmountCents, int $percentage): int
    {
        return (int) bcmul((string) $netAmountCents, bcdiv((string) $percentage, '100', 10), 0);
    }

    /**
     * Calcula o total necessário para um cash-out em centavos (valor + taxa).
     *
     * @param  int  $amountCents  Valor em centavos
     * @return int  Total em centavos (valor + taxa)
     */
    public function totalForCashOut(User $user, int $amountCents): int
    {
        $tax = $this->calculateCashOut($user, $amountCents);
        return $amountCents + $tax;
    }
}
