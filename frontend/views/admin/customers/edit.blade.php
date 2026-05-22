@extends('layouts.admin')

@section('title', 'Sửa khách hàng')

@section('content')
<div class="admin-card">
    <form method="POST" action="{{ route('admin.customers.update', $customer) }}" class="row g-3">
        @csrf
        @method('PUT')
        @include('admin.customers.partials.form')
        <div class="col-12"><button class="btn btn-dark">Cập nhật khách hàng</button></div>
    </form>
</div>
@endsection
