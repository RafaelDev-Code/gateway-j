<?php

namespace App\Services;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\GatewayConfig;
use App\Models\Transaction;
use App\Models\User;

class AntiFraudService
{
    /**
     * Verifica se o usuario pode realizar um saque.
     * Bloqueia se houver deposito recente acima do limite de anti-fraude.
     */
    public function canWithdraw(User $user, float $amount): bool
    {
        $config = GatewayConfig::current();

        if ((float) $config->anti_fraud_min <= 0) {
            return true; // Anti-fraude desativado
        }

        // Verifica depositos recentes nao confirmados ou de alto valor
        $recentHighDeposit = Transaction::where('user_id', $user->id)
            ->where('type', TransactionType::DEPOSIT)
            ->where('status', TransactionStatus::PAID)
            ->where('amount', '>=', $config->anti_fraud_min)
            ->where('created_at', '>=', now()->subMinutes(30))
            ->exists();

        return ! $recentHighDeposit;
    }

    /**
     * Valida se um valor de transacao e razoavel.
     */
    public function isAmountValid(float $amount): bool
    {
        return $amount >= 0.01 && $amount <= 999999.99;
    }

    /**
     * Valida CPF ou CNPJ basico (apenas formato).
     */
    public function isDocumentValid(string $document): bool
    {
        $doc = preg_replace('/\D/', '', $document);

        return match (strlen($doc)) {
            11 => $this->validateCpf($doc),
            14 => $this->validateCnpj($doc),
            default => false,
        };
    }

    private function validateCpf(string $cpf): bool
    {
        if (preg_match('/(\d)\1{10}/', $cpf)) {
            return false;
        }

        for ($t = 9; $t < 11; $t++) {
            $sum = 0;
            for ($c = 0; $c < $t; $c++) {
                $sum += $cpf[$c] * ($t + 1 - $c);
            }
            $r = ((10 * $sum) % 11) % 10;
            if ($cpf[$c] != $r) {
                return false;
            }
        }

        return true;
    }

    private function validateCnpj(string $cnpj): bool
    {
        if (preg_match('/(\d)\1{13}/', $cnpj)) {
            return false;
        }

        $weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        $weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        $sum1 = 0;
        for ($i = 0; $i < 12; $i++) {
            $sum1 += $cnpj[$i] * $weights1[$i];
        }
        $r1 = $sum1 % 11 < 2 ? 0 : 11 - ($sum1 % 11);
        if ($cnpj[12] != $r1) {
            return false;
        }

        $sum2 = 0;
        for ($i = 0; $i < 13; $i++) {
            $sum2 += $cnpj[$i] * $weights2[$i];
        }
        $r2 = $sum2 % 11 < 2 ? 0 : 11 - ($sum2 % 11);

        return $cnpj[13] == $r2;
    }
}
