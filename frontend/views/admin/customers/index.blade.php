@extends('layouts.admin')

@section('title', 'Quản lý Users')

@section('content')
<div class="admin-toolbar mb-4">
    <div class="admin-toolbar-row">
        <div><h2 class="h5 fw-bold mb-1">Danh sách khách hàng</h2><p class="text-muted mb-0">Thêm, sửa, khóa khách hàng và xem lịch sử đơn hàng.</p></div>
        <a class="btn btn-dark" href="{{ route('admin.customers.create') }}">Thêm khách hàng</a>
    </div>
</div>
<div class="admin-card table-responsive">
    <table class="table align-middle mb-0">
        <thead><tr><th>Tên</th><th>Email</th><th>Điện thoại</th><th>Hạng</th><th>Trạng thái</th><th>Số đơn</th><th></th></tr></thead>
        <tbody>
        @foreach($customers as $customer)
            <tr>
                <td class="fw-semibold">{{ $customer->name }}</td>
                <td>{{ $customer->email }}</td>
                <td>{{ $customer->phone }}</td>
                <td><span class="admin-status-pill muted">{{ $customer->customer_tier }}</span></td>
                <td><span class="admin-status-pill {{ $customer->status === 'active' ? 'active' : 'muted' }}">{{ $customer->status }}</span></td>
                <td>{{ $customer->orders_count }}</td>
                <td class="text-end">
                    <a class="btn btn-sm btn-outline-secondary" href="{{ route('admin.customers.show', $customer) }}">Lịch sử</a>
                    <a class="btn btn-sm btn-outline-dark" href="{{ route('admin.customers.edit', $customer) }}">Sửa</a>
                    <form method="POST" action="{{ route('admin.customers.destroy', $customer) }}" class="d-inline">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger">Khóa</button></form>
                </td>
            </tr>
        @endforeach
        </tbody>
    </table>
</div>
<div class="mt-3">{{ $customers->links() }}</div>
@endsection
