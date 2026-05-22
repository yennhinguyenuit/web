@extends('layouts.frontend')

@section('title', 'Đăng nhập')

@section('content')
<section class="luxe-section">
    <div class="luxe-container" style="max-width:520px">
        <div class="admin-card">
            <h1 class="h3 fw-bold mb-4">Đăng nhập</h1>
            <form method="POST" action="{{ route('login.store') }}" class="d-grid gap-3">
                @csrf
                <input class="luxe-input" type="email" name="email" value="{{ old('email') }}" placeholder="Email" required autofocus>
                <input class="luxe-input" type="password" name="password" placeholder="Mật khẩu" required>
                <button class="luxe-btn w-100">Đăng nhập</button>
                <a class="text-center text-decoration-none" href="{{ route('register') }}">Chưa có tài khoản? Đăng ký</a>
            </form>
        </div>
    </div>
</section>
@endsection
