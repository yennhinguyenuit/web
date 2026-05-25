@extends('layouts.frontend')
@section('title', 'Thanh toán')
@section('content')
<section class="luxe-section luxe-section-soft">
    <div class="luxe-container">
        <form method="POST" action="{{ route('checkout.place-order') }}" class="checkout-layout">
            @csrf

            <div class="checkout-main">
                <section class="checkout-step-card">
                    <div class="checkout-step-title">
                        <span>1</span>
                        <h2>Thông tin liên hệ</h2>
                    </div>
                    <div class="checkout-field-grid">
                        <input class="form-control" name="customer_name" value="{{ old('customer_name', auth()->user()->name) }}" placeholder="Họ tên" required>
                        <input class="form-control" value="{{ auth()->user()->email }}" placeholder="Email" disabled>
                        <input class="form-control" name="customer_phone" value="{{ old('customer_phone', auth()->user()->phone) }}" placeholder="Số điện thoại" required>
                    </div>
                </section>

                <section class="checkout-step-card">
                    <div class="checkout-step-title">
                        <span>2</span>
                        <h2>Địa chỉ giao hàng</h2>
                    </div>
                    <textarea class="form-control" name="customer_address" rows="3" placeholder="Địa chỉ nhận hàng" required>{{ old('customer_address', auth()->user()->address) }}</textarea>
                </section>

                <section class="checkout-step-card">
                    <div class="checkout-step-title">
                        <span>3</span>
                        <h2>Phương thức vận chuyển</h2>
                    </div>
                    <div class="checkout-shipping-list">
                        @foreach($shippingMethods as $key => $method)
                            <label class="checkout-option-card">
                                <input
                                    type="radio"
                                    name="shipping_method"
                                    value="{{ $key }}"
                                    data-fee="{{ $method['fee'] }}"
                                    @checked(old('shipping_method', $defaultShippingMethod) === $key)
                                >
                                <span>
                                    <strong>{{ $method['label'] }}</strong>
                                    <small>{{ $method['description'] }}</small>
                                </span>
                                <b>{{ $method['fee'] > 0 ? number_format($method['fee']).'đ' : 'Miễn phí' }}</b>
                            </label>
                        @endforeach
                    </div>
                </section>

                <section class="checkout-step-card">
                    <div class="checkout-step-title">
                        <span>4</span>
                        <h2>Phương thức thanh toán</h2>
                    </div>
                    <div class="checkout-shipping-list">
                        <label class="checkout-option-card">
                            <input type="radio" name="payment_method" value="payos" @checked(old('payment_method', 'payos') === 'payos')>
                            <span><strong>Thanh toán online qua PayOS</strong><small>Quét QR hoặc thanh toán trực tuyến trên trang PayOS.</small></span>
                        </label>
                        <label class="checkout-option-card">
                            <input type="radio" name="payment_method" value="cod" @checked(old('payment_method') === 'cod')>
                            <span><strong>Thanh toán khi nhận hàng</strong><small>Trả tiền trực tiếp khi nhận hàng.</small></span>
                        </label>
                    </div>
                </section>
            </div>

            <aside class="checkout-summary-card">
                <div class="checkout-summary-head">
                    <div>
                        <h2>Tóm tắt đơn hàng</h2>
                        <p>{{ $cart->items->sum('quantity') }} sản phẩm</p>
                    </div>
                    <a href="{{ route('cart.index') }}">Sửa</a>
                </div>

                <div class="checkout-summary-products">
                    @foreach($cart->items as $item)
                        <div class="checkout-summary-item">
                            <img src="{{ $item->product->image ?: 'https://via.placeholder.com/96x120?text=Luxe' }}" alt="{{ $item->product->name }}">
                            <div>
                                <strong>{{ $item->product->name }}</strong>
                                <span>SL: {{ $item->quantity }}</span>
                                @if($item->selected_size || $item->selected_color)
                                    <span>
                                        @if($item->selected_size) Size {{ $item->selected_size }} @endif
                                        @if($item->selected_color)
                                            <i class="product-color-dot" style="--product-color: {{ $item->selected_color }}"></i>
                                            {{ $item->selected_color_name ?: $item->selected_color }}
                                        @endif
                                    </span>
                                @endif
                            </div>
                            <b>{{ number_format($item->unit_price * $item->quantity) }}đ</b>
                        </div>
                    @endforeach
                </div>

                <input type="hidden" id="checkout-product-coupon-code" name="product_coupon_code" value="">
                <input type="hidden" id="checkout-shipping-coupon-code" name="shipping_coupon_code" value="">
                <div class="input-group mt-3">
                    <input id="coupon-code" class="form-control" placeholder="Nhập mã giảm giá">
                    <button id="apply-coupon-btn" type="button" class="btn btn-dark">Áp dụng</button>
                </div>

                <div class="checkout-coupon-suggestions">
                    @if($suggestedProductCoupons->isNotEmpty())
                        <div class="checkout-coupon-group">
                            <p>Mã giảm sản phẩm</p>
                            @foreach($suggestedProductCoupons as $coupon)
                                <button type="button" class="coupon-suggestion" data-code="{{ $coupon->code }}">
                                    <strong>{{ $coupon->code }}</strong>
                                    <small>{{ $coupon->name }}</small>
                                </button>
                            @endforeach
                        </div>
                    @endif

                    @if($suggestedShippingCoupons->isNotEmpty())
                        <div class="checkout-coupon-group">
                            <p>Mã giảm phí ship</p>
                            @foreach($suggestedShippingCoupons as $coupon)
                                <button type="button" class="coupon-suggestion" data-code="{{ $coupon->code }}">
                                    <strong>{{ $coupon->code }}</strong>
                                    <small>{{ $coupon->name }}</small>
                                </button>
                            @endforeach
                        </div>
                    @endif
                </div>

                <div id="coupon-applied-list" class="coupon-applied-list" hidden>
                    <span id="product-coupon-label" hidden></span>
                    <span id="shipping-coupon-label" hidden></span>
                </div>
                <div id="coupon-message" class="small mt-2"></div>

                <div class="checkout-summary-money">
                    <div><span>Tạm tính</span><strong id="checkout-subtotal" data-value="{{ $subtotal }}">{{ number_format($subtotal) }}đ</strong></div>
                    <div><span>Phí vận chuyển</span><strong id="checkout-shipping-fee" data-value="{{ $shippingMethods[$defaultShippingMethod]['fee'] }}">{{ number_format($shippingMethods[$defaultShippingMethod]['fee']) }}đ</strong></div>
                    <div><span>Giảm sản phẩm</span><strong id="checkout-product-discount">0đ</strong></div>
                    <div><span>Giảm phí ship</span><strong id="checkout-shipping-discount">0đ</strong></div>
                    <div><span>Tổng giảm</span><strong id="checkout-discount">0đ</strong></div>
                    <div class="checkout-grand-total"><span>Tổng cộng</span><strong id="checkout-total">{{ number_format($subtotal + $shippingMethods[$defaultShippingMethod]['fee']) }}đ</strong></div>
                </div>

                <button class="luxe-btn w-100 checkout-submit-btn">Tạo đơn và thanh toán</button>
            </aside>
        </form>
    </div>
</section>
@endsection

@push('scripts')
<script src="/assets/js/checkout.js?v=20260525"></script>
@endpush
