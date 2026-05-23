<!doctype html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Luxe Store')</title>
    <link rel="icon" type="image/png" href="/assets/images/logo-new.png?v=2026052306">
    <link rel="apple-touch-icon" href="/assets/images/logo-new.png?v=2026052306">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/app.css?v=2026052309">
    <link rel="stylesheet" href="/assets/css/frontend.css?v=2026052309">
</head>
<body class="luxe-body">
@php
    $cartCount = 0;
    if (auth()->check() && auth()->user()->cart) {
        $cartCount = auth()->user()->cart->items()->sum('quantity');
    }
@endphp

<header class="luxe-header">
    <div class="luxe-topbar">Miễn phí vận chuyển cho đơn hàng từ 500.000đ</div>

    <div class="luxe-container">
        <div class="luxe-nav">
            <a class="luxe-brand" href="{{ route('home') }}">
                <img class="luxe-logo" src="/assets/images/logo-new.png" alt="Luxe Store">
                <span>Luxe Store</span>
            </a>

            <nav class="luxe-menu">
                <a href="{{ route('home') }}">Trang chủ</a>
                <a href="{{ route('products.index') }}">Cửa hàng</a>
                <a href="{{ route('about') }}">Giới thiệu</a>
                <a href="{{ route('blog') }}">Blog</a>
                <a href="{{ route('contact') }}">Liên hệ</a>
            </nav>

            <div class="luxe-actions">
                <form class="luxe-search" action="{{ route('products.index') }}" method="GET">
                    <input class="luxe-input" name="q" value="{{ request('q') }}" placeholder="Tìm sản phẩm...">
                    <button class="luxe-btn">Tìm</button>
                </form>

                @guest
                    <a class="luxe-login-link" href="{{ route('login') }}">Đăng nhập</a>
                    <a class="luxe-btn luxe-btn-outline" href="{{ route('register') }}">Đăng ký</a>
                @else
                    <a class="luxe-login-link d-none d-md-inline text-truncate" style="max-width:160px" href="{{ route('orders.index') }}">
                        {{ auth()->user()->name }}
                    </a>
                    <form method="POST" action="{{ route('logout') }}">@csrf
                        <button class="luxe-btn luxe-btn-outline" type="submit">Đăng xuất</button>
                    </form>
                @endguest

                <a class="luxe-btn luxe-btn-square" href="{{ route('cart.index') }}" aria-label="Giỏ hàng">
                    <svg viewBox="0 0 24 24" class="luxe-cart-icon" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 7h15l-1.6 8.4a2 2 0 0 1-2 1.6H8.2a2 2 0 0 1-2-1.7L5 3H2" />
                        <path d="M9 21h.01M18 21h.01" />
                        <path d="M9 7a3 3 0 0 1 6 0" />
                    </svg>
                    <span class="luxe-cart-count">{{ $cartCount }}</span>
                </a>

                <details class="luxe-more-menu">
                    <summary>
                        <svg viewBox="0 0 24 24" class="luxe-menu-icon" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        Mục lục
                    </summary>
                    <div class="luxe-more-panel">
                        <div>
                            <p>Danh mục</p>
                            <a href="{{ route('products.index') }}">Tất cả sản phẩm</a>
                            @foreach(($layoutCategories ?? collect())->take(6) as $layoutCategory)
                                <a href="{{ route('products.index', ['category' => $layoutCategory->slug]) }}">{{ $layoutCategory->name }}</a>
                            @endforeach
                        </div>
                        <div>
                            <p>Trang khác</p>
                            <a href="{{ route('reviews') }}">Đánh giá</a>
                            <a href="{{ route('faq') }}">FAQ</a>
                            <a href="{{ route('size-guide') }}">Bảng size</a>
                            <a href="{{ route('shipping-returns') }}">Vận chuyển & đổi trả</a>
                            <a href="{{ route('gift-cards') }}">Thẻ quà tặng</a>
                            @auth
                                <a href="{{ route('orders.index') }}">Đơn hàng</a>
                                <a href="{{ route('contact') }}">Chat với người bán</a>
                                @if(auth()->user()->isAdmin())
                                    <a class="luxe-more-admin" href="{{ route('admin.dashboard') }}">Quản trị</a>
                                @endif
                            @else
                                <a href="{{ route('contact') }}">Chat với người bán</a>
                            @endauth
                        </div>
                    </div>
                </details>
            </div>
        </div>
    </div>
</header>

@if(session('success'))
    <div class="luxe-alert alert alert-success">{{ session('success') }}</div>
@endif
@if($errors->any())
    <div class="luxe-alert alert alert-danger">
        @foreach($errors->all() as $error)
            <div>{{ $error }}</div>
        @endforeach
    </div>
@endif

<main class="luxe-main">
    @yield('content')
</main>

<footer class="luxe-footer">
    <div class="luxe-container luxe-footer-grid">
        <div>
            <a class="luxe-brand luxe-footer-brand" href="{{ route('home') }}">
                <img class="luxe-logo" src="/assets/images/logo-new.png" alt="Luxe Store">
                <span>Luxe Store</span>
            </a>
            <p>Thời trang ứng dụng, sản phẩm dễ chọn, đặt hàng nhanh và hỗ trợ trực tiếp cho khách hàng.</p>
        </div>
        <div>
            <h3>Mua sắm</h3>
            <a href="{{ route('products.index') }}">Tất cả sản phẩm</a>
            @foreach(($layoutCategories ?? collect())->take(4) as $layoutCategory)
                <a href="{{ route('products.index', ['category' => $layoutCategory->slug]) }}">{{ $layoutCategory->name }}</a>
            @endforeach
        </div>
        <div>
            <h3>Hỗ trợ</h3>
            <a href="{{ route('contact') }}">Chat với người bán</a>
            <a href="{{ route('orders.index') }}">Tra cứu đơn hàng</a>
            <a href="{{ route('shipping-returns') }}">Vận chuyển & đổi trả</a>
            <a href="{{ route('faq') }}">Câu hỏi thường gặp</a>
        </div>
        <div>
            <h3>Liên hệ</h3>
            <p>Email: support@luxestore.test</p>
            <p>Hotline: 0900 000 000</p>
            <p>Địa chỉ: 12 Nguyễn Trãi, Quận 1, TP.HCM</p>
        </div>
    </div>
    <div class="luxe-container luxe-footer-bottom">
        <span>© {{ date('Y') }} Luxe Store.</span>
        <span>Laravel MVC · PostgreSQL · Blade</span>
    </div>
</footer>

@auth
    <div id="chatbot-box" class="chatbot-box">
        <button type="button" id="chatbot-toggle" class="chatbot-toggle" aria-expanded="false" aria-controls="chatbot-card" aria-label="Mở trợ lý mua sắm">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 5.5A4.5 4.5 0 0 1 9.5 1h5A4.5 4.5 0 0 1 19 5.5v4A4.5 4.5 0 0 1 14.5 14H11l-4.2 3.2A1.1 1.1 0 0 1 5 16.3V14.2A4.5 4.5 0 0 1 1 9.8V5.5Z" />
                <path d="M8 7h8M8 10h5" />
            </svg>
        </button>
        <div id="chatbot-card" class="chatbot-card" hidden>
            <div class="chatbot-head">
                <span>Trợ lý mua sắm</span>
                <button type="button" class="chat-close-btn" id="chatbot-close" aria-label="Đóng chatbot">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                </button>
            </div>
            <div class="chatbot-body">
                <p class="chatbot-subtitle">Hỏi mình về sản phẩm, size, mã giảm giá hoặc đơn hàng.</p>
                <div id="chatbot-log" class="chatbot-log"></div>
                <div class="chatbot-suggestions" aria-label="Câu hỏi gợi ý">
                    <button type="button" data-chatbot-suggestion="Tôi cao 160cm nặng 50kg, gợi ý sản phẩm phù hợp">Gợi ý theo size</button>
                    <button type="button" data-chatbot-suggestion="Gợi ý sản phẩm bán chạy hôm nay">Sản phẩm bán chạy</button>
                    <button type="button" data-chatbot-suggestion="Tôi kiểm tra trạng thái đơn hàng ở đâu?">Trạng thái đơn hàng</button>
                    <button type="button" data-chatbot-suggestion="Có mã giảm giá nào dùng được không?">Mã giảm giá</button>
                    <button type="button" data-chatbot-suggestion="Thanh toán online hoạt động như thế nào?">Thanh toán online</button>
                </div>
                <form id="chatbot-form" class="chatbot-form" method="POST" action="{{ route('chatbot.send') }}">
                    @csrf
                    <input id="chatbot-message" class="luxe-input" placeholder="Hỏi sản phẩm, size, cân nặng, coupon...">
                    <button class="luxe-btn">Gửi</button>
                </form>
            </div>
        </div>
    </div>
@endauth

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="/assets/js/chatbot.js?v=2026052305"></script>
<script src="/assets/js/seller-chat.js?v=20260523"></script>
@stack('scripts')
</body>
</html>
