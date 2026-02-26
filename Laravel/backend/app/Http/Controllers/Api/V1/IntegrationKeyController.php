<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\IntegrationKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntegrationKeyController extends Controller
{
    private const MAX_KEYS_PER_USER = 5;

    public function index(Request $request): JsonResponse
    {
        $keys = IntegrationKey::where('user_id', $request->user()->id)
            ->select(['id', 'client_id', 'name', 'description', 'domain', 'active', 'created_at'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $keys]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'        => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
            'domain'      => ['nullable', 'string', 'max:255'],
        ]);

        $user = $request->user();

        $count = IntegrationKey::where('user_id', $user->id)->count();
        if ($count >= self::MAX_KEYS_PER_USER) {
            return response()->json([
                'message' => 'Limite maximo de ' . self::MAX_KEYS_PER_USER . ' chaves de integracao atingido.',
                'error'   => 'KEY_LIMIT_REACHED',
            ], 422);
        }

        $rawSecret = IntegrationKey::generateClientSecret();

        $key = IntegrationKey::create([
            'user_id'       => $user->id,
            'client_id'     => IntegrationKey::generateClientId(),
            'client_secret' => hash('sha256', $rawSecret),
            'name'          => $request->name,
            'description'   => $request->description,
            'domain'        => $request->domain,
            'active'        => true,
        ]);

        AuditLog::create([
            'user_id'    => $user->id,
            'action'     => 'integration_key.created',
            'model_type' => IntegrationKey::class,
            'model_id'   => $key->id,
            'context'    => ['client_id' => $key->client_id, 'name' => $key->name],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Chave criada com sucesso. Guarde o client_secret — ele nao sera exibido novamente.',
            'data'    => [
                'id'            => $key->id,
                'client_id'     => $key->client_id,
                'client_secret' => $rawSecret,
                'name'          => $key->name,
                'description'   => $key->description,
                'domain'        => $key->domain,
                'active'        => $key->active,
                'created_at'    => $key->created_at,
            ],
        ], 201);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $key = IntegrationKey::where('user_id', $request->user()->id)
            ->findOrFail($id);

        AuditLog::create([
            'user_id'    => $request->user()->id,
            'action'     => 'integration_key.revoked',
            'model_type' => IntegrationKey::class,
            'model_id'   => $key->id,
            'context'    => ['client_id' => $key->client_id],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $key->delete();

        return response()->json(['message' => 'Chave revogada com sucesso.']);
    }
}
