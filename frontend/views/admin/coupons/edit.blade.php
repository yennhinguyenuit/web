@extends('layouts.admin')

@section('title', 'Sửa coupon')

@section('content')
<div class="admin-card">
    <form method="POST" action="{{ route('admin.coupons.update', $coupon) }}" class="row g-3">
        @csrf
        @method('PUT')
        @include('admin.coupons.partials.form')
        <div class="col-12"><button class="btn btn-dark">Cập nhật coupon</button></div>
    </form>
</div>
@endsection
