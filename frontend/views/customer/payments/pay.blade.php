@extends('layouts.frontend')

@section('title', 'Thanh toán')

@section('content')
@php
    $transaction = $order->paymentTransactions->sortByDesc('created_at')->first();
    $qrPayload = $transaction?->qr_code ?: $transaction?->payment_url ?: $order->order_code;
    $qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=260x260&data='.urlencode($qrPayload);
@endphp

<section class="luxe-section">
    <div class="luxe-container">
        <h1 class="h3 mb-3">Thanh toán đơn {{ $order->order_code }}</h1>

        <div class="bg-white border rounded-3 p-4">
            <p>Ngày đặt hàng: <strong>{{ optional($order->ordered_at ?? $order->created_at)->format('d/m/Y H:i') }}</strong></p>
            <p>Tổng thanh toán: <strong>{{ number_format($order->total) }}đ</strong></p>

            @if($order->payment_method === 'payos')
                <p class="fw-bold mb-1">Thanh toán qua PayOS</p>
                <p class="text-muted">{{ $transaction?->note ?? 'Hệ thống đang chuẩn bị link thanh toán PayOS.' }}</p>

                @if($order->payment_status === 'paid')
                    <div class="alert alert-success">Đơn hàng đã thanh toán PayOS thành công.</div>
                @elseif($transaction?->payment_url)
                    <a class="luxe-btn mb-3" href="{{ $transaction->payment_url }}">
                        Mở cổng thanh toán PayOS
                    </a>
                    <a class="luxe-btn luxe-btn-outline mb-3" href="{{ route('payments.result', ['order_id' => $order->id]) }}">
                        Kiểm tra trạng thái thanh toán
                    </a>
                @else
                    <div class="alert alert-warning">
                        Chưa tạo được link PayOS. Vui lòng kiểm tra lại cấu hình PayOS hoặc thử đặt lại đơn.
                    </div>
                @endif
            @else
                <p>Đơn hàng dùng phương thức thanh toán khi nhận hàng.</p>
            @endif

            @if($transaction)
                <div class="payment-qr-box mt-3">
                    <div>
                        <h2 class="h5 fw-bold mb-2">Mã QR thanh toán</h2>
                        <p class="text-muted mb-2">Quét mã QR này để mở thông tin thanh toán. Với PayOS, mã QR dùng dữ liệu/link thanh toán được tạo từ giao dịch.</p>
                        <div class="small text-muted">Mã giao dịch: <strong>{{ $transaction->transaction_code }}</strong></div>
                    </div>
                    <img src="{{ $qrImageUrl }}" alt="QR thanh toán {{ $order->order_code }}" width="260" height="260">
                </div>
            @endif

            @if($order->payment_status === 'paid')
                <div class="alert alert-success mt-3 mb-0">Đơn hàng đã thanh toán.</div>
            @endif
        </div>
    </div>
</section>
@endsection
