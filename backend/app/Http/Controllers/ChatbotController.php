<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatbotController extends Controller
{
    public function send(Request $request, ChatbotService $chatbotService): JsonResponse
    {
        $data = $request->validate(['message' => ['required', 'string', 'max:1000']]);

        ChatMessage::create([
            'user_id' => Auth::id(),
            'sender' => 'user',
            'message' => $data['message'],
        ]);

        $reply = $chatbotService->reply($data['message']);

        ChatMessage::create([
            'user_id' => Auth::id(),
            'sender' => 'bot',
            'message' => $reply,
        ]);

        return response()->json(['success' => true, 'reply' => $reply]);
    }
}

