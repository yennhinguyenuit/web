<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class PaymentService
{
    public function createOnlineTransaction(Order $order): ?PaymentTransaction
    {
        if ($order->payment_method !== 'payos') {
            return null;
        }

        return $this->createPayosTransaction($order);
    }

    public function markPaid(Order $order): PaymentTransaction
    {
        $oldPaymentStatus = $order->payment_status;
        $transaction = $order->paymentTransactions()->latest()->first()
            ?: $this->createOnlineTransaction($order);

        $transaction->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $order->update(['payment_status' => 'paid']);
        if ($oldPaymentStatus !== 'paid') {
            app(OrderMailService::class)->sendStatusUpdated($order->fresh(), $order->status, $oldPaymentStatus);
        }

        return $transaction;
    }

    public function markPaidByPayosOrderCode(int|string $payosOrderCode): ?PaymentTransaction
    {
        $transaction = PaymentTransaction::where('transaction_code', 'PAYOS-'.$payosOrderCode)->first();

        if (! $transaction) {
            return null;
        }

        $transaction->load('order');
        $this->markPaid($transaction->order);

        return $transaction->fresh();
    }

    public function syncPayosReturn(Order $order, array $payload): void
    {
        $code = (string) ($payload['code'] ?? '');
        $status = strtolower((string) ($payload['status'] ?? ''));
        $cancelled = filter_var($payload['cancel'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if ($cancelled) {
            $order->paymentTransactions()->where('provider', 'payos')->latest()->first()?->update(['status' => 'cancelled']);
            return;
        }

        if ($code === '00' || $status === 'paid') {
            $this->markPaid($order);
            return;
        }

        $this->syncPayosStatus($order);
    }

    public function syncPayosStatus(Order $order): void
    {
        if ($order->payment_method !== 'payos' || $order->payment_status === 'paid' || ! $this->hasPayosConfig()) {
            return;
        }

        $transaction = $order->paymentTransactions()->where('provider', 'payos')->latest()->first();

        if (! $transaction?->bank_reference) {
            return;
        }

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'x-client-id' => config('services.payos.client_id'),
                    'x-api-key' => config('services.payos.api_key'),
                ])
                ->get(rtrim(config('services.payos.api_base_url'), '/').'/v2/payment-requests/'.$transaction->bank_reference);

            if (! $response->successful()) {
                return;
            }

            $status = strtolower((string) (
                data_get($response->json(), 'data.status')
                ?? data_get($response->json(), 'status')
            ));

            if (in_array($status, ['paid', 'success'], true)) {
                $this->markPaid($order);
            }
        } catch (Throwable) {
            return;
        }
    }

    private function createPayosTransaction(Order $order): PaymentTransaction
    {
        $order->loadMissing('items');

        $payosOrderCode = $this->payosOrderCode($order);
        $paymentUrl = null;
        $qrCode = $this->payosFallbackQrPayload($order, $payosOrderCode);
        $note = 'PayOS chưa cấu hình đủ PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY.';

        if ($this->hasPayosConfig()) {
            [$paymentUrl, $note, $qrCode] = array_pad($this->requestPayosPaymentLink($order, $payosOrderCode), 3, $qrCode);
        }

        return PaymentTransaction::updateOrCreate(
            [
                'order_id' => $order->id,
                'provider' => 'payos',
            ],
            [
                'transaction_code' => 'PAYOS-'.$payosOrderCode,
                'amount' => $order->total,
                'status' => 'pending',
                'payment_url' => $paymentUrl,
                'qr_code' => $qrCode ?: $paymentUrl ?: $this->payosFallbackQrPayload($order, $payosOrderCode),
                'bank_reference' => (string) $payosOrderCode,
                'note' => $note,
            ]
        );
    }

    private function requestPayosPaymentLink(Order $order, int $payosOrderCode): array
    {
        $payload = [
            'orderCode' => $payosOrderCode,
            'amount' => (int) round((float) $order->total),
            'description' => Str::limit('Luxe '.$order->id, 25, ''),
            'returnUrl' => $this->payosReturnUrl($order),
            'cancelUrl' => $this->payosCancelUrl($order),
            'items' => $order->items->map(fn ($item) => [
                'name' => Str::limit($item->product_name, 40, ''),
                'quantity' => (int) $item->quantity,
                'price' => (int) round((float) $item->unit_price),
            ])->values()->all(),
        ];

        $expireMinutes = (int) config('services.payos.expire_minutes', 15);
        if ($expireMinutes > 0) {
            $payload['expiredAt'] = now()->addMinutes($expireMinutes)->timestamp;
        }

        $payload['signature'] = $this->payosSignature($payload);

        try {
            $response = Http::timeout(12)
                ->withHeaders([
                    'x-client-id' => config('services.payos.client_id'),
                    'x-api-key' => config('services.payos.api_key'),
                    'Content-Type' => 'application/json',
                ])
                ->post(config('services.payos.api_url'), $payload);

            if (! $response->successful()) {
                return [
                    null,
                    'Không tạo được link PayOS. Vui lòng kiểm tra lại cấu hình PayOS.',
                    $this->payosFallbackQrPayload($order, $payosOrderCode),
                ];
            }

            $checkoutUrl = data_get($response->json(), 'data.checkoutUrl')
                ?? data_get($response->json(), 'checkoutUrl');
            $qrCode = data_get($response->json(), 'data.qrCode')
                ?? data_get($response->json(), 'qrCode')
                ?? $checkoutUrl;

            if (! $checkoutUrl) {
                return [
                    null,
                    'PayOS phản hồi thành công nhưng không có checkoutUrl.',
                    $qrCode ?: $this->payosFallbackQrPayload($order, $payosOrderCode),
                ];
            }

            return [$checkoutUrl, 'Link thanh toán PayOS đã được tạo.', $qrCode];
        } catch (Throwable) {
            return [
                null,
                'Không kết nối được PayOS. Vui lòng thử lại sau.',
                $this->payosFallbackQrPayload($order, $payosOrderCode),
            ];
        }
    }

    private function payosSignature(array $payload): string
    {
        $data = [
            'amount' => $payload['amount'],
            'cancelUrl' => $payload['cancelUrl'],
            'description' => $payload['description'],
            'orderCode' => $payload['orderCode'],
            'returnUrl' => $payload['returnUrl'],
        ];

        ksort($data);

        $raw = collect($data)
            ->map(fn ($value, $key) => $key.'='.$value)
            ->implode('&');

        return hash_hmac('sha256', $raw, (string) config('services.payos.checksum_key'));
    }

    private function hasPayosConfig(): bool
    {
        return filled(config('services.payos.client_id'))
            && filled(config('services.payos.api_key'))
            && filled(config('services.payos.checksum_key'));
    }

    private function payosOrderCode(Order $order): int
    {
        return (int) (now()->format('ymdHis').str_pad((string) ($order->id % 100), 2, '0', STR_PAD_LEFT));
    }

    private function payosReturnUrl(Order $order): string
    {
        return url(config('services.payos.return_path', '/payment/result')).'?order_id='.$order->id;
    }

    private function payosCancelUrl(Order $order): string
    {
        return url(config('services.payos.cancel_path', '/payment/result')).'?order_id='.$order->id.'&cancel=true';
    }

    private function payosFallbackQrPayload(Order $order, int $payosOrderCode): string
    {
        return 'PayOS '.$payosOrderCode.' '.$order->order_code.' '.number_format((float) $order->total, 0, '', '');
    }
}
