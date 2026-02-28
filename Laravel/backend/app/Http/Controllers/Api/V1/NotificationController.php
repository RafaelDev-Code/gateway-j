<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\GatewayNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = GatewayNotification::forUser($user->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'data' => $notifications->map(fn ($n) => $this->format($n)),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
                'total'        => $notifications->total(),
            ],
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();

        $count = GatewayNotification::forUser($user->id)
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $notification = GatewayNotification::forUser($user->id)->findOrFail($id);
        $notification->update(['is_read' => true]);

        return response()->json(['data' => $this->format($notification->fresh())]);
    }

    public function markAll(Request $request): JsonResponse
    {
        $user = $request->user();

        GatewayNotification::forUser($user->id)
            ->unread()
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Todas as notificações marcadas como lidas.']);
    }

    private function format(GatewayNotification $n): array
    {
        return [
            'id'         => $n->id,
            'title'      => $n->title,
            'message'    => $n->message,
            'type'       => $n->type,
            'is_read'    => $n->is_read,
            'created_at' => $n->created_at?->toIso8601String(),
        ];
    }
}
