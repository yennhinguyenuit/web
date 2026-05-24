@extends('layouts.frontend')

@section('title', 'Đơn hàng của tôi')

@section('content')
<section class="orders-page-hero">
    <div class="luxe-container orders-page-hero-inner">
        <div>
            <p class="luxe-eyebrow">Order wardrobe</p>
            <h1>Đơn hàng của tôi</h1>
            <p>Theo dõi món đã đặt, trạng thái thanh toán và hành trình giao hàng trong một màn hình gọn gàng.</p>
        </div>
        <a class="luxe-btn luxe-btn-outline" href="{{ route('account.show') }}">Tài khoản của tôi</a>
    </div>
</section>

<section class="orders-page-section">
    <div class="luxe-container">
        <div class="orders-metrics">
            <article>
                <span>Tổng đơn</span>
                <strong>{{ $orderStats['total'] ?? $orders->total() }}</strong>
                <small>Tất cả đơn đã tạo</small>
            </article>
            <article>
                <span>Đã chi</span>
                <strong>{{ number_format($orderStats['spent'] ?? 0) }}đ</strong>
                <small>Đơn đã thanh toán hoặc hoàn thành</small>
            </article>
            <article>
                <span>Đang xử lý</span>
                <strong>{{ $orderStats['active'] ?? 0 }}</strong>
                <small>Pending, xác nhận hoặc đang giao</small>
            </article>
            <article>
                <span>Hoàn thành</span>
                <strong>{{ $orderStats['completed'] ?? 0 }}</strong>
                <small>Đã giao thành công</small>
            </article>
        </div>

        <div class="orders-table-card">
            <div class="orders-table-head">
                <div>
                    <p class="luxe-eyebrow text-dark">Order history</p>
                    <h2>Lịch sử mua sắm</h2>
                </div>
                <a class="luxe-btn" href="{{ route('products.index') }}">Mua thêm</a>
            </div>

            @if($orders->count())
                <div class="table-responsive">
                    <table class="orders-table">
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Ngày</th>
                                <th>Tổng</th>
                                <th>Trạng thái</th>
                                <th>Thanh toán</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($orders as $order)
                                <tr>
                                    <td>
                                        <strong>{{ $order->order_code }}</strong>
                                        <small>{{ $order->items->count() }} sản phẩm</small>
                                    </td>
                                    <td>{{ $order->placedAtLabel('d/m/Y') }}</td>
                                    <td><b>{{ number_format($order->total) }}đ</b></td>
                                    <td><span class="{{ $order->statusBadgeClass() }}">{{ $order->statusLabel() }}</span></td>
                                    <td><span class="{{ $order->paymentBadgeClass() }}">{{ $order->paymentStatusLabel() }}</span></td>
                                    <td><a class="luxe-btn luxe-btn-outline orders-detail-btn" href="{{ route('orders.show', $order) }}">Chi tiết</a></td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @else
                <div class="orders-empty">
                    <p class="luxe-eyebrow text-dark">Chưa có đơn hàng</p>
                    <h2>Tủ đồ Luxe của bạn đang chờ món đầu tiên.</h2>
                    <p>Khám phá sản phẩm mới, chọn size phù hợp và quay lại đây để theo dõi đơn sau khi checkout.</p>
                    <a class="luxe-btn" href="{{ route('products.index') }}">Khám phá sản phẩm</a>
                </div>
            @endif
        </div>

        <div class="orders-pagination">{{ $orders->links() }}</div>
    </div>
</section>
@endsection
