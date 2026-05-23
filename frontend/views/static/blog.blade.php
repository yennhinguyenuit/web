@extends('layouts.frontend')

@section('title', 'Blog thời trang Luxe')

@section('content')
<section class="fashion-blog-hero">
    <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=85" alt="Editorial thời trang mùa mới">
    <div class="luxe-container fashion-blog-hero-inner">
        <p class="luxe-eyebrow">Luxe Journal</p>
        <h1>Ghi chú thời trang mới nhất cho tủ đồ 2026</h1>
        <p>Cập nhật theo tinh thần runway và street style từ Vogue, ELLE, Harper's Bazaar, rồi chuyển hóa thành gợi ý dễ mặc cho khách hàng Luxe.</p>
    </div>
</section>

<section class="fashion-blog-section">
    <div class="luxe-container fashion-editorial-lead">
        <div>
            <p class="luxe-eyebrow text-dark">Bản tin tháng 5/2026</p>
            <h2>Xu hướng đang nghiêng về cá tính cá nhân, chất liệu nhẹ, dáng mềm và điểm nhấn có chủ đích.</h2>
        </div>
        <p>Các tạp chí lớn đều cho thấy mùa 2026 không chỉ nói về một màu hay một kiểu dáng duy nhất. Thời trang trở lại với cảm giác mặc thật: đồ thể thao phối cùng tailoring, váy drop-waist, chấm bi, khăn lụa, trang sức màu nổi và các lớp layer mỏng cho thời tiết chuyển mùa.</p>
    </div>

    <div class="luxe-container fashion-article-grid">
        <article class="fashion-article-card fashion-article-card-large">
            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85" alt="Sporty tailoring">
            <div>
                <span>Trend Report</span>
                <h3>Sporty tailoring: áo khoác kỹ thuật đi cùng sơ mi và chân váy</h3>
                <p>Vogue gọi tên tinh thần sporty được làm sang bằng chất liệu nylon, áo khoác nhẹ và quần kỹ thuật. Cách Luxe diễn giải: chọn một item thể thao gọn, sau đó cân bằng bằng sơ mi trắng, quần suông hoặc giày loafer.</p>
            </div>
        </article>

        <article class="fashion-article-card">
            <img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85" alt="Váy mùa hè">
            <div>
                <span>Dress Code</span>
                <h3>Drop-waist và váy midi mềm</h3>
                <p>Váy hạ eo, phom thả và chiều dài midi tạo cảm giác cổ điển nhưng không nặng nề. Đây là lựa chọn hợp cho ngày cần mặc nữ tính mà vẫn thoải mái.</p>
            </div>
        </article>

        <article class="fashion-article-card">
            <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=85" alt="Chấm bi thời trang">
            <div>
                <span>Print Focus</span>
                <h3>Chấm bi trở lại theo cách nhẹ hơn</h3>
                <p>ELLE ghi nhận polka dots đang trở lại cho mùa xuân hè 2026. Với tủ đồ hằng ngày, chỉ cần váy chấm bi nhỏ hoặc khăn buộc tóc là đủ tạo điểm nhấn.</p>
            </div>
        </article>

        <article class="fashion-article-card">
            <img src="https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=85" alt="Phụ kiện màu sắc">
            <div>
                <span>Accessories</span>
                <h3>Trang sức màu nổi và túi nhỏ</h3>
                <p>Trang sức color-block, túi nhỏ và phụ kiện có hình khối giúp set đồ basic trông có chủ đích hơn mà không cần thay toàn bộ tủ đồ.</p>
            </div>
        </article>
    </div>
</section>

<section class="fashion-trend-strip">
    <div class="luxe-container">
        <p class="luxe-eyebrow text-dark">Luxe Styling Notes</p>
        <div class="fashion-note-row">
            <span>Layer mỏng</span>
            <span>Khăn lụa</span>
            <span>Chấm bi</span>
            <span>Đỏ burgundy</span>
            <span>Loafer</span>
            <span>Váy midi</span>
            <span>Áo khoác nhẹ</span>
        </div>
    </div>
</section>

<section class="fashion-blog-section fashion-blog-sources">
    <div class="luxe-container">
        <h2>Nguồn cảm hứng biên tập</h2>
        <p>Nội dung được viết lại theo ngôn ngữ Luxe, tham khảo tinh thần xu hướng từ các bản tin thời trang 2026 của Vogue, ELLE và Harper's Bazaar.</p>
        <div>
            <a href="https://www.vogue.com/article/spring-2026-fashion-trends" target="_blank" rel="noopener">Vogue Spring 2026 Trends</a>
            <a href="https://www.elle.com/fashion/trend-reports/a69148787/spring-2026-fashion-trends/" target="_blank" rel="noopener">ELLE Spring 2026 Trends</a>
            <a href="https://www.elle.com/fashion/trend-reports/a71110647/polka-dot-print-trend-spring-2026/" target="_blank" rel="noopener">ELLE Polka Dots 2026</a>
            <a href="https://www.harpersbazaar.com/fashion/a67963156/spring-2026-runway-fashion-trends/" target="_blank" rel="noopener">Harper's Bazaar Spring 2026</a>
        </div>
    </div>
</section>
@endsection
