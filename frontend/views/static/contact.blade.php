@extends('layouts.frontend')

@section('title', 'Liên hệ Luxe Store')

@section('content')
<section class="fashion-contact-hero">
    <img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1800&q=85" alt="Không gian tư vấn thời trang Luxe Store">
    <div class="luxe-container fashion-contact-hero-inner">
        <p class="luxe-eyebrow">Luxe Concierge</p>
        <h1>Cần chọn size, phối đồ hay hỏi đơn hàng? Luxe luôn ở đây.</h1>
        <p>Gửi tin nhắn trực tiếp cho người bán để được tư vấn nhanh về sản phẩm, tồn kho, mã giảm giá và trạng thái đơn hàng.</p>
    </div>
</section>

<section class="fashion-contact-section">
    <div class="luxe-container fashion-contact-grid">
        <div class="fashion-contact-info">
            <p class="luxe-eyebrow text-dark">Studio support</p>
            <h2>Tư vấn như một stylist riêng cho tủ đồ của bạn.</h2>
            <p>Luxe ưu tiên phản hồi rõ ràng, thực tế và dễ quyết định: size nào hợp dáng, màu nào dễ phối, sản phẩm nào còn hàng và đơn đang ở trạng thái nào.</p>

            <div class="fashion-contact-list">
                <div>
                    <span>Hotline</span>
                    <strong>0900 000 000</strong>
                </div>
                <div>
                    <span>Email</span>
                    <strong>support@luxestore.test</strong>
                </div>
                <div>
                    <span>Studio</span>
                    <strong>12 Nguyễn Trãi, Quận 1, TP.HCM</strong>
                </div>
                <div>
                    <span>Phản hồi</span>
                    <strong>08:00 - 22:00 hằng ngày</strong>
                </div>
            </div>

            <div class="fashion-contact-image">
                <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85" alt="Editorial styling Luxe Store">
            </div>
        </div>

        <div class="seller-chat-contact fashion-contact-chat" id="seller-chat-box">
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

<section class="fashion-contact-strip">
    <div class="luxe-container">
        <span>Size fit</span>
        <span>Order care</span>
        <span>Style advice</span>
        <span>Coupon help</span>
        <span>PayOS support</span>
    </div>
</section>
@endsection
