<?php

namespace Tests\Unit;

use App\Services\AntiFraudService;
use Tests\TestCase;

class AntiFraudServiceTest extends TestCase
{
    private AntiFraudService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AntiFraudService();
    }

    public function test_validates_correct_cpf(): void
    {
        $this->assertTrue($this->service->isDocumentValid('529.982.247-25'));
        $this->assertTrue($this->service->isDocumentValid('52998224725'));
    }

    public function test_rejects_invalid_cpf(): void
    {
        $this->assertFalse($this->service->isDocumentValid('111.111.111-11'));
        $this->assertFalse($this->service->isDocumentValid('000.000.000-00'));
        $this->assertFalse($this->service->isDocumentValid('123.456.789-00'));
    }

    public function test_validates_correct_cnpj(): void
    {
        $this->assertTrue($this->service->isDocumentValid('11.222.333/0001-81'));
        $this->assertTrue($this->service->isDocumentValid('11222333000181'));
    }

    public function test_rejects_invalid_cnpj(): void
    {
        $this->assertFalse($this->service->isDocumentValid('11.111.111/1111-11'));
    }

    public function test_amount_validation(): void
    {
        $this->assertTrue($this->service->isAmountValid(1.00));
        $this->assertTrue($this->service->isAmountValid(999999.99));
        $this->assertFalse($this->service->isAmountValid(0));
        $this->assertFalse($this->service->isAmountValid(-1));
        $this->assertFalse($this->service->isAmountValid(1000000));
    }
}
