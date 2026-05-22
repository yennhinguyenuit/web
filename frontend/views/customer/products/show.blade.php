@extends('layouts.frontend')
@section('title', $product->name)
@section('content')
<section class="luxe-section">
    <div class="luxe-container">
        <div class="row g-5 align-items-start">
            <div class="col-lg-5">
                <div class="luxe-card-media rounded-3">
                    <img src="{{ $product->image ?: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80' }}" alt="{{ $product->name }}">
                </div>
            </div>
            <div class="col-lg-7">
                <p class="luxe-eyebrow text-dark mb-2">{{ $product->category->name }}</p>
                <h1 class="luxe-section-title">{{ $product->name }}</h1>
                <div class="mt-3 mb-4">
                    <span class="luxe-price fs-3">{{ number_format($product->price) }}đ</span>
                    @if($product->original_price)
                        <span class="luxe-old-price ms-2">{{ number_format($product->original_price) }}đ</span>
                    @endif
                </div>
                <p class="luxe-section-desc">{{ $product->description }}</p>
                <div class="product-info-grid mt-4">
                    <div><span>SKU</span><strong>{{ $product->sku ?: 'Đang cập nhật' }}</strong></div>
                    <div><span>Danh mục</span><strong>{{ $product->category->name }}</strong></div>
                    <div><span>Tồn kho</span><strong>{{ $product->stock }}</strong></div>
                    <div>
                        <span>Màu sắc</span>
                        <strong class="product-color-show">
                            <i class="product-color-dot" style="--product-color: {{ $product->color ?: '#800020' }}"></i>
                            {{ $product->color ?: 'Đỏ đô' }}
                        </strong>
                    </div>
                </div>

                <form method="POST" action="{{ route('cart.add') }}" class="mt-4">
                    @csrf
                    <input type="hidden" name="product_id" value="{{ $product->id }}">
                    <div class="product-color-block mb-4">
                        <div class="product-option-label">Màu sắc</div>
                        <div class="product-color-options">
                            @foreach($product->colorOptions() as $option)
                                <label class="product-color-option" title="{{ $option['name'] }}">
                                    <input type="radio" name="color" value="{{ $option['hex'] }}" @checked($loop->first)>
                                    <span class="product-color-choice" style="--product-color: {{ $option['hex'] }}">
                                        <i></i>
                                        <b>{{ $option['name'] }}</b>
                                    </span>
                                </label>
                            @endforeach
                        </div>
                    </div>
                    <div class="product-size-block">
                        <div class="product-option-label">Size</div>
                        <div class="product-size-list">
                            @foreach(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as $size)
                                <label>
                                    <input type="radio" name="size" value="{{ $size }}" @checked($loop->first)>
                                    <span>{{ $size }}</span>
                                </label>
                            @endforeach
                        </div>
                    </div>
                    <div class="d-flex flex-wrap gap-2 mt-4">
                        <input class="luxe-input" style="max-width:120px" type="number" name="quantity" value="1" min="1" max="{{ $product->stock }}">
                        <button class="luxe-btn luxe-btn-outline" @guest disabled @endguest>Thêm giỏ</button>
                        <button class="luxe-btn" name="buy_now" value="1" @guest disabled @endguest>Mua ngay</button>
                    </div>
                </form>
@guest
                    <div class="alert alert-warning mt-3">Vui lòng đăng nhập để mua hàng.</div>
                @endguest
            </div>
        </div>
    </div>
</section>

<section class="luxe-section luxe-section-soft">
    <div class="luxe-container">
        <div class="luxe-section-head">
            <div>
                <p class="luxe-eyebrow text-dark mb-2">Feedback</p>
                <h2 class="luxe-section-title">Đánh giá từ khách hàng</h2>
                <p class="luxe-section-desc">Feedback sau khi mua hàng sẽ được hiển thị tại đây để người mua sau tham khảo.</p>
            </div>
            <span class="luxe-badge luxe-badge-dark">{{ $product->reviews->count() }} đánh giá</span>
        </div>

        @forelse($product->reviews as $review)
            <div class="review-card">
                <div class="review-card-head">
                    <div>
                        <strong>{{ $review->user->name ?? 'Khách hàng' }}</strong>
                        <div class="small text-muted">{{ $review->created_at->format('d/m/Y H:i') }}</div>
                    </div>
                    <div class="review-stars">{{ str_repeat('★', (int) $review->rating) }}{{ str_repeat('☆', 5 - (int) $review->rating) }}</div>
                </div>
                <p class="mb-0">{{ $review->comment ?: 'Khách hàng đã đánh giá sản phẩm.' }}</p>
                @if($review->shop_reply)
                    <div class="shop-reply-box">
                        <strong>Phản hồi từ Luxe Store</strong>
                        <p class="mb-0">{{ $review->shop_reply }}</p>
                    </div>
                @endif
            </div>
        @empty
            <div class="admin-card text-center text-muted">Sản phẩm này chưa có feedback.</div>
        @endforelse
    </div>
</section>

@if($relatedProducts->isNotEmpty())
    <section class="luxe-section luxe-section-soft">
        <div class="luxe-container">
            <div class="luxe-section-head">
                <h2 class="luxe-section-title">Sản phẩm liên quan</h2>
            </div>
            <div class="luxe-grid">
                @foreach($relatedProducts as $related)
                    @include('customer.products.partials.card', ['product' => $related])
                @endforeach
            </div>
        </div>
    </section>
@endif
@endsection
