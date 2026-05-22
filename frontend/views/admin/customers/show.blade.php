@extends('layouts.admin')

@section('title', 'Lịch sử khách hàng')

@section('content')
<div class="admin-card mb-4">
    <h2 class="h5 fw-bold">{{ $customer->name }}</h2>
    <p class="text-muted mb-1">{{ $customer->email }} - {{ $customer->phone }}</p>
    <p class="mb-0">{{ $customer->address }}</p>
</div>
<div class="admin-card table-responsive">
    <table class="table align-middle mb-0">
        <thead><tr><th>Mã đơn</th><th>Ngày</th><th>Tổng</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>
        @foreach($customer->orders as $order)
            <tr><td>{{ $order->order_code }}</td><td>{{ $order->created_at->format('d/m/Y') }}</td><td>{{ number_format($order->total) }}đ</td><td>{{ $order->status }}</td><td><a class="btn btn-sm btn-outline-dark" href="{{ route('admin.orders.show', $order) }}">Xem</a></td></tr>
        @endforeach
        </tbody>
    </table>
</div>
@endsection
