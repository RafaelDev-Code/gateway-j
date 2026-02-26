<?php

namespace App\Services;

use App\Models\GatewayConfig;
use App\Models\User;

class TaxCalculator
{
    /**
     * Calcula a taxa de cash-in para um usuario e valor.
     * Taxas individuais tem prioridade sobre globais.
     *
     * @return float Taxa em reais
     */
    public function calculateCashIn(User $user, float $amount): float
    {
        $config = GatewayConfig::current();

        $taxPercent = $user->taxa_cashin_individual !== null
            ? (float) $user->taxa_cashin_individual
            : (float) $config->tax_cashin;

        $taxMin = $user->taxa_min_individual !== null
            ? (float) $user->taxa_min_individual
            : (float) $config->tax_min;

        $calculated = ($amount * $taxPercent) / 100;

        return max($taxMin, round($calculated, 6));
    }

    /**
     * Calcula a taxa de cash-out para um usuario e valor.
     */
    public function calculateCashOut(User $user, float $amount): float
    {
        $config = GatewayConfig::current();

        $taxPercent = $user->taxa_cashout_individual !== null
            ? (float) $user->taxa_cashout_individual
            : (float) $config->tax_cashout;

        $taxMin = $user->taxa_min_individual !== null
            ? (float) $user->taxa_min_individual
            : (float) $config->tax_min;

        $calculated = ($amount * $taxPercent) / 100;

        return max($taxMin, round($calculated, 6));
    }

    /**
     * Calcula o valor do split baseado no percentual.
     */
    public function calculateSplit(float $netAmount, int $percentage): float
    {
        return round(($netAmount * $percentage) / 100, 6);
    }

    /**
     * Calcula o total necessario para um cash-out (valor + taxa).
     */
    public function totalForCashOut(User $user, float $amount): float
    {
        $tax = $this->calculateCashOut($user, $amount);
        return round($amount + $tax, 6);
    }
}
