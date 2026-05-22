<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Mail;
use Throwable;

class OrderMailService
{
    public function sendOrderPlaced(Order $order): void
    {
        $this->send($order, 'emails.order-placed', 'Hóa đơn đặt hàng - '.$order->order_code);
    }

    public function sendStatusUpdated(Order $order, ?string $oldStatus = null, ?string $oldPaymentStatus = null): void
    {
        $this->send(
            $order,
            'emails.order-status-updated',
            'Cập nhật trạng thái đơn hàng - '.$order->order_code,
            [
                'oldStatus' => $oldStatus,
                'oldPaymentStatus' => $oldPaymentStatus,
            ]
        );
    }

    private function send(Order $order, string $view, string $subject, array $extraData = []): void
    {
        try {
            $order->loadMissing('items', 'user', 'productCoupon', 'shippingCoupon');
            $email = $order->user?->email;

            if (! $email) {
                return;
            }

            Mail::send($view, array_merge(['order' => $order], $extraData), function ($message) use ($order, $email, $subject) {
                $message
                    ->to($email, $order->customer_name)
                    ->subject($subject);
            });
        } catch (Throwable $exception) {
            report($exception);
        }
    }
}
