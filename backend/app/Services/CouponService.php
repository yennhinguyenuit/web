<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CouponService
{
    /**
     * @return array{coupon: Coupon, discount: float, type: string}
     */
    public function validateForCheckout(?string $code, float $subtotal, ?User $user = null, float $shippingFee = 0): array
    {
        if (! $code) {
            throw ValidationException::withMessages(['coupon_code' => 'Vui lòng nhập mã giảm giá.']);
        }

        $coupon = Coupon::where('code', strtoupper(trim($code)))->first();

        if (! $coupon) {
            throw ValidationException::withMessages(['coupon_code' => 'Mã giảm giá không tồn tại.']);
        }

        if (! $coupon->is_active) {
            throw ValidationException::withMessages(['coupon_code' => 'Mã giảm giá đang tắt.']);
        }

        $now = now();
        if ($coupon->start_at && $now->lt($coupon->start_at)) {
            throw ValidationException::withMessages(['coupon_code' => 'Mã giảm giá chưa đến thời gian áp dụng.']);
        }

        if ($coupon->end_at && $now->gt($coupon->end_at)) {
            throw ValidationException::withMessages(['coupon_code' => 'Mã giảm giá đã hết hạn.']);
        }

        if ($subtotal < (float) $coupon->min_order_value) {
            throw ValidationException::withMessages([
                'coupon_code' => 'Đơn hàng chưa đạt giá trị tối thiểu để dùng mã này.',
            ]);
        }

        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            throw ValidationException::withMessages(['coupon_code' => 'Mã giảm giá đã hết lượt sử dụng.']);
        }

        if ($coupon->customer_tier && $user && $coupon->customer_tier !== $user->customer_tier) {
            throw ValidationException::withMessages([
                'coupon_code' => 'Mã giảm giá này chỉ áp dụng cho hạng khách hàng '.$coupon->customer_tier.'.',
            ]);
        }

        $isShippingCoupon = $this->isShippingCoupon($coupon);
        $discountBase = $isShippingCoupon ? $shippingFee : $subtotal;

        $discount = $coupon->discount_type === 'percent'
            ? $discountBase * ((float) $coupon->discount_value / 100)
            : (float) $coupon->discount_value;

        if ($coupon->max_discount !== null) {
            $discount = min($discount, (float) $coupon->max_discount);
        }

        return [
            'coupon' => $coupon,
            'discount' => min(round($discount, 2), $discountBase),
            'type' => $isShippingCoupon ? 'shipping' : 'product',
        ];
    }

    public function isShippingCoupon(Coupon|string $coupon): bool
    {
        $code = $coupon instanceof Coupon ? $coupon->code : $coupon;

        return str_contains(strtoupper($code), 'SHIP');
    }
}
