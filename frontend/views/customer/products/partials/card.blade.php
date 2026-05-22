<article class="luxe-card">
    <a class="luxe-card-media" href="{{ route('products.show', $product->slug) }}">
        <img src="{{ $product->image ?: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80' }}" alt="{{ $product->name }}" loading="lazy">
        <span class="luxe-card-badge">{{ $product->category->name ?? 'Sản phẩm' }}</span>
    </a>
    <div class="luxe-card-body">
        <div>
            <a class="luxe-card-title" href="{{ route('products.show', $product->slug) }}">{{ $product->name }}</a>
            @if($product->color)
                <div class="product-color-line">
                    <span class="product-color-dot" style="--product-color: {{ $product->color }}"></span>
                    <small>Màu sắc</small>
                </div>
            @endif
            <div class="mt-2">
                <span class="luxe-price">{{ number_format($product->price) }}đ</span>
                @if($product->original_price)
                    <span class="luxe-old-price ms-1">{{ number_format($product->original_price) }}đ</span>
                @endif
            </div>
        </div>
        <div class="luxe-card-actions">
            <form method="POST" action="{{ route('cart.add') }}">
                @csrf
                <input type="hidden" name="product_id" value="{{ $product->id }}">
                <input type="hidden" name="quantity" value="1">
                <button class="luxe-btn luxe-btn-outline w-100" @guest disabled title="Đăng nhập để mua" @endguest>Thêm giỏ</button>
            </form>
            <form method="POST" action="{{ route('cart.add') }}">
                @csrf
                <input type="hidden" name="product_id" value="{{ $product->id }}">
                <input type="hidden" name="quantity" value="1">
                <button class="luxe-btn w-100" @guest disabled title="Đăng nhập để mua" @endguest name="buy_now" value="1">Mua ngay</button>
            </form>
        </div>
    </div>
</article>

