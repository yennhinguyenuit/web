@extends('layouts.admin')

@section('title', 'Thêm khách hàng')

@section('content')
<div class="admin-card">
    <form method="POST" action="{{ route('admin.customers.store') }}" class="row g-3">
        @csrf
        @include('admin.customers.partials.form')
        <div class="col-12"><button class="btn btn-dark">Thêm khách hàng</button></div>
    </form>
</div>
@endsection
