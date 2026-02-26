<?php

namespace Tests\Feature;

use App\Models\IntegrationKey;
use App\Models\User;
use App\Services\Acquirers\AcquirerFactory;
use App\Services\Acquirers\PagPixAcquirer;
use App\DTOs\CashInDTO;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CashInApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private IntegrationKey $key;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'payment_pix'    => 'PAGPIX',
            'cash_in_active' => true,
            'documents_checked' => true,
        ]);

        $this->key = IntegrationKey::factory()->create([
            'user_id'   => $this->user->id,
            'client_id' => 'test_key_123',
            'active'    => true,
        ]);
    }

    public function test_requires_api_key(): void
    {
        $response = $this->postJson('/api/v1/pix/cashin', []);
        $response->assertStatus(401);
    }

    public function test_validates_required_fields(): void
    {
        $response = $this->postJson('/api/v1/pix/cashin', [], [
            'Apikey' => 'test_key_123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nome', 'cpf', 'valor']);
    }

    public function test_rejects_invalid_amount(): void
    {
        $response = $this->postJson('/api/v1/pix/cashin', [
            'nome'  => 'Joao Silva',
            'cpf'   => '529.982.247-25',
            'valor' => -100,
        ], ['Apikey' => 'test_key_123']);

        $response->assertStatus(422);
    }

    public function test_generates_pix_successfully(): void
    {
        // Mock da adquirente
        $this->mock(PagPixAcquirer::class, function ($mock) {
            $mock->shouldReceive('generatePix')
                ->once()
                ->andReturn([
                    'qr_code'      => 'fake_qr_code',
                    'qr_code_text' => 'fake_qr_text',
                    'external_id'  => 'ext_123',
                ]);
        });

        $response = $this->postJson('/api/v1/pix/cashin', [
            'nome'      => 'Joao Silva',
            'cpf'       => '529.982.247-25',
            'valor'     => 100.00,
            'descricao' => 'Teste de pagamento',
        ], ['Apikey' => 'test_key_123']);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'status', 'amount', 'qr_code', 'qr_code_text']);

        $this->assertDatabaseHas('transactions', [
            'user_id'     => $this->user->id,
            'external_id' => 'ext_123',
            'status'      => 'PENDING',
            'type'        => 'DEPOSIT',
        ]);
    }

    public function test_blocked_when_cash_in_inactive(): void
    {
        $this->user->update(['cash_in_active' => false]);

        $response = $this->postJson('/api/v1/pix/cashin', [
            'nome'  => 'Joao Silva',
            'cpf'   => '529.982.247-25',
            'valor' => 100.00,
        ], ['Apikey' => 'test_key_123']);

        $response->assertStatus(500); // Ou 422 dependendo da excecao
    }
}
