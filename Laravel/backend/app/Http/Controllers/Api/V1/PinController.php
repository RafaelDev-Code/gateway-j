<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PinController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'pin'              => ['required', 'string', 'digits:4'],
            'pin_confirmation' => ['required', 'same:pin'],
        ]);

        $user = $request->user();

        if ($user->hasPin()) {
            return response()->json([
                'message' => 'PIN ja cadastrado. Use o metodo PUT para alterar.',
                'error'   => 'PIN_ALREADY_SET',
            ], 422);
        }

        $user->forceFill(['pin' => Hash::make($request->pin)])->save();

        AuditLog::create([
            'user_id'    => $user->id,
            'action'     => 'pin.created',
            'model_type' => null,
            'model_id'   => null,
            'context'    => [],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'PIN cadastrado com sucesso.'], 201);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'current_pin' => ['required', 'string', 'digits:4'],
            'pin'         => ['required', 'string', 'digits:4'],
            'pin_confirmation' => ['required', 'same:pin'],
        ]);

        $user = $request->user();

        if (! $user->hasPin()) {
            return response()->json([
                'message' => 'PIN nao cadastrado. Use o metodo POST para criar.',
                'error'   => 'PIN_NOT_SET',
            ], 422);
        }

        if (! $user->verifyPin($request->current_pin)) {
            AuditLog::create([
                'user_id'    => $user->id,
                'action'     => 'pin.change_failed',
                'model_type' => null,
                'model_id'   => null,
                'context'    => [],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'message' => 'PIN atual incorreto.',
                'error'   => 'INVALID_PIN',
            ], 422);
        }

        $user->forceFill(['pin' => Hash::make($request->pin)])->save();

        AuditLog::create([
            'user_id'    => $user->id,
            'action'     => 'pin.updated',
            'model_type' => null,
            'model_id'   => null,
            'context'    => [],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'PIN alterado com sucesso.']);
    }
}
