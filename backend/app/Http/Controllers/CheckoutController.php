<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Services\CouponService;
use App\Services\OrderMailService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class CheckoutController extends Controller
{
    public function index(): View|RedirectResponse
    {
        $cart = Cart::firstOrCreate(['user_id' => Auth::id()])->load('items.product');
        if ($cart->items->isEmpty()) {
            return redirect()->route('cart.index')->withErrors(['cart' => 'Giỏ hàng đang trống.']);
        }

        return view('customer.checkout.index', [
            'cart' => $cart,
            'subtotal' => $this->subtotal($cart),
            'shippingMethods' => Order::shippingMethods(),
            'defaultShippingMethod' => 'standard',
            'suggestedProductCoupons' => $this->suggestedCoupons('product'),
            'suggestedShippingCoupons' => $this->suggestedCoupons('shipping'),
        ]);
    }

    public function applyCoupon(Request $request, CouponService $couponService): JsonResponse
    {
        $data = $request->validate([
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'product_coupon_code' => ['nullable', 'string', 'max:50'],
            'shipping_coupon_code' => ['nullable', 'string', 'max:50'],
            'shipping_method' => ['nullable', Rule::in(array_keys(Order::shippingMethods()))],
        ]);

        $cart = Cart::firstOrCreate(['user_id' => Auth::id()])->load('items.product');
        $subtotal = $this->subtotal($cart);
        $shippingFee = $this->shippingFee($data['shipping_method'] ?? 'standard');
        $productCouponCode = $this->normalizeCouponCode($data['product_coupon_code'] ?? session('checkout_product_coupon_code'));
        $shippingCouponCode = $this->normalizeCouponCode($data['shipping_coupon_code'] ?? session('checkout_shipping_coupon_code'));
        $incomingCode = $this->normalizeCouponCode($data['coupon_code'] ?? null);

        if ($incomingCode) {
            $incoming = $couponService->validateForCheckout($incomingCode, $subtotal, Auth::user(), $shippingFee);

            if ($incoming['type'] === 'shipping') {
                $shippingCouponCode = $incoming['coupon']->code;
            } else {
                $productCouponCode = $incoming['coupon']->code;
            }
        }

        if ($productCouponCode && ! $shippingCouponCode) {
            $shippingCouponCode = $this->firstApplicableCouponCode('shipping', $couponService, $subtotal, $shippingFee);
        }

        if ($shippingCouponCode && ! $productCouponCode) {
            $productCouponCode = $this->firstApplicableCouponCode('product', $couponService, $subtotal, $shippingFee);
        }

        if (! $productCouponCode && ! $shippingCouponCode) {
            throw ValidationException::withMessages(['coupon_code' => 'Vui lòng nhập hoặc chọn mã giảm giá.']);
        }

        $discounts = $this->calculateCouponDiscounts(
            $couponService,
            $subtotal,
            $shippingFee,
            $productCouponCode,
            $shippingCouponCode
        );

        session([
            'checkout_product_coupon_code' => $discounts['product_coupon']?->code,
            'checkout_shipping_coupon_code' => $discounts['shipping_coupon']?->code,
            'checkout_product_discount' => $discounts['product_discount'],
            'checkout_shipping_discount' => $discounts['shipping_discount'],
            'checkout_discount' => $discounts['discount'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Áp mã giảm giá thành công.',
            'product_coupon' => $discounts['product_coupon']?->only(['id', 'code', 'name']),
            'shipping_coupon' => $discounts['shipping_coupon']?->only(['id', 'code', 'name']),
            'product_discount' => $discounts['product_discount'],
            'shipping_discount' => $discounts['shipping_discount'],
            'discount' => $discounts['discount'],
            'shipping_fee' => $shippingFee,
            'total' => max($subtotal + $shippingFee - $discounts['discount'], 0),
        ]);
    }

    public function placeOrder(
        Request $request,
        CouponService $couponService,
        PaymentService $paymentService,
        OrderMailService $orderMailService
    ): RedirectResponse {
        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'customer_address' => ['required', 'string', 'max:1000'],
            'shipping_method' => ['required', Rule::in(array_keys(Order::shippingMethods()))],
            'payment_method' => ['required', Rule::in(['cod', 'payos'])],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'product_coupon_code' => ['nullable', 'string', 'max:50'],
            'shipping_coupon_code' => ['nullable', 'string', 'max:50'],
        ]);

        $order = DB::transaction(function () use ($data, $couponService, $paymentService) {
            $cart = Cart::where('user_id', Auth::id())->lockForUpdate()->firstOrFail();
            $cart->load('items.product');

            if ($cart->items->isEmpty()) {
                throw ValidationException::withMessages(['cart' => 'Giỏ hàng đang trống.']);
            }

            $subtotal = $this->subtotal($cart);
            $shippingFee = $this->shippingFee($data['shipping_method']);
            $productCouponCode = $this->normalizeCouponCode($data['product_coupon_code'] ?? session('checkout_product_coupon_code'));
            $shippingCouponCode = $this->normalizeCouponCode($data['shipping_coupon_code'] ?? session('checkout_shipping_coupon_code'));
            $legacyCouponCode = $this->normalizeCouponCode($data['coupon_code'] ?? session('checkout_coupon_code'));

            if ($legacyCouponCode) {
                $legacyCoupon = $couponService->validateForCheckout($legacyCouponCode, $subtotal, Auth::user(), $shippingFee);
                if ($legacyCoupon['type'] === 'shipping') {
                    $shippingCouponCode = $shippingCouponCode ?: $legacyCoupon['coupon']->code;
                } else {
                    $productCouponCode = $productCouponCode ?: $legacyCoupon['coupon']->code;
                }
            }

            if ($productCouponCode && ! $shippingCouponCode) {
                $shippingCouponCode = $this->firstApplicableCouponCode('shipping', $couponService, $subtotal, $shippingFee);
            }

            if ($shippingCouponCode && ! $productCouponCode) {
                $productCouponCode = $this->firstApplicableCouponCode('product', $couponService, $subtotal, $shippingFee);
            }

            $discounts = $this->calculateCouponDiscounts(
                $couponService,
                $subtotal,
                $shippingFee,
                $productCouponCode,
                $shippingCouponCode
            );

            foreach ($cart->items as $item) {
                $updated = Product::where('id', $item->product_id)
                    ->where('is_active', true)
                    ->where('stock', '>=', $item->quantity)
                    ->decrement('stock', $item->quantity);

                if ($updated === 0) {
                    throw ValidationException::withMessages([
                        'cart' => 'Sản phẩm "'.$item->product->name.'" không đủ tồn kho.',
                    ]);
                }
            }

            $productCoupon = $discounts['product_coupon'];
            $shippingCoupon = $discounts['shipping_coupon'];
            $discount = $discounts['discount'];
            $couponCodes = collect([$productCoupon?->code, $shippingCoupon?->code])->filter()->implode(', ');
            $primaryCoupon = $productCoupon ?: $shippingCoupon;

            $order = Order::create([
                'order_code' => 'ORD-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4)),
                'user_id' => Auth::id(),
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_address' => $data['customer_address'],
                'shipping_method' => $data['shipping_method'],
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'discount' => $discount,
                'product_discount' => $discounts['product_discount'],
                'shipping_discount' => $discounts['shipping_discount'],
                'total' => max($subtotal + $shippingFee - $discount, 0),
                'coupon_id' => $primaryCoupon?->id,
                'coupon_code' => $couponCodes ?: null,
                'product_coupon_id' => $productCoupon?->id,
                'product_coupon_code' => $productCoupon?->code,
                'shipping_coupon_id' => $shippingCoupon?->id,
                'shipping_coupon_code' => $shippingCoupon?->code,
                'status' => 'pending',
                'payment_method' => $data['payment_method'],
                'payment_status' => $data['payment_method'] === 'cod' ? 'unpaid' : 'pending',
                'ordered_at' => now(),
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'product_image' => $item->product->image,
                    'selected_size' => $item->selected_size,
                    'selected_color' => $item->selected_color,
                    'selected_color_name' => $item->selected_color_name,
                    'unit_price' => $item->unit_price,
                    'quantity' => $item->quantity,
                    'subtotal' => (float) $item->unit_price * $item->quantity,
                ]);
            }

            collect([$productCoupon, $shippingCoupon])
                ->filter()
                ->unique('id')
                ->each(fn (Coupon $coupon) => $coupon->increment('used_count'));

            $cart->items()->delete();
            session()->forget([
                'checkout_coupon_code',
                'checkout_product_coupon_code',
                'checkout_shipping_coupon_code',
                'checkout_product_discount',
                'checkout_shipping_discount',
                'checkout_discount',
            ]);
            $paymentService->createOnlineTransaction($order);

            return $order;
        });

        $orderMailService->sendOrderPlaced($order);

        if ($order->payment_method === 'payos') {
            return redirect()->route('payments.pay', $order)->with('success', 'Đặt hàng thành công. Vui lòng hoàn tất thanh toán.');
        }

        return redirect()->route('orders.show', $order)->with('success', 'Đặt hàng thành công.');
    }

    private function subtotal(Cart $cart): float
    {
        return (float) $cart->items->sum(fn ($item) => (float) $item->unit_price * $item->quantity);
    }

    private function shippingFee(string $method): float
    {
        return (float) (Order::shippingMethods()[$method]['fee'] ?? Order::shippingMethods()['standard']['fee']);
    }

    /**
     * @return array{product_coupon:?Coupon, shipping_coupon:?Coupon, product_discount:float, shipping_discount:float, discount:float}
     */
    private function calculateCouponDiscounts(
        CouponService $couponService,
        float $subtotal,
        float $shippingFee,
        ?string $productCouponCode,
        ?string $shippingCouponCode
    ): array {
        $productCoupon = null;
        $shippingCoupon = null;
        $productDiscount = 0.0;
        $shippingDiscount = 0.0;

        if ($productCouponCode) {
            $result = $couponService->validateForCheckout($productCouponCode, $subtotal, Auth::user(), 0);
            if ($result['type'] !== 'product') {
                throw ValidationException::withMessages(['product_coupon_code' => 'Mã này chỉ dùng để giảm phí vận chuyển.']);
            }

            $productCoupon = $result['coupon'];
            $productDiscount = (float) $result['discount'];
        }

        if ($shippingCouponCode) {
            $result = $couponService->validateForCheckout($shippingCouponCode, $subtotal, Auth::user(), $shippingFee);
            if ($result['type'] !== 'shipping') {
                throw ValidationException::withMessages(['shipping_coupon_code' => 'Mã này chỉ dùng để giảm tiền sản phẩm.']);
            }

            $shippingCoupon = $result['coupon'];
            $shippingDiscount = (float) $result['discount'];
        }

        return [
            'product_coupon' => $productCoupon,
            'shipping_coupon' => $shippingCoupon,
            'product_discount' => $productDiscount,
            'shipping_discount' => $shippingDiscount,
            'discount' => $productDiscount + $shippingDiscount,
        ];
    }

    private function normalizeCouponCode(?string $code): ?string
    {
        $code = strtoupper(trim((string) $code));

        return $code === '' ? null : $code;
    }

    private function firstApplicableCouponCode(
        string $type,
        CouponService $couponService,
        float $subtotal,
        float $shippingFee
    ): ?string {
        foreach ($this->suggestedCoupons($type) as $coupon) {
            try {
                $result = $couponService->validateForCheckout(
                    $coupon->code,
                    $subtotal,
                    Auth::user(),
                    $type === 'shipping' ? $shippingFee : 0
                );

                if ($result['type'] === $type) {
                    return $coupon->code;
                }
            } catch (ValidationException) {
                continue;
            }
        }

        return null;
    }

    /**
     * @return Collection<int, Coupon>
     */
    private function suggestedCoupons(string $type): Collection
    {
        $now = now();

        return Coupon::query()
            ->where('is_active', true)
            ->where(function ($query) use ($now) {
                $query->whereNull('start_at')->orWhere('start_at', '<=', $now);
            })
            ->where(function ($query) use ($now) {
                $query->whereNull('end_at')->orWhere('end_at', '>=', $now);
            })
            ->get()
            ->filter(function (Coupon $coupon) use ($type) {
                if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
                    return false;
                }

                $isShippingCoupon = str_contains(strtoupper($coupon->code), 'SHIP');

                return $type === 'shipping' ? $isShippingCoupon : ! $isShippingCoupon;
            })
            ->sortByDesc(fn (Coupon $coupon) => (float) $coupon->discount_value)
            ->take(3)
            ->values();
    }
}
