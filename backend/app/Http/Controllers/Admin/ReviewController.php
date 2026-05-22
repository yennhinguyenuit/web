<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class ReviewController extends Controller
{
    public function index(): View
    {
        $reviews = Review::with(['user', 'product', 'order', 'replier'])
            ->latest()
            ->paginate(15);

        return view('admin.reviews.index', compact('reviews'));
    }

    public function reply(Request $request, Review $review): RedirectResponse
    {
        $data = $request->validate([
            'shop_reply' => ['required', 'string', 'max:1000'],
            'is_visible' => ['nullable', 'boolean'],
        ]);

        $review->update([
            'shop_reply' => $data['shop_reply'],
            'replied_by' => Auth::id(),
            'replied_at' => now(),
            'is_visible' => $request->boolean('is_visible', true),
        ]);

        return back()->with('success', 'Đã phản hồi feedback của khách hàng.');
    }

    public function toggleVisibility(Review $review): RedirectResponse
    {
        $review->update(['is_visible' => ! $review->is_visible]);

        return back()->with('success', 'Đã cập nhật trạng thái hiển thị feedback.');
    }
}
