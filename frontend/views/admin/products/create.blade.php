@extends('layouts.admin')

@section('title', 'Thêm sản phẩm')

@section('content')
<div class="admin-page-actions">
    <a class="btn btn-outline-dark" href="{{ route('admin.products.index') }}">Quay về danh sách sản phẩm</a>
</div>

<div class="admin-card">
    <form method="POST" action="{{ route('admin.products.store') }}" class="row g-3" enctype="multipart/form-data">
        @csrf
        @include('admin.products.partials.form')
        <div class="col-12"><button class="btn btn-dark">Thêm sản phẩm</button></div>
    </form>
</div>
@endsection

@push('scripts')
<script src="{{ asset('assets/js/admin-product-upload.js') }}"></script>
@endpush
