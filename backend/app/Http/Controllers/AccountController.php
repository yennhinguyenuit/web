<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class AccountController extends Controller
{
    public function show(): View
    {
        $user = Auth::user();
        $ordersQuery = Order::where('user_id', $user->id);
        $totalSpent = (float) (clone $ordersQuery)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) {
                $query->where('payment_status', 'paid')
                    ->orWhere('status', 'completed');
            })
            ->sum('total');

        return view('customer.account.show', [
            'user' => $user,
            'totalSpent' => $totalSpent,
            'orderCount' => (clone $ordersQuery)->count(),
            'completedOrderCount' => (clone $ordersQuery)->where('status', 'completed')->count(),
            'pendingOrderCount' => (clone $ordersQuery)->whereIn('status', ['pending', 'confirmed', 'shipping'])->count(),
            'recentOrders' => (clone $ordersQuery)->latest()->take(4)->get(),
            'tier' => $this->tierData($user->customer_tier ?? 'bronze', $totalSpent),
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:1000'],
        ]);

        $user->update($data);

        return back()->with('success', 'Đã cập nhật thông tin tài khoản.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', 'min:6'],
        ]);

        $user = Auth::user();
        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'Mật khẩu hiện tại không đúng.',
            ]);
        }

        $user->update(['password' => Hash::make($data['password'])]);

        return back()->with('success', 'Đã đổi mật khẩu.');
    }

    private function tierData(string $currentTier, float $totalSpent): array
    {
        $tiers = [
            'bronze' => ['label' => 'Bronze', 'min' => 0, 'next' => 'silver', 'accent' => 'Tủ đồ khởi đầu'],
            'silver' => ['label' => 'Silver', 'min' => 2000000, 'next' => 'gold', 'accent' => 'Khách hàng thân thiết'],
            'gold' => ['label' => 'Gold', 'min' => 5000000, 'next' => 'vip', 'accent' => 'Ưu tiên tư vấn'],
            'vip' => ['label' => 'VIP', 'min' => 10000000, 'next' => null, 'accent' => 'Luxe private client'],
        ];

        $currentTier = array_key_exists($currentTier, $tiers) ? $currentTier : 'bronze';
        foreach ($tiers as $key => $tier) {
            if ($totalSpent >= $tier['min'] && $tier['min'] >= $tiers[$currentTier]['min']) {
                $currentTier = $key;
            }
        }

        $current = $tiers[$currentTier];
        $nextKey = $current['next'];
        $next = $nextKey ? $tiers[$nextKey] : null;
        $remaining = $next ? max($next['min'] - $totalSpent, 0) : 0;
        $progress = $next
            ? max(0, min(100, (int) floor((($totalSpent - $current['min']) / max($next['min'] - $current['min'], 1)) * 100)))
            : 100;

        return [
            'key' => $currentTier,
            'label' => $current['label'],
            'accent' => $current['accent'],
            'next_label' => $next['label'] ?? null,
            'remaining' => $remaining,
            'progress' => $progress,
        ];
    }
}
