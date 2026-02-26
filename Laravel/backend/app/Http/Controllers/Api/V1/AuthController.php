<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
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
                'role'              => $user->role,
                'balance'           => $user->balance,
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
            'data' => [
                'id'                => $user->id,
                'username'          => $user->username,
                'name'              => $user->name,
                'email'             => $user->email,
                'telefone'          => $user->telefone,
                'cnpj'              => $user->cnpj,
                'role'              => $user->role,
                'balance'           => $user->balance,
                'cash_in_active'    => $user->cash_in_active,
                'cash_out_active'   => $user->cash_out_active,
                'checkout_active'   => $user->checkout_active,
                'documents_checked' => $user->documents_checked,
                'has_pin'           => $user->hasPin(),
                'email_verified_at' => $user->email_verified_at,
            ],
        ]);
    }
}
