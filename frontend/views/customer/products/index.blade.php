@extends('layouts.frontend')
@section('title', 'Cửa hàng')
@section('content')
<section style="background:#111;color:#fff">
    <div class="luxe-container py-5">
        <p class="luxe-eyebrow">Luxe Store</p>
        <h1 class="luxe-section-title text-white">Cửa hàng</h1>
        <p class="luxe-section-desc" style="color:#d4d4d8">Khám phá sản phẩm mới, lọc theo danh mục và khoảng giá để tìm đúng món bạn cần.</p>
    </div>
</section>

<section class="luxe-section luxe-section-soft">
    <div class="luxe-container">
        <form class="luxe-filter mb-4" method="GET">
            <div class="luxe-filter-grid">
                <input class="luxe-input" name="q" value="{{ request('q') }}" placeholder="Tìm theo tên sản phẩm">
                <select class="luxe-select" name="category">
                    <option value="">Tất cả danh mục</option>
                    @foreach($categories as $category)
                        <option value="{{ $category->slug }}" @selected(request('category') === $category->slug)>{{ $category->name }}</option>
                    @endforeach
                </select>
                @php
                    $selectedMin = (int) request('min_price', 0);
                    $selectedMax = (int) request('max_price', $priceRangeMax);
                @endphp
                <div class="price-range-filter">
                    <input type="hidden" name="min_price" id="min-price-value" value="{{ $selectedMin }}">
                    <input type="hidden" name="max_price" id="max-price-value" value="{{ $selectedMax }}">
                    <div class="price-range-head">
                        <span>Giá từ <strong id="min-price-label">{{ number_format($selectedMin) }}đ</strong></span>
                        <span>Giá đến <strong id="max-price-label">{{ number_format($selectedMax) }}đ</strong></span>
                    </div>
                    <div class="price-range-sliders">
                        <div class="price-range-track"></div>
                        <input id="min-price-range" type="range" min="0" max="{{ $priceRangeMax }}" step="10000" value="{{ $selectedMin }}">
                        <input id="max-price-range" type="range" min="0" max="{{ $priceRangeMax }}" step="10000" value="{{ $selectedMax }}">
                    </div>
                </div>
                <button class="luxe-btn">Tìm</button>
            </div>
        </form>

        @if($products->count())
            <div class="luxe-grid">
                @foreach($products as $product)
                    @include('customer.products.partials.card', ['product' => $product])
                @endforeach
            </div>
            <div class="mt-4">{{ $products->links() }}</div>
        @else
            <div class="admin-card text-center text-muted">Không tìm thấy sản phẩm phù hợp.</div>
        @endif
    </div>
</section>
@endsection

@push('scripts')
<script src="{{ asset('assets/js/products-filter.js') }}"></script>
@endpush

