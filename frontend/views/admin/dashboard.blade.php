@extends('layouts.admin')

@section('title', 'Dashboard')

@section('content')
<div class="admin-stat-grid">
    <div class="admin-stat"><div class="admin-stat-icon">$</div><p class="admin-stat-label">Doanh thu paid</p><p class="admin-stat-value">{{ number_format($totalRevenue) }}đ</p></div>
    <div class="admin-stat"><div class="admin-stat-icon">#</div><p class="admin-stat-label">Đơn hàng</p><p class="admin-stat-value">{{ number_format($totalOrders) }}</p></div>
    <div class="admin-stat"><div class="admin-stat-icon">P</div><p class="admin-stat-label">Sản phẩm</p><p class="admin-stat-value">{{ number_format($totalProducts) }}</p></div>
    <div class="admin-stat"><div class="admin-stat-icon">U</div><p class="admin-stat-label">Khách hàng</p><p class="admin-stat-value">{{ number_format($totalCustomers) }}</p></div>
</div>

<div class="row g-4">
    <div class="col-lg-8">
        <div class="admin-card">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="h5 fw-bold mb-0">Đơn hàng mới</h2>
                <a class="btn btn-sm btn-outline-dark" href="{{ route('admin.orders.index') }}">Xem tất cả</a>
            </div>
            <div class="table-responsive">
                <table class="table align-middle mb-0">
                    <thead><tr><th>Mã</th><th>Khách</th><th>Tổng</th><th>Trạng thái</th><th></th></tr></thead>
                    <tbody>
                    @foreach($latestOrders as $order)
                        <tr>
                            <td class="fw-semibold">{{ $order->order_code }}</td>
                            <td>{{ $order->customer_name }}</td>
                            <td class="fw-semibold">{{ number_format($order->total) }}đ</td>
                            <td><span class="{{ $order->statusBadgeClass() }}">{{ $order->statusLabel() }}</span></td>
                            <td class="text-end"><a class="btn btn-sm btn-outline-dark" href="{{ route('admin.orders.show', $order) }}">Xem</a></td>
                        </tr>
                    @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="col-lg-4">
        <div class="admin-card">
            <h2 class="h5 fw-bold mb-3">Tồn kho thấp</h2>
            @forelse($lowStockProducts as $product)
                <div class="d-flex justify-content-between border-bottom py-2"><span>{{ $product->name }}</span><strong>{{ $product->stock }}</strong></div>
            @empty
                <p class="text-muted mb-0">Chưa có sản phẩm tồn thấp.</p>
            @endforelse
        </div>
    </div>
</div>
@endsection
