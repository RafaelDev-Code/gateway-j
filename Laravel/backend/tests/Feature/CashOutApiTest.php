<?php

namespace Tests\Feature;

use App\Enums\AcquirerType;
use App\Enums\TransactionStatus;
use App\Exceptions\AcquirerException;
use App\Models\IntegrationKey;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Acquirers\PagPixAcquirer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CashOutApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private IntegrationKey $key;
    private string $rawSecret;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->withPin('1234')->create([
            'payment_pix'     => AcquirerType::PAGPIX,
            'cash_out_active' => true,
            'documents_checked' => true,
            'balance'         => 500.00,
        ]);

        $this->rawSecret = 'test_secret_abc123';

        $this->key = IntegrationKey::factory()->create([
            'user_id'       => $this->user->id,
            'client_id'     => 'test_key_cashout',
            'client_secret' => hash('sha256', $this->rawSecret),
            'active'        => true,
        ]);

        config(['acquirers.pagpix.active' => true]);
    }

    public function test_requires_api_key(): void
    {
        $response = $this->postJson('/api/v1/pix/cashout', []);
        $response->assertStatus(401);
    }

    public function test_validates_required_fields(): void
    {
        $response = $this->postJson('/api/v1/pix/cashout', [], [
            'Apikey' => 'test_key_cashout',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['chave_pix', 'valor', 'pin']);
    }

    public function test_rejects_invalid_pin(): void
    {
        $response = $this->postJson('/api/v1/pix/cashout', [
            'chave_pix'  => '11999999999',
            'tipo_chave' => 'PHONE',
            'valor'      => 50.00,
            'pin'        => '9999',
        ], ['Apikey' => 'test_key_cashout']);

        $response->assertStatus(422)
            ->assertJson(['error' => 'INVALID_PIN']);
    }

    public function test_rejects_insufficient_balance(): void
    {
        $this->user->update(['balance' => 5.00]);

        $response = $this->postJson('/api/v1/pix/cashout', [
            'chave_pix'  => '11999999999',
            'tipo_chave' => 'PHONE',
            'valor'      => 100.00,
            'pin'        => '1234',
        ], ['Apikey' => 'test_key_cashout']);

        $response->assertStatus(422)
            ->assertJson(['error' => 'INSUFFICIENT_BALANCE']);
    }

    public function test_processes_cashout_successfully(): void
    {
        $this->mock(PagPixAcquirer::class, function ($mock) {
            $mock->shouldReceive('processCashOut')
                ->once()
                ->andReturn([
                    'external_id' => 'ext_cashout_456',
                    'status'      => 'PENDING',
                ]);
        });

        $previousBalance = (float) $this->user->balance;

        $response = $this->postJson('/api/v1/pix/cashout', [
            'chave_pix'  => '11999999999',
            'tipo_chave' => 'PHONE',
            'valor'      => 100.00,
            'pin'        => '1234',
        ], ['Apikey' => 'test_key_cashout']);

        $response->assertStatus(201);

        $this->user->refresh();
        $this->assertLessThan($previousBalance, (float) $this->user->balance);

        $this->assertDatabaseHas('transactions', [
            'user_id' => $this->user->id,
            'type'    => 'WITHDRAW',
            'status'  => 'PENDING',
        ]);
    }

    public function test_reverts_balance_when_acquirer_fails(): void
    {
        $this->mock(PagPixAcquirer::class, function ($mock) {
            $mock->shouldReceive('processCashOut')
                ->once()
                ->andThrow(new AcquirerException('Falha na adquirente'));
        });

        $previousBalance = (float) $this->user->balance;

        $this->postJson('/api/v1/pix/cashout', [
            'chave_pix'  => '11999999999',
            'tipo_chave' => 'PHONE',
            'valor'      => 100.00,
            'pin'        => '1234',
        ], ['Apikey' => 'test_key_cashout']);

        $this->user->refresh();
        $this->assertEquals($previousBalance, (float) $this->user->balance);
    }
}
