<?php

namespace Tests\Feature\Security;

use App\Models\IntegrationKey;
use App\Models\User;
use App\Rules\SafeUrl;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

/**
 * Testa: HIGH-9 (SafeUrl / SSRF), HIGH-12 (splits > 100%)
 */
class SsrfAndSplitTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    // -----------------------------------------------------------------
    // HIGH-9: SafeUrl bloqueia IPs internos
    // -----------------------------------------------------------------

    /**
     * @dataProvider internalUrls
     */
    public function test_safe_url_bloqueia_endereco_interno(string $url): void
    {
        $rule = new SafeUrl();
        $failed = false;

        $rule->validate('postback', $url, function () use (&$failed) {
            $failed = true;
        });

        $this->assertTrue($failed, "SafeUrl deveria ter bloqueado: {$url}");
    }

    public static function internalUrls(): array
    {
        return [
            ['http://169.254.169.254/latest/meta-data'],
            ['http://192.168.1.1/admin'],
            ['http://10.0.0.1/secret'],
            ['http://172.16.0.1/internal'],
            ['http://127.0.0.1:8080/'],
            ['http://localhost/'],
            ['http://[::1]/'],   // IPv6 loopback — formato correto para URL (RFC 2732)
            ['http://metadata.google.internal/'],
        ];
    }

    public function test_safe_url_aceita_url_externa_valida(): void
    {
        $rule = new SafeUrl();
        $failed = false;

        $rule->validate('postback', 'https://meusite.com.br/webhook', function () use (&$failed) {
            $failed = true;
        });

        $this->assertFalse($failed, 'SafeUrl não deveria bloquear URL externa válida');
    }

    // -----------------------------------------------------------------
    // HIGH-12: splits somando > 100% retorna 422
    // -----------------------------------------------------------------

    public function test_splits_somando_mais_de_100_retorna_422(): void
    {
        $user  = User::factory()->create();
        $user2 = User::factory()->create();

        // Testa via FormRequest diretamente (mesma lógica validada pelo backend)
        $request = new \App\Http\Requests\CashInRequest();
        $validator = Validator::make([
            'nome'  => 'Pagador Teste',
            'cpf'   => '52998224725',
            'valor' => 100.00,
            'split' => [
                ['user_id' => $user->id,  'percentage' => 60],
                ['user_id' => $user2->id, 'percentage' => 50],
            ],
        ], $request->rules());

        // Injeta o "after" validator
        $request->withValidator($validator);

        $this->assertTrue($validator->fails(), 'Validação deveria falhar com splits > 100%');

        $errors = $validator->errors()->toArray();
        $this->assertArrayHasKey('split', $errors);
        $this->assertStringContainsString('110%', $errors['split'][0]);
    }

    public function test_splits_somando_100_e_aceito(): void
    {
        $user  = User::factory()->create();
        $user2 = User::factory()->create();

        // Validator direto (sem chamar a rota completa que exige adquirente)
        $validator = Validator::make([
            'nome'  => 'Pagador Teste',
            'cpf'   => '12345678901',
            'valor' => 100.00,
            'split' => [
                ['user_id' => $user->id,  'percentage' => 50],
                ['user_id' => $user2->id, 'percentage' => 50],
            ],
        ], (new \App\Http\Requests\CashInRequest())->rules());

        // Sem erros de split (pode haver outros erros de rule, mas não de split)
        $this->assertArrayNotHasKey('split', $validator->errors()->toArray());
    }

    // -----------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------

    private function createApiKey(User $user): array
    {
        $rawSecret = \Illuminate\Support\Str::random(32);
        $key = (new \App\Models\IntegrationKey())->forceFill([
            'user_id'       => $user->id,
            'client_id'     => \Illuminate\Support\Str::uuid(),
            'client_secret' => Hash::make($rawSecret),
            'name'          => 'Test Key',
            'active'        => true,
        ]);
        $key->save();

        return ['client_id' => $key->client_id, 'raw_secret' => $rawSecret];
    }
}
