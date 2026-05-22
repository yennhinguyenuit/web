@extends('layouts.frontend')
@section('title', 'Kết quả thanh toán')
@section('content')
<section class="luxe-section">
<div class="luxe-container">
<div class="bg-white border rounded-3 p-4">
    <h1 class="h3">Kết quả thanh toán</h1>
    <p>Đơn hàng: <strong>{{ $order->order_code }}</strong></p>
    <p>Trạng thái thanh toán: <span class="{{ $order->paymentBadgeClass() }}">{{ $order->paymentStatusLabel() }}</span></p>
    @if($order->payment_method === 'payos' && $order->payment_status !== 'paid')
        <p class="text-muted">Nếu bạn vừa thanh toán PayOS, hãy chờ vài giây rồi tải lại trang để hệ thống nhận webhook/kết quả từ PayOS.</p>
    @endif
    <a href="{{ route('orders.show', $order) }}" class="btn btn-dark">Xem đơn hàng</a>
</div>
</div>
</section>
@endsection

