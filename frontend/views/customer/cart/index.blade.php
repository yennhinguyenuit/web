@extends('layouts.frontend')
@section('title', 'Giỏ hàng')
@section('content')
<section class="cart-hero">
    <div class="luxe-container cart-hero-inner">
        <div>
            <p class="luxe-eyebrow text-dark mb-2">Giỏ hàng</p>
            <h1>Sẵn sàng thanh toán</h1>
            <p>{{ $cart->items->sum('quantity') }} sản phẩm trong giỏ</p>
        </div>
        <a class="luxe-btn luxe-btn-outline" href="{{ route('products.index') }}">Tiếp tục mua sắm</a>
    </div>
</section>

<section class="luxe-section luxe-section-soft">
    <div class="luxe-container">
        @if($cart->items->isEmpty())
            <div class="alert alert-info">Giỏ hàng đang trống.</div>
        @else
            @php($cartTotal = $cart->items->sum(fn($item) => $item->unit_price * $item->quantity))
            <div class="cart-layout">
                <div class="cart-items-list">
                    @foreach($cart->items as $item)
                        <div class="cart-item-card">
                            <img src="{{ $item->product->image ?: 'https://placehold.co/160x200?text=Luxe' }}" alt="{{ $item->product->name }}">
                            <div class="cart-item-info">
                                <h2>{{ $item->product->name }}</h2>
                                <p>Đơn giá: {{ number_format($item->unit_price) }}đ</p>
                                <div class="cart-item-options">
                                    @if($item->selected_size)
                                        <span>Size: <strong>{{ $item->selected_size }}</strong></span>
                                    @endif
                                    @if($item->selected_color)
                                        <span>Màu: <i class="product-color-dot" style="--product-color: {{ $item->selected_color }}"></i> <strong>{{ $item->selected_color_name ?: $item->selected_color }}</strong></span>
                                    @endif
                                </div>
                                <form method="POST" action="{{ route('cart.items.update', $item) }}" class="cart-quantity-form">
                                    @csrf
                                    @method('PATCH')
                                    <button type="button" class="cart-qty-btn" data-cart-delta="-1">-</button>
                                    <input type="number" name="quantity" value="{{ $item->quantity }}" min="1" max="{{ $item->product->stock }}">
                                    <button type="button" class="cart-qty-btn" data-cart-delta="1">+</button>
                                </form>
                            </div>
                            <div class="cart-item-side">
                                <strong>{{ number_format($item->unit_price * $item->quantity) }}đ</strong>
                                <form method="POST" action="{{ route('cart.items.destroy', $item) }}">
                                    @csrf
                                    @method('DELETE')
                                    <button class="cart-remove-btn">Xóa</button>
                                </form>
                            </div>
                        </div>
                    @endforeach
                </div>

                <aside class="cart-summary-card">
                    <h2>Tóm tắt đơn hàng</h2>
                    <div class="cart-summary-row"><span>Số lượng</span><strong>{{ $cart->items->sum('quantity') }}</strong></div>
                    <div class="cart-summary-row"><span>Tạm tính</span><strong>{{ number_format($cartTotal) }}đ</strong></div>
                    <hr>
                    <div class="cart-summary-total"><span>Thành tiền</span><strong>{{ number_format($cartTotal) }}đ</strong></div>
                    <a class="luxe-btn w-100" href="{{ route('checkout.index') }}">Thanh toán</a>
                    <form method="POST" action="{{ route('cart.clear') }}">
                        @csrf
                        @method('DELETE')
                        <button class="luxe-btn luxe-btn-outline w-100 mt-3">Xóa giỏ hàng</button>
                    </form>
                </aside>
            </div>
        @endif
    </div>
</section>
@endsection

@push('scripts')
<script src="/assets/js/cart.js?v=20260523"></script>
@endpush
