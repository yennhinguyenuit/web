@extends('layouts.frontend')

@section('title', 'Đăng ký')

@section('content')
<section class="luxe-section">
    <div class="luxe-container" style="max-width:640px">
        <div class="admin-card">
            <h1 class="h3 fw-bold mb-4">Đăng ký</h1>
            <form method="POST" action="{{ route('register.store') }}" class="row g-3">
                @csrf
                <div class="col-md-6"><input class="luxe-input" name="name" value="{{ old('name') }}" placeholder="Họ tên" required></div>
                <div class="col-md-6"><input class="luxe-input" type="email" name="email" value="{{ old('email') }}" placeholder="Email" required></div>
                <div class="col-md-6"><input class="luxe-input" name="phone" value="{{ old('phone') }}" placeholder="Điện thoại"></div>
                <div class="col-md-6"><input class="luxe-input" name="address" value="{{ old('address') }}" placeholder="Địa chỉ"></div>
                <div class="col-md-6"><input class="luxe-input" type="password" name="password" placeholder="Mật khẩu" required></div>
                <div class="col-md-6"><input class="luxe-input" type="password" name="password_confirmation" placeholder="Nhập lại mật khẩu" required></div>
                <div class="col-12"><button class="luxe-btn w-100">Đăng ký</button></div>
            </form>
        </div>
    </div>
</section>
@endsection
