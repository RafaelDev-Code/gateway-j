<?php

namespace Tests\Unit;

use App\Rules\ValidCpfCnpj;
use Tests\TestCase;

class ValidCpfCnpjTest extends TestCase
{
    private function validate(string $value): bool
    {
        $failed = false;
        (new ValidCpfCnpj())->validate('documento', $value, function () use (&$failed) {
            $failed = true;
        });
        return ! $failed;
    }

    // -----------------------------------------------------------------
    // CPF válido
    // -----------------------------------------------------------------

    public function test_cpf_valido_passa(): void
    {
        $this->assertTrue($this->validate('529.982.247-25'));
        $this->assertTrue($this->validate('52998224725'));
    }

    // -----------------------------------------------------------------
    // CPF inválido
    // -----------------------------------------------------------------

    public function test_cpf_invalido_falha(): void
    {
        $this->assertFalse($this->validate('111.111.111-11'));
        $this->assertFalse($this->validate('000.000.000-00'));
        $this->assertFalse($this->validate('123.456.789-00')); // dígitos errados
    }

    // -----------------------------------------------------------------
    // CNPJ válido
    // -----------------------------------------------------------------

    public function test_cnpj_valido_passa(): void
    {
        $this->assertTrue($this->validate('11.222.333/0001-81'));
        $this->assertTrue($this->validate('11222333000181'));
    }

    // -----------------------------------------------------------------
    // CNPJ inválido
    // -----------------------------------------------------------------

    public function test_cnpj_invalido_falha(): void
    {
        $this->assertFalse($this->validate('00.000.000/0000-00'));
        $this->assertFalse($this->validate('11.111.111/1111-11'));
        $this->assertFalse($this->validate('12.345.678/0001-00')); // dígitos errados
    }

    public function test_documento_com_tamanho_errado_falha(): void
    {
        $this->assertFalse($this->validate('12345'));
        $this->assertFalse($this->validate(''));
    }
}
