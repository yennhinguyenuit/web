<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\View\View;

class ChatController extends Controller
{
    public function index(): View
    {
        $hasAdminReadColumn = Schema::hasColumn('chat_messages', 'admin_read_at');
        $customersQuery = User::where('role', 'customer')
            ->whereHas('chatMessages', fn ($query) => $query->whereIn('sender', ['customer', 'seller']))
            ->with(['chatMessages' => fn ($query) => $query->whereIn('sender', ['customer', 'seller'])->latest()->limit(1)])
            ->orderByDesc(
                ChatMessage::select('created_at')
                    ->whereColumn('chat_messages.user_id', 'users.id')
                    ->whereIn('sender', ['customer', 'seller'])
                    ->latest()
                    ->limit(1)
            );

        if ($hasAdminReadColumn) {
            $customersQuery->withCount([
                'chatMessages as unread_chat_messages_count' => fn ($query) => $query
                    ->where('sender', 'customer')
                    ->whereNull('admin_read_at'),
            ]);
        }

        $customers = $customersQuery->get();

        return view('admin.chats.index', [
            'customers' => $customers,
            'hasAdminReadColumn' => $hasAdminReadColumn,
        ]);
    }

    public function messages(User $customer): JsonResponse
    {
        abort_unless($customer->role === 'customer', 404);

        if (Schema::hasColumn('chat_messages', 'admin_read_at')) {
            ChatMessage::where('user_id', $customer->id)
                ->where('sender', 'customer')
                ->whereNull('admin_read_at')
                ->update(['admin_read_at' => now()]);
        }

        $messages = ChatMessage::where('user_id', $customer->id)
            ->whereIn('sender', ['customer', 'seller'])
            ->orderBy('created_at')
            ->get(['id', 'sender', 'message', 'created_at']);

        return response()->json([
            'customer' => $customer->only(['id', 'name', 'email', 'phone']),
            'messages' => $messages,
            'unread_total' => $this->unreadConversationCount(),
        ]);
    }

    public function reply(Request $request, User $customer): JsonResponse
    {
        abort_unless($customer->role === 'customer', 404);

        $data = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        ChatMessage::create([
            'user_id' => $customer->id,
            'sender' => 'seller',
            'message' => $data['message'],
        ]);

        return $this->messages($customer);
    }

    private function unreadConversationCount(): int
    {
        if (! Schema::hasColumn('chat_messages', 'admin_read_at')) {
            return 0;
        }

        return ChatMessage::where('sender', 'customer')
            ->whereNull('admin_read_at')
            ->whereNotNull('user_id')
            ->distinct()
            ->count('user_id');
    }
}

