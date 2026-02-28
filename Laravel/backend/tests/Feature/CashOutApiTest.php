<?php

namespace Tests\Feature;

use App\Enums\AcquirerType;
use App\Exceptions\AcquirerException;
use App\Models\User;
use App\Services\Acquirers\PagPixAcquirer;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CashOutApiTest extends TestCase
{
    use DatabaseTransactions;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();

        $this->user = User::factory()->withPin('1234')->create([
            'payment_pix'       => AcquirerType::PAGPIX,
            'cash_out_active'   => true,
            'documents_checked' => true,
            'balance'           => 50000, // R$500,00 em centavos
        ]);

        config(['acquirers.pagpix.active' => true]);
    }

    public function test_requires_api_key(): void
    {
        // Sem autenticação → 401
        $response = $this->postJson('/api/v1/pix/cashout', []);
        $response->assertStatus(401);
    }

    public function test_validates_required_fields(): void
    {
        // FormRequest roda antes da checagem de Idempotency-Key → 422 por campos faltando
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/pix/cashout', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nome', 'cpf', 'key', 'valor', 'pin']);
    }

    public function test_rejects_invalid_pin(): void
    {
        $response = $this->actingAs($this->user)
            ->withHeaders(['Idempotency-Key' => 'test-idem-invalid-pin'])
            ->postJson('/api/v1/pix/cashout', [
                'nome'  => 'Joao Silva',
                'cpf'   => '529.982.247-25',
                'key'   => '11999999999',
                'valor' => 50.00,
                'pin'   => '9999',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('error', 'INVALID_PIN');
    }

    public function test_rejects_insufficient_balance(): void
    {
        $this->user->forceFill(['balance' => 500])->save(); // R$5,00 em centavos

        $response = $this->actingAs($this->user)
            ->withHeaders(['Idempotency-Key' => 'test-idem-insuf-bal'])
            ->postJson('/api/v1/pix/cashout', [
                'nome'  => 'Joao Silva',
                'cpf'   => '529.982.247-25',
                'key'   => '11999999999',
                'valor' => 100.00, // R$100 + taxa > R$5,00 disponível
                'pin'   => '1234',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('error', 'INSUFFICIENT_BALANCE');
    }

    public function test_processes_cashout_successfully(): void
    {
        $this->mock(PagPixAcquirer::class, function ($mock) {
            $mock->shouldReceive('processCashout')
                ->once()
                ->andReturn([
                    'external_id' => 'ext_cashout_456',
                    'status'      => 'PENDING',
                ]);
        });

        $previousBalance = (int) $this->user->balance;

        $response = $this->actingAs($this->user)
            ->withHeaders(['Idempotency-Key' => 'test-idem-success-001'])
            ->postJson('/api/v1/pix/cashout', [
                'nome'  => 'Joao Silva',
                'cpf'   => '529.982.247-25',
                'key'   => '11999999999',
                'valor' => 100.00,
                'pin'   => '1234',
            ]);

        $response->assertStatus(201);

        $this->user->refresh();
        $this->assertLessThan($previousBalance, (int) $this->user->balance);

        $this->assertDatabaseHas('transactions', [
            'user_id' => $this->user->id,
            'type'    => 'WITHDRAW',
            'status'  => 'PENDING',
        ]);
    }

    public function test_reverts_balance_when_acquirer_fails(): void
    {
        $this->mock(PagPixAcquirer::class, function ($mock) {
            $mock->shouldReceive('processCashout')
                ->once()
                ->andThrow(new AcquirerException('Falha na adquirente'));
        });

        $previousBalance = (int) $this->user->balance;

        $this->actingAs($this->user)
            ->withHeaders(['Idempotency-Key' => 'test-idem-fail-revert'])
            ->postJson('/api/v1/pix/cashout', [
                'nome'  => 'Joao Silva',
                'cpf'   => '529.982.247-25',
                'key'   => '11999999999',
                'valor' => 100.00,
                'pin'   => '1234',
            ]);

        $this->user->refresh();
        $this->assertEquals($previousBalance, (int) $this->user->balance);
    }
}
