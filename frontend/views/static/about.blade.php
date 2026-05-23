@extends('layouts.frontend')

@section('title', 'Giới thiệu Luxe Store')

@section('content')
<section class="fashion-story-hero">
    <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=85" alt="Không gian thời trang Luxe Store">
    <div class="luxe-container fashion-story-hero-inner">
        <p class="luxe-eyebrow">Luxe Store</p>
        <h1>Từ một căn phòng nhỏ đến tủ đồ được chọn lọc cho nhịp sống hiện đại</h1>
        <p>Luxe bắt đầu với một ý tưởng rất đơn giản: mua sắm thời trang online phải đẹp, dễ chọn và đủ tin cậy để khách hàng muốn quay lại.</p>
    </div>
</section>

<section class="fashion-story-section">
    <div class="luxe-container fashion-story-grid">
        <div class="fashion-story-copy">
            <p class="luxe-eyebrow text-dark">Câu chuyện khởi nghiệp</p>
            <h2>Một chiếc giá treo, vài mẫu đầu tiên và rất nhiều buổi tối đóng gói đơn hàng.</h2>
            <p>Luxe Store được khởi động bởi một nhóm bạn trẻ yêu thời trang ứng dụng. Những ngày đầu, mọi thứ chỉ xoay quanh một chiếc giá treo trong phòng làm việc, vài mẫu áo basic, một chiếc điện thoại để chụp ảnh sản phẩm và cuốn sổ ghi tay từng đơn hàng.</p>
            <p>Điều giữ Luxe đi tiếp không phải là những bộ ảnh hào nhoáng, mà là phản hồi rất thật từ khách hàng: cần form dễ mặc hơn, chất vải thoáng hơn, màu sắc dễ phối hơn và quy trình đặt hàng rõ ràng hơn. Từ đó, Luxe chọn đi theo hướng thời trang có tính ứng dụng cao, không chạy theo sự phô trương ngắn hạn.</p>
        </div>
        <div class="fashion-story-image">
            <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85" alt="Người mẫu trong trang phục tối giản">
        </div>
    </div>
</section>

<section class="fashion-values-band">
    <div class="luxe-container fashion-values-grid">
        <article>
            <span>01</span>
            <h3>Dễ mặc</h3>
            <p>Ưu tiên phom dáng gọn, màu dễ phối và chi tiết đủ nổi bật để mặc đi học, đi làm hoặc đi chơi.</p>
        </article>
        <article>
            <span>02</span>
            <h3>Dễ chọn</h3>
            <p>Ảnh sản phẩm, size, màu, giá và tồn kho được trình bày rõ để khách hàng quyết định nhanh hơn.</p>
        </article>
        <article>
            <span>03</span>
            <h3>Dễ mua</h3>
            <p>Giỏ hàng, coupon, PayOS, theo dõi đơn và chat người bán được gom vào một trải nghiệm liền mạch.</p>
        </article>
    </div>
</section>

<section class="fashion-story-section fashion-story-section-soft">
    <div class="luxe-container fashion-studio-layout">
        <img src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=85" alt="Editorial thời trang Luxe Store">
        <div>
            <p class="luxe-eyebrow text-dark">Tinh thần Luxe</p>
            <h2>Không cần quá nhiều đồ, chỉ cần những món khiến bạn thấy mình chỉn chu hơn.</h2>
            <p>Luxe xây dựng mỗi danh mục như một tủ đồ nhỏ: áo, quần, váy, giày và phụ kiện phải phối được với nhau. Một sản phẩm tốt không chỉ đẹp khi đứng riêng, mà còn phải giúp khách hàng mặc lại nhiều lần theo nhiều hoàn cảnh.</p>
            <a class="luxe-btn" href="{{ route('products.index') }}">Khám phá sản phẩm</a>
        </div>
    </div>
</section>
@endsection
