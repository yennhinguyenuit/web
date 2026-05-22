@extends('layouts.frontend')
@section('title', 'Đơn hàng của tôi')
@section('content')
<section class="luxe-section">
<div class="luxe-container">
<h1 class="h3 mb-3">Đơn hàng của tôi</h1>
<div class="bg-white border rounded-3 table-responsive">
    <table class="table mb-0 align-middle">
        <thead><tr><th>Mã</th><th>Ngày</th><th>Tổng</th><th>Trạng thái</th><th>Thanh toán</th><th></th></tr></thead>
        <tbody>
        @foreach($orders as $order)
            <tr>
                <td>{{ $order->order_code }}</td>
                <td>{{ optional($order->ordered_at ?? $order->created_at)->format('d/m/Y') }}</td>
                <td>{{ number_format($order->total) }}đ</td>
                <td><span class="{{ $order->statusBadgeClass() }}">{{ $order->statusLabel() }}</span></td>
                <td><span class="{{ $order->paymentBadgeClass() }}">{{ $order->paymentStatusLabel() }}</span></td>
                <td><a class="btn btn-sm btn-outline-dark" href="{{ route('orders.show', $order) }}">Chi tiết</a></td>
            </tr>
        @endforeach
        </tbody>
    </table>
</div>
<div class="mt-3">{{ $orders->links() }}</div>
</div>
</section>
@endsection

