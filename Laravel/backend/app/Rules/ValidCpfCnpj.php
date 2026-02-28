<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Valida CPF e CNPJ usando o algoritmo oficial da Receita Federal (dígitos verificadores).
 * Rejeita sequências repetidas (111.111.111-11, 00.000.000/0000-00) que têm dígitos
 * matematicamente corretos mas são documentos inválidos.
 */
class ValidCpfCnpj implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) && ! is_numeric($value)) {
            $fail('Documento inválido.');
            return;
        }

        $doc = preg_replace('/\D/', '', (string) $value);

        if (strlen($doc) === 11) {
            if (! $this->isValidCpf($doc)) {
                $fail('CPF inválido.');
            }
            return;
        }

        if (strlen($doc) === 14) {
            if (! $this->isValidCnpj($doc)) {
                $fail('CNPJ inválido.');
            }
            return;
        }

        $fail('Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos).');
    }

    private function isValidCpf(string $cpf): bool
    {
        // Rejeita sequências repetidas
        if (preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false;
        }

        // Primeiro dígito verificador
        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += (int) $cpf[$i] * (10 - $i);
        }
        $remainder = $sum % 11;
        $digit1 = $remainder < 2 ? 0 : 11 - $remainder;

        if ((int) $cpf[9] !== $digit1) {
            return false;
        }

        // Segundo dígito verificador
        $sum = 0;
        for ($i = 0; $i < 10; $i++) {
            $sum += (int) $cpf[$i] * (11 - $i);
        }
        $remainder = $sum % 11;
        $digit2 = $remainder < 2 ? 0 : 11 - $remainder;

        return (int) $cpf[10] === $digit2;
    }

    private function isValidCnpj(string $cnpj): bool
    {
        // Rejeita sequências repetidas
        if (preg_match('/^(\d)\1{13}$/', $cnpj)) {
            return false;
        }

        $weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        $weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        // Primeiro dígito verificador
        $sum = 0;
        for ($i = 0; $i < 12; $i++) {
            $sum += (int) $cnpj[$i] * $weights1[$i];
        }
        $remainder = $sum % 11;
        $digit1 = $remainder < 2 ? 0 : 11 - $remainder;

        if ((int) $cnpj[12] !== $digit1) {
            return false;
        }

        // Segundo dígito verificador
        $sum = 0;
        for ($i = 0; $i < 13; $i++) {
            $sum += (int) $cnpj[$i] * $weights2[$i];
        }
        $remainder = $sum % 11;
        $digit2 = $remainder < 2 ? 0 : 11 - $remainder;

        return (int) $cnpj[13] === $digit2;
    }
}
