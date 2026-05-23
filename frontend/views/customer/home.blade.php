@extends('layouts.frontend')
@section('title', 'Luxe Store')
@section('content')
@php
    $heroSlides = ($heroProducts ?? collect())
        ->filter(fn ($product) => filled($product->image))
        ->values();
    $fallbackHero = 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=85';
@endphp

<section class="luxe-hero" data-hero-slideshow data-hero-interval="5000">
    <div class="luxe-hero-media">
        @forelse($heroSlides as $heroProduct)
            <img class="luxe-hero-slide {{ $loop->first ? 'is-active' : '' }}" src="{{ $heroProduct->image }}" alt="{{ $heroProduct->name }}" loading="{{ $loop->first ? 'eager' : 'lazy' }}">
        @empty
            <img class="luxe-hero-slide is-active" src="{{ $fallbackHero }}" alt="Bộ sưu tập thời trang Luxe Store">
        @endforelse
    </div>
    <div class="luxe-container luxe-hero-inner">
        <div>
            <p class="luxe-eyebrow">Luxe Store Collection</p>
            <h1>Thời trang tối giản, mặc đẹp mỗi ngày</h1>
            <p>Khám phá những thiết kế dễ phối, chất liệu thoải mái và form dáng tinh gọn cho nhịp sống hiện đại.</p>
            <div class="luxe-hero-actions">
                <a class="luxe-btn" href="{{ route('products.index') }}">Mua sắm ngay</a>
                <a class="luxe-btn luxe-btn-outline" href="{{ route('products.index', ['category' => 'ao-nu']) }}">Bộ sưu tập mới</a>
            </div>
        </div>
    </div>
</section>

<section class="luxe-stats">
    <div class="luxe-container luxe-stats-grid">
        <div><div class="luxe-stat-number">15.000+</div><div class="luxe-stat-label">Khách hàng tin chọn</div></div>
        <div><div class="luxe-stat-number">4.9/5</div><div class="luxe-stat-label">Đánh giá trung bình</div></div>
        <div><div class="luxe-stat-number">98%</div><div class="luxe-stat-label">Hài lòng sau mua</div></div>
    </div>
</section>

@if($flashSale)
    <section class="luxe-section">
        <div class="luxe-container">
            <div class="luxe-section-head">
                <div>
                    <p class="luxe-eyebrow text-dark mb-2">Flash Sale</p>
                    <h2 class="luxe-section-title">{{ $flashSale->name }}</h2>
                    <p class="luxe-section-desc">Giảm {{ $flashSale->discount_percent }}% cho các sản phẩm được chọn.</p>
                </div>
                <span class="luxe-badge luxe-badge-dark">Đang diễn ra</span>
            </div>
            <div class="luxe-grid">
                @foreach($flashSale->products->take(4) as $product)
                    @include('customer.products.partials.card', ['product' => $product])
                @endforeach
            </div>
        </div>
    </section>
@endif

<section class="luxe-section luxe-section-soft">
    <div class="luxe-container">
        <div class="luxe-section-head">
            <div>
                <p class="luxe-eyebrow text-dark mb-2">Gợi ý hôm nay</p>
                <h2 class="luxe-section-title">Sản phẩm nổi bật</h2>
                <p class="luxe-section-desc">Chọn nhanh món bạn thích rồi thêm vào giỏ hoặc mua ngay.</p>
            </div>
            <a class="luxe-btn luxe-btn-outline" href="{{ route('products.index') }}">Xem tất cả</a>
        </div>
        <div class="luxe-grid">
            @foreach($latestProducts as $product)
                @include('customer.products.partials.card', ['product' => $product])
            @endforeach
        </div>
    </div>
</section>

<section class="luxe-section">
    <div class="luxe-container">
        <div class="luxe-section-head">
            <div>
                <p class="luxe-eyebrow text-dark mb-2">Danh mục</p>
                <h2 class="luxe-section-title">Mua theo nhu cầu</h2>
            </div>
        </div>
        <div class="luxe-grid">
            @foreach($categories as $category)
                <a class="admin-card text-decoration-none text-dark" href="{{ route('products.index', ['category' => $category->slug]) }}">
                    <h3 class="h5 fw-bold">{{ $category->name }}</h3>
                    <p class="text-muted mb-0">{{ $category->products_count }} sản phẩm</p>
                </a>
            @endforeach
        </div>
    </div>
</section>
@endsection

@push('scripts')
<script src="/assets/js/home-hero.js?v=2026052301"></script>
@endpush

