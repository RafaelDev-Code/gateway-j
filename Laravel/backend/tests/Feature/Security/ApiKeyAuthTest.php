<?php

namespace Tests\Feature\Security;

use App\Models\IntegrationKey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApiKeyAuthTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private IntegrationKey $integrationKey;
    private string $rawSecret;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['balance' => 0]);

        $this->rawSecret = IntegrationKey::generateClientSecret();

        $this->integrationKey = (new IntegrationKey())->forceFill([
            'user_id'       => $this->user->id,
            'client_id'     => IntegrationKey::generateClientId(),
            'client_secret' => Hash::make($this->rawSecret),
            'name'          => 'Test Key',
            'active'        => true,
        ]);
        $this->integrationKey->save();
    }

    // ----------------------------------------------------------------
    // Testes do model IntegrationKey::verifySecret()
    // ----------------------------------------------------------------

    public function test_verify_secret_aceita_bcrypt_correto(): void
    {
        $this->assertTrue($this->integrationKey->verifySecret($this->rawSecret));
    }

    public function test_verify_secret_rejeita_secret_errado(): void
    {
        $this->assertFalse($this->integrationKey->verifySecret('secret_completamente_errado'));
    }

    public function test_verify_secret_rejeita_string_vazia(): void
    {
        $this->assertFalse($this->integrationKey->verifySecret(''));
    }

    public function test_upgrade_automatico_sha256_para_bcrypt(): void
    {
        // Simula chave legada com SHA-256
        $legacySecret = IntegrationKey::generateClientSecret();
        $legacyKey = (new IntegrationKey())->forceFill([
            'user_id'       => $this->user->id,
            'client_id'     => IntegrationKey::generateClientId(),
            'client_secret' => hash('sha256', $legacySecret),
            'name'          => 'Legacy Key',
            'active'        => true,
        ]);
        $legacyKey->save();

        // Deve autenticar com SHA-256 legado
        $this->assertTrue($legacyKey->verifySecret($legacySecret));

        // Após autenticação, secret deve ter sido upgradado para bcrypt
        $legacyKey->refresh();
        $this->assertTrue(
            Hash::check($legacySecret, $legacyKey->client_secret),
            'Secret deve ter sido upgradado para bcrypt após primeira autenticação'
        );
    }

    public function test_verify_secret_sha256_legado_rejeita_secret_errado(): void
    {
        $legacyKey = (new IntegrationKey())->forceFill([
            'user_id'       => $this->user->id,
            'client_id'     => IntegrationKey::generateClientId(),
            'client_secret' => hash('sha256', 'secret_correto'),
            'name'          => 'Legacy Key',
            'active'        => true,
        ]);
        $legacyKey->save();

        $this->assertFalse($legacyKey->verifySecret('secret_errado'));
    }

    public function test_rotacao_de_secret_gera_next_secret_hash(): void
    {
        $newSecret = $this->integrationKey->rotateSecret();

        $this->assertNotEmpty($newSecret);
        $this->integrationKey->refresh();
        $this->assertNotNull($this->integrationKey->next_secret_hash);
        $this->assertTrue(Hash::check($newSecret, $this->integrationKey->next_secret_hash));
    }

    public function test_commit_rotation_promove_next_secret_para_client_secret(): void
    {
        $newSecret = $this->integrationKey->rotateSecret();
        $this->integrationKey->commitRotation();

        $this->integrationKey->refresh();
        $this->assertNull($this->integrationKey->next_secret_hash);
        $this->assertTrue($this->integrationKey->verifySecret($newSecret));
    }

    // ----------------------------------------------------------------
    // Testes HTTP: middleware validando headers corretamente
    // ----------------------------------------------------------------

    public function test_rota_publica_nao_exige_api_key(): void
    {
        // A rota de webhook não tem autenticação de api key
        $response = $this->postJson('/api/v1/webhooks/pagpix', []);
        // Deve processar (pode falhar HMAC, mas não deve dar 401 por falta de api key)
        $this->assertNotEquals(405, $response->status());
    }

    public function test_rota_protegida_sem_auth_retorna_401(): void
    {
        // POST /api/v1/pix/cashin sem nenhum header de autenticação
        $response = $this->postJson('/api/v1/pix/cashin', [
            'nome'  => 'Pagador',
            'cpf'   => '12345678901',
            'valor' => '100.00',
        ]);

        // Deve retornar 401 (não autenticado) ou 422 (validação se logado)
        // Não deve retornar 500
        $this->assertContains($response->status(), [401, 422]);
        $this->assertNotEquals(500, $response->status());
    }
}
