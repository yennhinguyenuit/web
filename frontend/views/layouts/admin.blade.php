<!doctype html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Luxe Admin')</title>
    <link rel="icon" type="image/png" href="/assets/images/logo-new.png?v=2026052306">
    <link rel="apple-touch-icon" href="/assets/images/logo-new.png?v=2026052306">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/admin.css?v=2026052311">
</head>
<body class="luxe-body">
<div class="admin-shell" id="admin-shell">
    <aside class="admin-sidebar" id="admin-sidebar">
        <h1 class="admin-title">LUXE ADMIN</h1>

        <nav class="admin-nav">
            <a class="{{ request()->routeIs('admin.dashboard') ? 'active' : '' }}" href="{{ route('admin.dashboard') }}">
                <span class="admin-nav-icon"><svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z"/></svg></span>
                <span>Dashboard</span>
            </a>
            <a class="{{ request()->routeIs('admin.products.*') ? 'active' : '' }}" href="{{ route('admin.products.index') }}">
                <span class="admin-nav-icon"><svg viewBox="0 0 24 24"><path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Zm0 2.3L6.3 7.5 12 10.7l5.7-3.2L12 4.3ZM6 9.2v5.1l5 2.8V12L6 9.2Zm7 7.9 5-2.8V9.2L13 12v5.1Z"/></svg></span>
                <span>Sản phẩm</span>
            </a>
            <a class="{{ request()->routeIs('admin.orders.*') ? 'active' : '' }}" href="{{ route('admin.orders.index') }}">
                <span class="admin-nav-icon"><svg viewBox="0 0 24 24"><path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 .001 4A2 2 0 0 0 17 18ZM6.2 6l.9 5.3A3 3 0 0 0 10 14h6.9a3 3 0 0 0 2.9-2.3L21 7H7.1L6.7 4H3v2h3.2Z"/></svg></span>
                <span>Đơn hàng</span>
                @if(($adminPendingOrdersCount ?? 0) > 0)
                    <span class="admin-nav-badge">{{ $adminPendingOrdersCount }}</span>
                @endif
            </a>
            <a class="{{ request()->routeIs('admin.customers.*') ? 'active' : '' }}" href="{{ route('admin.customers.index') }}">
                <span class="admin-nav-icon"><svg viewBox="0 0 24 24"><path d="M16 11a4 4 0 1 0-3.9-4.9A5 5 0 0 1 16 11ZM8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.3 0-6 1.7-6 3.8V20h12v-2.2C14 15.7 11.3 14 8 14Zm8-.5c-.7 0-1.4.1-2 .2 1.3.9 2 2.1 2 3.6V20h6v-2c0-2.5-2.7-4.5-6-4.5Z"/></svg></span>
                <span>Khách hàng</span>
            </a>
            <a class="{{ request()->routeIs('admin.coupons.*') ? 'active' : '' }}" href="{{ route('admin.coupons.index') }}">
                <span class="admin-nav-icon"><svg viewBox="0 0 24 24"><path d="M21 7v4a2 2 0 1 0 0 4v4H3v-4a2 2 0 1 0 0-4V7h18ZM8 9.5A1.5 1.5 0 1 0 8 12.5 1.5 1.5 0 0 0 8 9.5Zm8-1.5L7 17l1.4 1.4 9-9L16 8Zm0 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/></svg></span>
                <span>Mã giảm giá</span>
            </a>
            <a class="{{ request()->routeIs('admin.flash-sales.*') ? 'active' : '' }}" href="{{ route('admin.flash-sales.index') }}">
                <span class="admin-nav-icon"><svg viewBox="0 0 24 24"><path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/></svg></span>
                <span>Flash Sale</span>
            </a>
            <a class="{{ request()->routeIs('admin.chats.*') ? 'active' : '' }}" href="{{ route('admin.chats.index') }}">
                <span class="admin-nav-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16v11H7.8L4 19V4Zm3 4v2h10V8H7Zm0 4v2h7v-2H7Z"/></svg></span>
                <span>Chat người bán</span>
                @if(($adminNewChatsCount ?? 0) > 0)
                    <span class="admin-nav-badge" data-admin-chat-unread-badge>{{ $adminNewChatsCount }}</span>
                @else
                    <span class="admin-nav-badge" data-admin-chat-unread-badge hidden></span>
                @endif
            </a>
            <a class="{{ request()->routeIs('admin.reviews.*') ? 'active' : '' }}" href="{{ route('admin.reviews.index') }}">
                <span class="admin-nav-icon"><svg viewBox="0 0 24 24"><path d="M12 17.3 18.2 21l-1.6-7 5.4-4.7-7.1-.6L12 2 9.1 8.7 2 9.3 7.4 14l-1.6 7 6.2-3.7Z"/></svg></span>
                <span>Feedback</span>
            </a>
            <a class="{{ request()->routeIs('admin.categories.*') ? 'active' : '' }}" href="{{ route('admin.categories.index') }}">
                <span class="admin-nav-icon"><svg viewBox="0 0 24 24"><path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"/></svg></span>
                <span>Danh mục</span>
            </a>
            <a class="{{ request()->routeIs('admin.reports.*') ? 'active' : '' }}" href="{{ route('admin.reports.index') }}">
                <span class="admin-nav-icon"><svg viewBox="0 0 24 24"><path d="M4 19h16v2H4v-2Zm1-8h4v6H5v-6Zm5-6h4v12h-4V5Zm5 3h4v9h-4V8Z"/></svg></span>
                <span>Báo cáo</span>
            </a>
        </nav>

        <div class="admin-user">
            <div class="admin-user-card">
                <div class="text-muted small">Đang đăng nhập</div>
                <div class="fw-bold">{{ auth()->user()->name }}</div>
                <div class="text-muted small">{{ auth()->user()->email }}</div>
            </div>
            <form method="POST" action="{{ route('logout') }}">@csrf
                <button class="luxe-btn w-100" type="submit">Logout</button>
            </form>
        </div>
    </aside>

    <main class="admin-main">
        <header class="admin-header">
            <div class="admin-header-title">
                <button type="button" class="admin-sidebar-toggle" id="admin-sidebar-toggle" aria-controls="admin-sidebar" aria-expanded="true">
                    <span></span><span></span><span></span>
                </button>
                <h1>@yield('title', 'Admin Panel')</h1>
            </div>
            <div class="admin-header-actions">
                @if(($adminPendingOrdersCount ?? 0) > 0)
                    <a class="admin-notice-link" href="{{ route('admin.orders.index') }}">{{ $adminPendingOrdersCount }} đơn mới</a>
                @endif
                @if(($adminNewChatsCount ?? 0) > 0)
                    <a class="admin-notice-link" data-admin-chat-unread-link href="{{ route('admin.chats.index') }}">{{ $adminNewChatsCount }} chat mới</a>
                @else
                    <a class="admin-notice-link" data-admin-chat-unread-link href="{{ route('admin.chats.index') }}" hidden></a>
                @endif
                <button type="button" class="admin-back-link" onclick="window.history.length > 1 ? window.history.back() : window.location.assign('{{ route('admin.dashboard') }}')">Quay lại</button>
                <a class="admin-home-link" href="{{ route('home') }}">Về trang chủ</a>
            </div>
        </header>

        <div class="admin-content">
            @if(session('success'))
                <div class="alert alert-success">{{ session('success') }}</div>
            @endif
            @if($errors->any())
                <div class="alert alert-danger">
                    @foreach($errors->all() as $error)
                        <div>{{ $error }}</div>
                    @endforeach
                </div>
            @endif
            @yield('content')
        </div>
    </main>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="/assets/js/admin-layout.js?v=2026052311"></script>
@stack('scripts')
</body>
</html>
