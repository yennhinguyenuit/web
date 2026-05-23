@extends('layouts.admin')

@section('title', 'Quản lý đơn hàng')

@section('content')
<div id="order-alert"></div>
<div class="admin-card table-responsive">
    <table class="table align-middle mb-0" id="orders-table">
        <thead><tr><th>Mã</th><th>Ngày đặt</th><th>Khách</th><th>Tổng</th><th>Đơn hàng</th><th>Thanh toán</th><th>Yêu cầu hủy</th><th>Cập nhật</th><th></th></tr></thead>
        <tbody>
        @foreach($orders as $order)
            <tr id="order-row-{{ $order->id }}" data-payment-method="{{ $order->payment_method }}">
                <td class="fw-semibold">{{ $order->order_code }}</td>
                <td>{{ optional($order->ordered_at ?? $order->created_at)->format('d/m/Y H:i') }}</td>
                <td>{{ $order->customer_name }}</td>
                <td class="fw-semibold">{{ number_format($order->total) }}đ</td>
                <td><span class="{{ $order->statusBadgeClass() }} order-status" data-status="{{ $order->status }}">{{ $order->statusLabel() }}</span></td>
                <td><span class="{{ $order->paymentBadgeClass() }} payment-status" data-status="{{ $order->payment_status }}">{{ $order->paymentStatusLabel() }}</span></td>
                <td class="cancel-request-cell">
                    @if($order->cancel_status === 'pending')
                        <div class="d-grid gap-1">
                            <span class="order-pill order-pill-pending">Chờ duyệt</span>
                            <div class="d-flex gap-1">
                                <button type="button" class="btn btn-sm btn-outline-danger cancel-review" data-id="{{ $order->id }}" data-url="{{ route('admin.orders.cancel-request', $order) }}" data-decision="approved">Duyệt</button>
                                <button type="button" class="btn btn-sm btn-outline-secondary cancel-review" data-id="{{ $order->id }}" data-url="{{ route('admin.orders.cancel-request', $order) }}" data-decision="rejected">Từ chối</button>
                            </div>
                        </div>
                    @elseif($order->cancel_status)
                        <span class="order-pill {{ $order->cancel_status === 'approved' ? 'order-pill-cancelled' : 'order-pill-confirmed' }}">{{ $order->cancelStatusLabel() }}</span>
                    @else
                        <span class="text-muted small">Không có</span>
                    @endif
                </td>
                <td>
                    <form class="order-status-form d-flex gap-2" method="POST" action="{{ route('admin.orders.status', $order) }}" data-id="{{ $order->id }}">
                        @csrf
                        @method('PATCH')
                        <select class="form-select form-select-sm status-select" name="status">@foreach(['pending','confirmed','shipping','completed','cancelled'] as $status)<option value="{{ $status }}" @selected($order->status === $status)>{{ $status }}</option>@endforeach</select>
                        <select class="form-select form-select-sm payment-select" name="payment_status">@foreach(['unpaid','pending','paid','failed','refunded'] as $status)<option value="{{ $status }}" @selected($order->payment_status === $status)>{{ $status }}</option>@endforeach</select>
                        <button type="submit" class="btn btn-sm btn-dark order-update">Lưu</button>
                    </form>
                </td>
                <td class="text-end"><a class="btn btn-sm btn-outline-dark" href="{{ route('admin.orders.show', $order) }}">Chi tiết</a></td>
            </tr>
        @endforeach
        </tbody>
    </table>
</div>
<div class="mt-3">{{ $orders->links() }}</div>
@endsection

@push('scripts')
<script src="/assets/js/admin-orders.js?v=20260523"></script>
@endpush
