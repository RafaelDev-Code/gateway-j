<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Rules\ValidCpfCnpj;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => ['required', 'string', 'max:100'],
            'email'      => ['required', 'email', 'max:100', 'unique:users,email'],
            'password'   => ['required', 'string', 'min:8', 'confirmed'],
            'telefone'   => ['nullable', 'string', 'max:20'],
            'tipo'       => ['required', 'in:PF,PJ,fisica,juridica'],
            'documento'  => ['required', 'string', new ValidCpfCnpj()],
            'nomeEmpresa'=> ['nullable', 'string', 'max:200'],
            'cep'        => ['nullable', 'string', 'max:9'],
            'logradouro' => ['nullable', 'string', 'max:200'],
            'numero'     => ['nullable', 'string', 'max:20'],
            'complemento'=> ['nullable', 'string', 'max:100'],
            'bairro'     => ['nullable', 'string', 'max:100'],
            'cidade'     => ['nullable', 'string', 'max:100'],
            'estado'     => ['nullable', 'string', 'max:2'],
        ]);

        // ValidCpfCnpj rule já verificou o algoritmo de dígitos — apenas extrai dígitos
        $docRaw = preg_replace('/\D/', '', $validated['documento'] ?? '');

        $username = $this->uniqueUsernameFromEmail($validated['email']);

        $user = (new User())->forceFill([
            'username'          => $username,
            'name'              => $validated['name'],
            'email'             => $validated['email'],
            'password'          => $validated['password'],
            'telefone'          => $validated['telefone'] ?? null,
            'cnpj'              => $docRaw,
            'role'              => UserRole::USER,
            'balance'           => 0,
            'cash_in_active'    => false,
            'cash_out_active'   => false,
            'checkout_active'   => false,
            'documents_checked' => false,
        ]);
        $user->save();

        $token = $user->createToken('dashboard', ['*'], now()->addDays(7))->plainTextToken;

        AuditLog::create([
            'user_id'    => $user->id,
            'action'     => 'auth.register',
            'model_type' => null,
            'model_id'   => null,
            'context'    => ['ip' => $request->ip()],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'                => $user->id,
                'username'          => $user->username,
                'name'              => $user->name,
                'email'             => $user->email,
                'role'              => $user->role->value,
                'balance'           => bcdiv((string) (int) $user->balance, '100', 2),
                'cash_in_active'    => $user->cash_in_active,
                'cash_out_active'   => $user->cash_out_active,
                'documents_checked' => $user->documents_checked,
                'has_pin'           => $user->hasPin(),
            ],
        ], 201);
    }

    private function uniqueUsernameFromEmail(string $email): string
    {
        $base = preg_replace('/[^a-z0-9]/', '', strtolower(explode('@', $email)[0]));
        if ($base === '') {
            $base = 'user';
        }
        $username = Str::limit($base, 45, '');
        if (! User::where('username', $username)->exists()) {
            return $username;
        }
        return $username . '_' . Str::lower(Str::random(4));
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            AuditLog::create([
                'user_id'    => null,
                'action'     => 'auth.login_failed',
                'model_type' => null,
                'model_id'   => null,
                'context'    => ['email' => $request->email],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            throw ValidationException::withMessages([
                'email' => ['Credenciais invalidas.'],
            ]);
        }

        $user = Auth::user();

        // Revoga sessões anteriores — evita acúmulo ilimitado de tokens (HIGH-7)
        $user->tokens()->delete();

        $token = $user->createToken(
            'dashboard',
            ['*'],
            now()->addDays(7)
        )->plainTextToken;

        AuditLog::create([
            'user_id'    => $user->id,
            'action'     => 'auth.login',
            'model_type' => null,
            'model_id'   => null,
            'context'    => ['ip' => $request->ip()],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'                => $user->id,
                'username'          => $user->username,
                'name'              => $user->name,
                'email'             => $user->email,
                'role'              => $user->role->value,
                'balance'           => bcdiv((string) (int) $user->balance, '100', 2),
                'cash_in_active'    => $user->cash_in_active,
                'cash_out_active'   => $user->cash_out_active,
                'documents_checked' => $user->documents_checked,
                'has_pin'           => $user->hasPin(),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        AuditLog::create([
            'user_id'    => $request->user()->id,
            'action'     => 'auth.logout',
            'model_type' => null,
            'model_id'   => null,
            'context'    => [],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Logout realizado com sucesso.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => $this->userPayload($user),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'             => ['sometimes', 'string', 'max:100'],
            'email'            => ['sometimes', 'email', 'max:100', 'unique:users,email,' . $user->id],
            'telefone'         => ['sometimes', 'nullable', 'string', 'max:20'],
            'site'             => ['sometimes', 'nullable', 'string', 'max:200'],
            'current_password' => ['required_with:email', 'string'],
        ]);

        // Mudança de e-mail exige confirmação da senha atual
        if (isset($validated['email']) && $validated['email'] !== $user->email) {
            if (empty($validated['current_password']) || ! Hash::check($validated['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['Senha atual incorreta.'],
                ]);
            }
        }

        unset($validated['current_password']);

        $user->fill($validated)->save();

        AuditLog::create([
            'user_id'    => $user->id,
            'action'     => 'auth.update_profile',
            'model_type' => null,
            'model_id'   => null,
            'context'    => ['fields' => array_keys($validated)],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'data' => $this->userPayload($user->fresh()),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'current_password'      => ['required', 'string'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Senha atual incorreta.'],
            ]);
        }

        $user->update(['password' => $request->password]);

        // Revoga todos os tokens existentes (incluindo o atual) para forçar re-login
        $user->tokens()->delete();

        // Emite novo token para a sessão corrente
        $newToken = $user->createToken('dashboard', ['*'], now()->addDays(7))->plainTextToken;

        AuditLog::create([
            'user_id'    => $user->id,
            'action'     => 'auth.change_password',
            'model_type' => null,
            'model_id'   => null,
            'context'    => [],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Senha alterada com sucesso.',
            'token'   => $newToken,
        ]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id'                => $user->id,
            'username'          => $user->username,
            'name'              => $user->name,
            'email'             => $user->email,
            'telefone'          => $user->telefone,
            'site'              => $user->site,
            'cnpj'              => $user->cnpj,
            'faturamento'       => $user->faturamento,
            'role'              => $user->role->value,
            // balance convertido de centavos para reais na boundary da API
            'balance'           => bcdiv((string) (int) $user->balance, '100', 2),
            'cash_in_active'    => $user->cash_in_active,
            'cash_out_active'   => $user->cash_out_active,
            'checkout_active'   => $user->checkout_active,
            'documents_checked' => $user->documents_checked,
            'has_pin'           => $user->hasPin(),
            'email_verified_at' => $user->email_verified_at,
        ];
    }
}
