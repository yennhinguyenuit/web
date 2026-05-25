<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderMailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class OrderController extends Controller
{
    public function index(): View
    {
        return view('admin.orders.index', [
            'orders' => Order::with('user')->latest()->paginate(15),
        ]);
    }

    public function show(Order $order): View
    {
        $relations = ['items.product', 'user', 'coupon', 'productCoupon', 'shippingCoupon', 'paymentTransactions'];

        if (Schema::hasTable('product_variants') && Schema::hasColumn('order_items', 'product_variant_id')) {
            $relations[] = 'items.productVariant.product';
        }

        return view('admin.orders.show', ['order' => $order->load($relations)]);
    }

    public function updateStatus(Request $request, Order $order, OrderMailService $orderMailService): JsonResponse|RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'confirmed', 'shipping', 'completed', 'cancelled'])],
            'payment_status' => ['nullable', Rule::in(['unpaid', 'pending', 'paid', 'failed', 'refunded'])],
        ]);
        $oldStatus = $order->status;
        $oldPaymentStatus = $order->payment_status;

        DB::transaction(function () use ($order, $data) {
            $order->loadMissing('items.product');
            $wasCancelled = $order->status === 'cancelled';
            $nextStatus = $data['status'];

            if ($nextStatus === 'cancelled' && ! $wasCancelled) {
                foreach ($order->items as $item) {
                    $item->product()->increment('stock', $item->quantity);
                }
            }

            $nextPaymentStatus = $data['payment_status'] ?? ($nextStatus === 'completed' ? 'paid' : $order->payment_status);

            if ($order->payment_method === 'cod' && $nextStatus === 'completed') {
                $nextPaymentStatus = 'paid';
            }

            $order->update([
                'status' => $nextStatus,
                'payment_status' => $nextPaymentStatus,
            ]);
        });

        $order->refresh();
        if ($order->status !== $oldStatus || $order->payment_status !== $oldPaymentStatus) {
            $orderMailService->sendStatusUpdated($order, $oldStatus, $oldPaymentStatus);
        }

        $message = 'Đã cập nhật trạng thái đơn hàng.';

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => $message,
                'order' => $order,
            ]);
        }

        return back()->with('success', $message);
    }

    public function reviewCancel(Request $request, Order $order, OrderMailService $orderMailService): JsonResponse|RedirectResponse
    {
        $data = $request->validate([
            'decision' => ['required', Rule::in(['approved', 'rejected'])],
        ]);

        if ($order->cancel_status !== 'pending') {
            $message = 'Đơn hàng không có yêu cầu hủy đang chờ duyệt.';

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $message,
                ], 422);
            }

            return back()->withErrors(['order' => $message]);
        }

        $oldStatus = $order->status;
        $oldPaymentStatus = $order->payment_status;

        DB::transaction(function () use ($order, $data) {
            $order->loadMissing('items.product');

            if ($data['decision'] === 'approved') {
                foreach ($order->items as $item) {
                    $item->product()->increment('stock', $item->quantity);
                }

                $order->update([
                    'status' => 'cancelled',
                    'cancel_status' => 'approved',
                    'cancel_reviewed_at' => now(),
                    'payment_status' => $order->payment_status === 'paid' ? 'refunded' : $order->payment_status,
                ]);

                return;
            }

            $order->update([
                'cancel_status' => 'rejected',
                'cancel_reviewed_at' => now(),
            ]);
        });

        $order->refresh();
        if ($order->status !== $oldStatus || $order->payment_status !== $oldPaymentStatus) {
            $orderMailService->sendStatusUpdated($order, $oldStatus, $oldPaymentStatus);
        }

        $message = $data['decision'] === 'approved'
            ? 'Đã duyệt hủy đơn hàng.'
            : 'Đã từ chối yêu cầu hủy. Đơn hàng sẽ tiếp tục được giao.';

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => $message,
                'order' => $order,
            ]);
        }

        return back()->with('success', $message);
    }
}

