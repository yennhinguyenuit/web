<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ChatController extends Controller
{
    public function index(): View
    {
        $customers = User::where('role', 'customer')
            ->whereHas('chatMessages', fn ($query) => $query->whereIn('sender', ['customer', 'seller']))
            ->with(['chatMessages' => fn ($query) => $query->whereIn('sender', ['customer', 'seller'])->latest()->limit(1)])
            ->orderByDesc(
                ChatMessage::select('created_at')
                    ->whereColumn('chat_messages.user_id', 'users.id')
                    ->whereIn('sender', ['customer', 'seller'])
                    ->latest()
                    ->limit(1)
            )
            ->get();

        return view('admin.chats.index', compact('customers'));
    }

    public function messages(User $customer): JsonResponse
    {
        abort_unless($customer->role === 'customer', 404);

        $messages = ChatMessage::where('user_id', $customer->id)
            ->whereIn('sender', ['customer', 'seller'])
            ->orderBy('created_at')
            ->get(['id', 'sender', 'message', 'created_at']);

        return response()->json([
            'customer' => $customer->only(['id', 'name', 'email', 'phone']),
            'messages' => $messages,
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
}

