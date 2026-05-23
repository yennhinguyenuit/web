@extends('layouts.admin')

@section('title', 'Mã giảm giá')

@section('content')
<div class="admin-toolbar mb-4"><div class="admin-toolbar-row"><div><h2 class="h5 fw-bold mb-1">Coupon</h2><p class="text-muted mb-0">Quản lý mã giảm giá theo phần trăm hoặc số tiền.</p></div><a class="btn btn-dark" href="{{ route('admin.coupons.create') }}">Tạo coupon</a></div></div>
<div class="admin-card table-responsive">
    <table class="table align-middle mb-0">
        <thead><tr><th>Mã</th><th>Tên</th><th>Áp dụng</th><th>Loại</th><th>Giá trị</th><th>Hạng</th><th>Đã dùng</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>
        @foreach($coupons as $coupon)
            <tr>
                <td class="fw-bold">{{ $coupon->code }}</td>
                <td>{{ $coupon->name }}</td>
                <td>{{ $coupon->targetLabel() }}</td>
                <td>{{ $coupon->discount_type }}</td>
                <td>{{ number_format($coupon->discount_value) }}</td>
                <td>{{ $coupon->customer_tier ?: 'Tất cả' }}</td>
                <td>{{ $coupon->used_count }}/{{ $coupon->usage_limit ?: '∞' }}</td>
                <td><span class="admin-status-pill {{ $coupon->is_active ? 'active' : 'muted' }}">{{ $coupon->is_active ? 'active' : 'off' }}</span></td>
                <td class="text-end"><a class="btn btn-sm btn-outline-dark" href="{{ route('admin.coupons.edit', $coupon) }}">Sửa</a><form class="d-inline" method="POST" action="{{ route('admin.coupons.destroy', $coupon) }}">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger">Tắt</button></form></td>
            </tr>
        @endforeach
        </tbody>
    </table>
</div>
<div class="mt-3">{{ $coupons->links() }}</div>
@endsection
