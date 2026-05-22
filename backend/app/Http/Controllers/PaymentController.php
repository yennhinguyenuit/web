<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class PaymentController extends Controller
{
    public function pay(Order $order, PaymentService $paymentService): View
    {
        $this->authorizeOrder($order);

        $latestTransaction = $order->paymentTransactions()->latest()->first();

        if ($order->payment_method === 'payos'
            && (! $latestTransaction || ($latestTransaction->status === 'pending' && ! $latestTransaction->payment_url))) {
            $paymentService->createOnlineTransaction($order);
        }

        $paymentService->syncPayosStatus($order);

        return view('customer.payments.pay', ['order' => $order->load('paymentTransactions', 'items')]);
    }

    public function confirm(Request $request, Order $order, PaymentService $paymentService): RedirectResponse
    {
        $this->authorizeOrder($order);
        $paymentService->markPaid($order);

        return redirect()->route('payments.result', ['order_id' => $order->id])
            ->with('success', 'Thanh toán thành công.');
    }

    public function result(Request $request, PaymentService $paymentService): View
    {
        $order = Order::with('paymentTransactions')->find($request->query('order_id'));
        abort_unless($order && ($order->user_id === Auth::id() || Auth::user()?->isAdmin()), 403);

        if ($order->payment_method === 'payos') {
            $paymentService->syncPayosReturn($order, $request->query());
            $paymentService->syncPayosStatus($order);
            $order->refresh()->load('paymentTransactions');
        }

        return view('customer.payments.result', compact('order'));
    }

    public function payosWebhook(Request $request, PaymentService $paymentService): JsonResponse
    {
        $orderCode = data_get($request->all(), 'data.orderCode') ?? $request->input('orderCode');
        $code = data_get($request->all(), 'data.code') ?? $request->input('code');
        $status = strtolower((string) (data_get($request->all(), 'data.status') ?? $request->input('status')));

        if ($orderCode && ($code === '00' || $status === 'paid')) {
            $paymentService->markPaidByPayosOrderCode($orderCode);
        }

        return response()->json(['success' => true]);
    }

    private function authorizeOrder(Order $order): void
    {
        abort_unless($order->user_id === Auth::id() || Auth::user()?->isAdmin(), 403);
    }
}

