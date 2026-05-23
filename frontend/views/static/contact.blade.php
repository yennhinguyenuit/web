@extends('layouts.frontend')

@section('title', 'Liên hệ')

@section('content')
<section class="luxe-static-hero">
    <div class="luxe-container">
        <p class="luxe-eyebrow">Luxe Store Support</p>
        <h1 class="luxe-section-title text-white">Liên hệ người bán</h1>
        <p class="luxe-section-desc text-white-50">Khách hàng có thể gửi tin nhắn trực tiếp cho người bán tại đây. Admin sẽ phản hồi trong trang quản trị.</p>
    </div>
</section>

<section class="luxe-section luxe-section-soft">
    <div class="luxe-container contact-grid">
        <div class="admin-card contact-info-card">
            <p class="luxe-eyebrow text-dark mb-2">Thông tin hỗ trợ</p>
            <h2 class="h3 fw-bold mb-3">Luxe Store</h2>
            <div class="contact-info-list">
                <div>
                    <strong>Hotline</strong>
                    <span>0900 000 000</span>
                </div>
                <div>
                    <strong>Email</strong>
                    <span>support@luxestore.test</span>
                </div>
                <div>
                    <strong>Địa chỉ</strong>
                    <span>12 Nguyễn Trãi, Quận 1, TP.HCM</span>
                </div>
                <div>
                    <strong>Thời gian phản hồi</strong>
                    <span>08:00 - 22:00 hằng ngày</span>
                </div>
            </div>
        </div>

        <div class="seller-chat-contact" id="seller-chat-box">
            <div class="seller-chat-card">
                <div class="seller-chat-head">
                    <div>
                        Chat trực tiếp với người bán
                        <small>Hỏi về size, tồn kho, đơn hàng hoặc khuyến mãi</small>
                    </div>
                    <span class="luxe-badge" style="background:#fff;color:#111">Live</span>
                </div>
                <div class="seller-chat-body">
                    @auth
                        @if(auth()->user()->isAdmin())
                            <div class="seller-chat-empty">Admin trả lời khách hàng trong mục Chat người bán của trang quản trị.</div>
                        @else
                            <div id="seller-chat-log" class="seller-chat-log"></div>
                            <form id="seller-chat-form" class="seller-chat-form" method="POST" action="{{ route('seller-chat.send') }}" data-messages-url="{{ route('seller-chat.messages') }}">
                                @csrf
                                <input id="seller-chat-message" class="luxe-input" placeholder="Nhập tin nhắn cho người bán...">
                                <button class="luxe-btn">Gửi</button>
                            </form>
                        @endif
                    @else
                        <div class="seller-chat-empty">
                            Bạn cần đăng nhập để chat trực tiếp với người bán.
                            <div class="mt-3">
                                <a class="luxe-btn" href="{{ route('login') }}">Đăng nhập</a>
                            </div>
                        </div>
                    @endauth
                </div>
            </div>
        </div>
    </div>
</section>
@endsection
