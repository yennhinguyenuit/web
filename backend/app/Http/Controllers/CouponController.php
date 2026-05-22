<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CouponController extends Controller
{
    public function validateCoupon(Request $request, CouponService $couponService): JsonResponse
    {
        $data = $request->validate(['code' => ['required', 'string', 'max:50']]);
        $cart = Cart::firstOrCreate(['user_id' => Auth::id()])->load('items.product');
        $subtotal = (float) $cart->items->sum(fn ($item) => (float) $item->unit_price * $item->quantity);
        $result = $couponService->validateForCheckout($data['code'], $subtotal);

        return response()->json([
            'success' => true,
            'coupon' => $result['coupon'],
            'discount' => $result['discount'],
        ]);
    }
}

