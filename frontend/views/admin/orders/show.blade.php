@extends('layouts.admin')

@section('title', 'Chi tiết đơn hàng')

@section('content')
<div class="row g-4">
    <div class="col-lg-5">
        <div class="admin-card">
            <h2 class="h5 fw-bold">{{ $order->order_code }}</h2>
            <p class="mb-1"><strong>Ngày đặt:</strong> {{ $order->placedAtLabel() }}</p>
            <p class="mb-1"><strong>Khách:</strong> {{ $order->customer_name }} - {{ $order->customer_phone }}</p>
            <p class="mb-1"><strong>Địa chỉ:</strong> {{ $order->customer_address }}</p>
            <p class="mb-1"><strong>Vận chuyển:</strong> {{ $order->shippingMethodLabel() }} - {{ number_format($order->shipping_fee) }}đ</p>
            <p class="mb-1"><strong>Coupon:</strong> {{ $order->coupon_code ?: 'Không có' }}</p>
            @if($order->product_coupon_code || $order->shipping_coupon_code)
                <p class="mb-1 small text-muted">
                    @if($order->product_coupon_code)
                        Sản phẩm: {{ $order->product_coupon_code }} (-{{ number_format($order->product_discount) }}đ)
                    @endif
                    @if($order->shipping_coupon_code)
                        {{ $order->product_coupon_code ? ' / ' : '' }}Freeship: {{ $order->shipping_coupon_code }} (-{{ number_format($order->shipping_discount) }}đ)
                    @endif
                </p>
            @endif
            <p class="mb-1"><strong>Trạng thái:</strong> <span class="{{ $order->statusBadgeClass() }}">{{ $order->statusLabel() }}</span></p>
            <p class="mb-0"><strong>Thanh toán:</strong> <span class="{{ $order->paymentBadgeClass() }}">{{ $order->paymentStatusLabel() }}</span> / {{ $order->payment_method }}</p>
            @if($order->cancel_status)
                <hr>
                <p class="mb-1"><strong>Yêu cầu hủy:</strong> {{ $order->cancelStatusLabel() }}</p>
                <p class="mb-1"><strong>Lý do:</strong> {{ $order->cancel_reason ?: 'Không nhập' }}</p>
                @if($order->cancel_status === 'pending')
                    <div class="d-flex gap-2">
                        <button type="button" class="btn btn-sm btn-outline-danger cancel-review" data-id="{{ $order->id }}" data-url="{{ route('admin.orders.cancel-request', $order) }}" data-decision="approved">Duyệt hủy</button>
                        <button type="button" class="btn btn-sm btn-outline-secondary cancel-review" data-id="{{ $order->id }}" data-url="{{ route('admin.orders.cancel-request', $order) }}" data-decision="rejected">Từ chối</button>
                    </div>
                @endif
            @endif
        </div>
    </div>
    <div class="col-lg-7">
        <div class="admin-card table-responsive">
            <table class="table align-middle mb-0">
                <thead><tr><th>Sản phẩm</th><th>Giá</th><th>SL</th><th>Tạm tính</th></tr></thead>
                <tbody>
                @foreach($order->items as $item)
                    <tr>
                        <td>
                            <div class="d-flex align-items-center gap-3">
                                <img src="{{ $item->displayImage() ?: 'https://placehold.co/120x150?text=Product' }}" alt="{{ $item->product_name }}" width="72" height="90" class="rounded" style="object-fit: cover; flex: 0 0 72px;">
                                <div>
                                    <div class="fw-semibold">{{ $item->product_name }}</div>
                                    @if($item->selected_size || $item->selected_color)
                                        <div class="small text-muted">
                                            @if($item->selected_size) Size {{ $item->selected_size }} @endif
                                            @if($item->selected_color)
                                                <span class="product-color-dot" style="--product-color: {{ $item->selected_color }}"></span>
                                                {{ $item->selected_color_name ?: $item->selected_color }}
                                            @endif
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </td>
                        <td>{{ number_format($item->unit_price) }}đ</td>
                        <td>{{ $item->quantity }}</td>
                        <td>{{ number_format($item->subtotal) }}đ</td>
                    </tr>
                @endforeach
                </tbody>
                <tfoot>
                    <tr><th colspan="3">Tổng</th><th>{{ number_format($order->total) }}đ</th></tr>
                </tfoot>
            </table>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="/assets/js/admin-orders.js?v=2026052602"></script>
@endpush
