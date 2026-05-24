@extends('layouts.frontend')

@section('title', 'Tài khoản của tôi')

@section('content')
<section class="account-hero">
    <div class="luxe-container account-hero-inner">
        <div>
            <p class="luxe-eyebrow">My Luxe</p>
            <h1>Xin chào, {{ $user->name }}</h1>
            <p>Quản lý thông tin cá nhân, địa chỉ giao hàng, bảo mật tài khoản và theo dõi hạng khách hàng của bạn.</p>
        </div>
        <div class="account-tier-card">
            <span>Hạng hiện tại</span>
            <strong>{{ $tier['label'] }}</strong>
            <small>{{ $tier['accent'] }}</small>
            <div class="account-tier-progress">
                <i style="width: {{ $tier['progress'] }}%"></i>
            </div>
            @if($tier['next_label'])
                <em>Còn {{ number_format($tier['remaining']) }}đ để lên {{ $tier['next_label'] }}</em>
            @else
                <em>Bạn đang ở hạng cao nhất của Luxe.</em>
            @endif
        </div>
    </div>
</section>

<section class="account-section">
    <div class="luxe-container account-metrics">
        <article>
            <span>Tổng đã chi</span>
            <strong>{{ number_format($totalSpent) }}đ</strong>
            <small>Tính các đơn đã thanh toán hoặc hoàn thành</small>
        </article>
        <article>
            <span>Tổng đơn</span>
            <strong>{{ $orderCount }}</strong>
            <small>{{ $completedOrderCount }} đơn hoàn thành</small>
        </article>
        <article>
            <span>Đang xử lý</span>
            <strong>{{ $pendingOrderCount }}</strong>
            <small>Pending, confirmed hoặc shipping</small>
        </article>
        <article>
            <span>Liên hệ</span>
            <strong>{{ $user->phone ?: 'Chưa có' }}</strong>
            <small>{{ $user->email }}</small>
        </article>
    </div>
</section>

<section class="account-section account-section-soft">
    <div class="luxe-container account-layout">
        <div class="account-panel">
            <div class="account-panel-head">
                <p class="luxe-eyebrow text-dark">Thông tin cá nhân</p>
                <h2>Hồ sơ & địa chỉ giao hàng</h2>
            </div>
            <form method="POST" action="{{ route('account.profile') }}" class="account-form">
                @csrf
                @method('PATCH')
                <div class="account-form-grid">
                    <label>
                        <span>Họ tên</span>
                        <input class="luxe-input" name="name" value="{{ old('name', $user->name) }}" required>
                    </label>
                    <label>
                        <span>Email</span>
                        <input class="luxe-input" type="email" name="email" value="{{ old('email', $user->email) }}" required>
                    </label>
                    <label>
                        <span>Số điện thoại</span>
                        <input class="luxe-input" name="phone" value="{{ old('phone', $user->phone) }}">
                    </label>
                    <label class="account-form-wide">
                        <span>Địa chỉ mặc định</span>
                        <textarea class="luxe-textarea" name="address" rows="4">{{ old('address', $user->address) }}</textarea>
                    </label>
                </div>
                <button class="luxe-btn">Lưu thông tin</button>
            </form>
        </div>

        <div class="account-panel account-panel-dark">
            <div class="account-panel-head">
                <p class="luxe-eyebrow">Bảo mật</p>
                <h2>Đổi mật khẩu</h2>
            </div>
            <form method="POST" action="{{ route('account.password') }}" class="account-form">
                @csrf
                @method('PATCH')
                <label>
                    <span>Mật khẩu hiện tại</span>
                    <input class="luxe-input" type="password" name="current_password" required>
                </label>
                <label>
                    <span>Mật khẩu mới</span>
                    <input class="luxe-input" type="password" name="password" required>
                </label>
                <label>
                    <span>Nhập lại mật khẩu mới</span>
                    <input class="luxe-input" type="password" name="password_confirmation" required>
                </label>
                <button class="luxe-btn luxe-btn-outline">Cập nhật mật khẩu</button>
            </form>
        </div>
    </div>
</section>

<section class="account-section">
    <div class="luxe-container account-orders">
        <div class="account-panel-head">
            <p class="luxe-eyebrow text-dark">Đơn hàng gần đây</p>
            <h2>Theo dõi những món đang trên đường đến tủ đồ của bạn</h2>
        </div>
        <div class="account-order-list">
            @forelse($recentOrders as $order)
                <a href="{{ route('orders.show', $order) }}" class="account-order-card">
                    <span>{{ $order->order_code }}</span>
                    <strong>{{ number_format($order->total) }}đ</strong>
                    <small>{{ $order->placedAtLabel('d/m/Y') }}</small>
                    <em class="{{ $order->statusBadgeClass() }}">{{ $order->statusLabel() }}</em>
                </a>
            @empty
                <div class="account-empty">Bạn chưa có đơn hàng nào. Bắt đầu chọn món đầu tiên cho tủ đồ Luxe.</div>
            @endforelse
        </div>
        <div class="mt-3">
            <a class="luxe-btn luxe-btn-outline" href="{{ route('orders.index') }}">Xem tất cả đơn hàng</a>
            <a class="luxe-btn" href="{{ route('products.index') }}">Tiếp tục mua sắm</a>
        </div>
    </div>
</section>
@endsection
