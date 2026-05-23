@extends('layouts.frontend')

@section('title', $title)

@section('content')
@php
    $routeName = request()->route()?->getName();
    $pages = [
        'reviews' => [
            'image' => 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=85',
            'label' => 'Customer voices',
            'cards' => [
                ['Mua hàng', 'Hoàn tất đơn và trải nghiệm sản phẩm trong điều kiện thực tế.'],
                ['Gửi đánh giá', 'Sau khi đơn hoàn thành, khách có thể đánh giá từng sản phẩm đã mua.'],
                ['Shop phản hồi', 'Luxe ghi nhận feedback để cải thiện form dáng, chất liệu và dịch vụ.'],
            ],
        ],
        'faq' => [
            'image' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=85',
            'label' => 'Need to know',
            'cards' => [
                ['Đặt hàng thế nào?', 'Chọn sản phẩm, size, màu, thêm vào giỏ và hoàn tất checkout.'],
                ['Có thanh toán online không?', 'Luxe hỗ trợ COD và PayOS nếu hệ thống thanh toán đã được cấu hình.'],
                ['Dùng mã giảm giá ở đâu?', 'Nhập mã tại checkout; hệ thống tự kiểm tra điều kiện áp dụng.'],
                ['Cần hỏi shop?', 'Vào Liên hệ để chat trực tiếp với người bán.'],
            ],
        ],
        'size-guide' => [
            'image' => 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=1800&q=85',
            'label' => 'Fit guide',
            'cards' => [
                ['XS - S', 'Dáng nhỏ, ưu tiên phom gọn và chất liệu ít co kéo.'],
                ['M - L', 'Nhóm size phổ biến, dễ phối với áo khoác nhẹ hoặc quần suông.'],
                ['XL - XXL', 'Ưu tiên phom thoải mái, kiểm tra số đo vai, ngực và eo trước khi đặt.'],
                ['Cần tư vấn', 'Gửi chiều cao, cân nặng qua chatbot hoặc chat người bán để được gợi ý.'],
            ],
        ],
        'shipping-returns' => [
            'image' => 'https://images.unsplash.com/photo-1531131141161-ecdfb1858dd2?auto=format&fit=crop&w=1800&q=85',
            'label' => 'Order care',
            'cards' => [
                ['Pending', 'Luxe tiếp nhận đơn và kiểm tra tồn kho.'],
                ['Confirmed', 'Shop xác nhận, chuẩn bị đóng gói và bàn giao vận chuyển.'],
                ['Shipping', 'Đơn đang trên đường đến địa chỉ nhận hàng.'],
                ['Returns', 'Yêu cầu đổi trả được xem xét theo tình trạng sản phẩm và thời điểm nhận hàng.'],
            ],
        ],
        'gift-cards' => [
            'image' => 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1800&q=85',
            'label' => 'Luxe offers',
            'cards' => [
                ['Coupon sản phẩm', 'Giảm trực tiếp trên tổng tiền sản phẩm nếu đạt điều kiện tối thiểu.'],
                ['Freeship', 'Mã vận chuyển giúp giảm phí giao hàng tại checkout.'],
                ['Flash sale', 'Ưu đãi tự động theo các ngày 1.1, 2.2, 12.12 và Black Friday.'],
                ['Hạng khách hàng', 'Một số mã có thể áp dụng theo hạng Bronze, Silver, Gold hoặc VIP.'],
            ],
        ],
    ];
    $page = $pages[$routeName] ?? [
        'image' => 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=85',
        'label' => $title,
        'cards' => [],
    ];
@endphp

<section class="support-hero">
    <img src="{{ $page['image'] }}" alt="{{ $heading }}">
    <div class="luxe-container support-hero-inner">
        <p class="luxe-eyebrow">{{ $page['label'] }}</p>
        <h1>{{ $heading }}</h1>
        <p>{{ $body }}</p>
    </div>
</section>

<section class="support-section">
    <div class="luxe-container support-grid">
        @foreach($page['cards'] as [$cardTitle, $cardBody])
            <article>
                <span>{{ str_pad((string) $loop->iteration, 2, '0', STR_PAD_LEFT) }}</span>
                <h2>{{ $cardTitle }}</h2>
                <p>{{ $cardBody }}</p>
            </article>
        @endforeach
    </div>
</section>

<section class="support-action-band">
    <div class="luxe-container">
        <div>
            <p class="luxe-eyebrow text-dark">Luxe Support</p>
            <h2>Cần hỗ trợ nhanh hơn?</h2>
            <p>Chat với người bán để hỏi về size, tồn kho, thanh toán, vận chuyển hoặc mã giảm giá đang áp dụng.</p>
        </div>
        <a class="luxe-btn" href="{{ route('contact') }}">Chat với người bán</a>
    </div>
</section>
@endsection
