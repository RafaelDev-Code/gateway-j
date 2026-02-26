<?php

namespace Tests\Unit;

use App\Contracts\AcquirerInterface;
use App\Enums\AcquirerType;
use App\Services\Acquirers\AcquirerFactory;
use App\Services\Acquirers\BSPayAcquirer;
use App\Services\Acquirers\PagPixAcquirer;
use App\Services\Acquirers\RapDynAcquirer;
use App\Services\Acquirers\StrikeAcquirer;
use App\Services\Acquirers\VersellAcquirer;
use App\Services\Acquirers\WiteTecAcquirer;
use Tests\TestCase;

class AcquirerFactoryTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Habilita todas as adquirentes para os testes
        foreach (['pagpix', 'rapdyn', 'witetec', 'strike', 'versell', 'bspay'] as $key) {
            config(["acquirers.{$key}.active" => true]);
        }
    }

    /**
     * @dataProvider acquirerProvider
     */
    public function test_resolves_correct_acquirer_class(AcquirerType $type, string $expectedClass): void
    {
        $acquirer = AcquirerFactory::make($type);

        $this->assertInstanceOf(AcquirerInterface::class, $acquirer);
        $this->assertInstanceOf($expectedClass, $acquirer);
    }

    public static function acquirerProvider(): array
    {
        return [
            'PagPix'  => [AcquirerType::PAGPIX,  PagPixAcquirer::class],
            'RapDyn'  => [AcquirerType::RAPDYN,  RapDynAcquirer::class],
            'WiteTec' => [AcquirerType::WITETEC, WiteTecAcquirer::class],
            'Strike'  => [AcquirerType::STRIKE,  StrikeAcquirer::class],
            'Versell' => [AcquirerType::VERSELL, VersellAcquirer::class],
            'BSPay'   => [AcquirerType::BSPAY,   BSPayAcquirer::class],
        ];
    }

    public function test_all_acquirer_types_have_factory_mapping(): void
    {
        foreach (AcquirerType::cases() as $type) {
            $acquirer = AcquirerFactory::make($type);
            $this->assertInstanceOf(AcquirerInterface::class, $acquirer);
        }
    }

    public function test_throws_exception_for_inactive_acquirer(): void
    {
        config(['acquirers.pagpix.active' => false]);

        $this->expectException(\App\Exceptions\AcquirerException::class);

        AcquirerFactory::make(AcquirerType::PAGPIX);
    }
}
