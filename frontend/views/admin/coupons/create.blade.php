@extends('layouts.admin')

@section('title', 'Tạo coupon')

@section('content')
<div class="admin-card">
    <form method="POST" action="{{ route('admin.coupons.store') }}" class="row g-3">
        @csrf
        @include('admin.coupons.partials.form')
        <div class="col-12"><button class="btn btn-dark">Tạo coupon</button></div>
    </form>
</div>
@endsection
