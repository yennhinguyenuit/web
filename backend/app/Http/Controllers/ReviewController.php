<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function store(Request $request, Order $order): RedirectResponse
    {
        abort_unless($order->user_id === Auth::id(), 403);

        if ($order->status !== 'completed') {
            return back()->withErrors(['review' => 'Chỉ có thể đánh giá sau khi đơn hàng hoàn thành.']);
        }

        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $hasProductInOrder = $order->items()
            ->where('product_id', $data['product_id'])
            ->exists();

        if (! $hasProductInOrder) {
            return back()->withErrors(['review' => 'Sản phẩm không thuộc đơn hàng này.']);
        }

        Review::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'order_id' => $order->id,
                'product_id' => $data['product_id'],
            ],
            [
                'rating' => $data['rating'],
                'comment' => $data['comment'] ?? null,
                'is_visible' => true,
            ]
        );

        return back()->with('success', 'Cảm ơn bạn đã gửi đánh giá.');
    }
}

