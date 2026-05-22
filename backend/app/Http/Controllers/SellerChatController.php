<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SellerChatController extends Controller
{
    public function messages(): JsonResponse
    {
        $messages = ChatMessage::where('user_id', Auth::id())
            ->whereIn('sender', ['customer', 'seller'])
            ->orderBy('created_at')
            ->get(['id', 'sender', 'message', 'created_at']);

        return response()->json(['messages' => $messages]);
    }

    public function send(Request $request): JsonResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        ChatMessage::create([
            'user_id' => Auth::id(),
            'sender' => 'customer',
            'message' => $data['message'],
        ]);

        return $this->messages();
    }
}

