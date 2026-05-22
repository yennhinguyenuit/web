<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderMailService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class OrderController extends Controller
{
    public function index(): View
    {
        $orders = Order::with('items')->where('user_id', Auth::id())->latest()->paginate(10);

        return view('customer.orders.index', compact('orders'));
    }

    public function show(Order $order): View
    {
        abort_unless($order->user_id === Auth::id(), 403);

        return view('customer.orders.show', [
            'order' => $order->load('items.product', 'coupon', 'productCoupon', 'shippingCoupon', 'paymentTransactions', 'reviews.replier'),
        ]);
    }

    public function cancel(Request $request, Order $order, OrderMailService $orderMailService): RedirectResponse
    {
        abort_unless($order->user_id === Auth::id(), 403);

        $data = $request->validate([
            'cancel_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($order->status === 'cancelled') {
            return back()->withErrors(['order' => 'Đơn hàng đã được hủy trước đó.']);
        }

        if ($order->canCustomerCancelDirectly()) {
            $oldStatus = $order->status;
            $oldPaymentStatus = $order->payment_status;

            DB::transaction(function () use ($order, $data) {
                $order->loadMissing('items.product');

                foreach ($order->items as $item) {
                    $item->product()->increment('stock', $item->quantity);
                }

                $order->update([
                    'status' => 'cancelled',
                    'cancel_status' => 'approved',
                    'cancel_reason' => $data['cancel_reason'] ?? 'Khách hủy khi đơn chưa xác nhận.',
                    'cancel_requested_at' => now(),
                    'cancel_reviewed_at' => now(),
                    'payment_status' => $order->payment_status === 'paid' ? 'refunded' : $order->payment_status,
                ]);
            });

            $order->refresh();
            $orderMailService->sendStatusUpdated($order, $oldStatus, $oldPaymentStatus);

            return back()->with('success', 'Đã hủy đơn hàng.');
        }

        if ($order->canCustomerRequestCancel()) {
            $order->update([
                'cancel_status' => 'pending',
                'cancel_reason' => $data['cancel_reason'] ?? null,
                'cancel_requested_at' => now(),
                'cancel_reviewed_at' => null,
            ]);

            return back()->with('success', 'Đã gửi yêu cầu hủy. Shop sẽ duyệt trước khi hủy đơn.');
        }

        return back()->withErrors(['order' => 'Đơn hàng hiện không thể gửi yêu cầu hủy.']);
    }
}
