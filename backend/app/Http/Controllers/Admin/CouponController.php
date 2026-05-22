<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class CouponController extends Controller
{
    public function index(): View
    {
        return view('admin.coupons.index', ['coupons' => Coupon::latest()->paginate(12)]);
    }

    public function create(): View
    {
        return view('admin.coupons.create');
    }

    public function store(Request $request): RedirectResponse
    {
        Coupon::create($this->validated($request));

        return redirect()->route('admin.coupons.index')->with('success', 'Đã tạo coupon.');
    }

    public function edit(Coupon $coupon): View
    {
        return view('admin.coupons.edit', compact('coupon'));
    }

    public function update(Request $request, Coupon $coupon): RedirectResponse
    {
        $coupon->update($this->validated($request, $coupon));

        return redirect()->route('admin.coupons.index')->with('success', 'Đã cập nhật coupon.');
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        $coupon->update(['is_active' => false]);

        return back()->with('success', 'Đã tắt coupon.');
    }

    private function validated(Request $request, ?Coupon $coupon = null): array
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('coupons')->ignore($coupon?->id)],
            'name' => ['required', 'string', 'max:255'],
            'discount_type' => ['required', Rule::in(['percent', 'fixed'])],
            'discount_value' => ['required', 'numeric', 'min:1'],
            'min_order_value' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:0'],
            'start_at' => ['nullable', 'date'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
            'is_active' => ['nullable', 'boolean'],
            'customer_tier' => ['nullable', Rule::in(['bronze', 'silver', 'gold', 'vip'])],
        ]);

        $data['code'] = strtoupper(trim($data['code']));
        $data['min_order_value'] = $data['min_order_value'] ?? 0;
        $data['is_active'] = (bool) ($data['is_active'] ?? false);

        return $data;
    }
}

