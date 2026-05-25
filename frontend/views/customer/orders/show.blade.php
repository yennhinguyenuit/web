@extends('layouts.frontend')
@section('title', $order->order_code)
@section('content')
<section class="luxe-section">
    <div class="luxe-container">
        @php
            $steps = [
                'pending' => ['Chờ xử lý', 'Đang thực hiện'],
                'confirmed' => ['Đã xác nhận', 'Chờ cập nhật'],
                'shipping' => ['Đang giao', 'Chờ cập nhật'],
                'completed' => ['Hoàn thành', 'Chờ cập nhật'],
            ];
            $currentStep = array_search($order->status, array_keys($steps), true);
            $currentStep = $currentStep === false ? -1 : $currentStep;
        @endphp

        <a class="small text-decoration-none text-muted" href="{{ route('orders.index') }}">← Quay lại danh sách đơn</a>
        <div class="d-flex justify-content-between align-items-start my-3">
            <div>
                <p class="luxe-eyebrow text-dark mb-2">Chi tiết đơn hàng</p>
                <h1 class="h3">{{ $order->order_code }}</h1>
                <div class="text-muted">Ngày đặt hàng: {{ $order->placedAtLabel() }}</div>
            </div>
            <div class="text-end">
                <span class="{{ $order->statusBadgeClass() }}">{{ $order->statusLabel() }}</span>
                <span class="{{ $order->paymentBadgeClass() }}">{{ $order->paymentStatusLabel() }}</span>
            </div>
        </div>

        <div class="order-detail-layout">
            <div class="order-detail-main">
                <div class="order-detail-card">
                    <h2>Tiến trình đơn hàng</h2>
                    <div class="order-progress">
                        @foreach($steps as $key => [$label, $sub])
                            @php($stepIndex = $loop->index)
                            <div class="order-progress-step {{ $stepIndex <= $currentStep ? 'active' : '' }}">
                                <span>{{ $stepIndex + 1 }}</span>
                                <strong>{{ $label }}</strong>
                                <small>{{ $stepIndex <= $currentStep ? 'Đã cập nhật' : $sub }}</small>
                            </div>
                        @endforeach
                    </div>
                </div>

                <div class="order-detail-card">
                    <div class="d-flex justify-content-between align-items-start gap-3">
                        <h2>Thanh toán {{ $order->payment_method === 'payos' ? 'PayOS' : strtoupper($order->payment_method) }}</h2>
                        <span class="{{ $order->paymentBadgeClass() }}">{{ $order->paymentStatusLabel() }}</span>
                    </div>
                    @if($order->payment_method !== 'cod' && $order->payment_status !== 'paid')
                        <p class="text-muted">Đơn hàng đang chờ hoàn tất thanh toán.</p>
                        <a class="btn btn-dark" href="{{ route('payments.pay', $order) }}">Tiếp tục thanh toán</a>
                    @else
                        <p class="text-muted mb-0">Thông tin thanh toán đã được ghi nhận.</p>
                    @endif
                </div>

                <div class="order-detail-card">
                    <h2>Sản phẩm</h2>
                    <div class="order-product-list">
                        @foreach($order->items as $item)
                            <div class="order-product-row">
                                <img src="{{ $item->displayImage() ?: 'https://placehold.co/120x150?text=Product' }}" alt="{{ $item->product_name }}">
                                <div>
                                    <strong>{{ $item->product_name }}</strong>
                                    <span>Số lượng: {{ $item->quantity }}</span>
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
                                <b>{{ number_format($item->subtotal) }}đ</b>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>

            <aside class="order-detail-side">
                <div class="order-detail-card">
                    <h2>Người nhận</h2>
                    <p class="mb-1">{{ $order->customer_name }} - {{ $order->customer_phone }}</p>
                    <p class="mb-0 text-muted">{{ $order->customer_address }}</p>
                </div>

                <div class="order-detail-card">
                    <h2>Vận chuyển</h2>
                    <p class="mb-1 fw-bold">{{ $order->shippingMethodLabel() }}</p>
                    <p class="mb-0 text-muted">Dự kiến: 2-5 ngày tùy khu vực.</p>
                </div>

                <div class="order-detail-card">
                    <h2>Tổng kết</h2>
                    <div class="checkout-summary-money mt-0">
                        <div><span>Tạm tính</span><strong>{{ number_format($order->subtotal) }}đ</strong></div>
                        <div><span>Phí vận chuyển</span><strong>{{ number_format($order->shipping_fee) }}đ</strong></div>
                        @if((float) $order->product_discount > 0)
                            <div><span>Giảm sản phẩm</span><strong>{{ number_format($order->product_discount) }}đ</strong></div>
                        @endif
                        @if((float) $order->shipping_discount > 0)
                            <div><span>Giảm phí ship</span><strong>{{ number_format($order->shipping_discount) }}đ</strong></div>
                        @endif
                        <div><span>Giảm giá</span><strong>{{ number_format($order->discount) }}đ</strong></div>
                        <div class="checkout-grand-total"><span>Thành tiền</span><strong>{{ number_format($order->total) }}đ</strong></div>
                    </div>
                    <a class="luxe-btn luxe-btn-outline w-100 mt-3" href="{{ route('contact') }}">Liên hệ Shop</a>
                </div>

                <div class="order-detail-card">
                    <h2>Hủy đơn hàng</h2>
                    @if($order->cancel_status)
                        <p class="mb-2"><span class="order-pill order-pill-confirmed">{{ $order->cancelStatusLabel() }}</span></p>
                        @if($order->cancel_reason)
                            <p class="text-muted mb-0">Lý do: {{ $order->cancel_reason }}</p>
                        @endif
                    @elseif($order->canCustomerCancelDirectly() || $order->canCustomerRequestCancel())
                        <form method="POST" action="{{ route('orders.cancel', $order) }}">
                            @csrf
                            <textarea class="form-control mb-3" name="cancel_reason" rows="3" placeholder="Lý do hủy đơn"></textarea>
                            <button class="btn btn-outline-danger w-100">
                                {{ $order->canCustomerCancelDirectly() ? 'Hủy đơn hàng' : 'Gửi yêu cầu hủy' }}
                            </button>
                            @if($order->canCustomerRequestCancel())
                                <p class="small text-muted mt-2 mb-0">Đơn đã được xác nhận nên cần shop duyệt. Nếu shop không duyệt, đơn vẫn tiếp tục giao.</p>
                            @endif
                        </form>
                    @else
                        <p class="text-muted mb-0">Đơn hàng hiện không thể hủy.</p>
                    @endif
                </div>
            </aside>
        </div>

        @if($order->status === 'completed')
            <div class="admin-card mt-4">
                <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                    <div>
                        <h2 class="h4 mb-1">Đánh giá sản phẩm</h2>
                        <p class="text-muted mb-0">Đơn hàng đã hoàn thành. Bạn có thể gửi một đánh giá cho từng sản phẩm đã mua.</p>
                    </div>
                    <span class="luxe-badge luxe-badge-dark">Review</span>
                </div>

                <div class="row g-3">
                    @foreach($order->items as $item)
                        @php($review = $order->reviews->firstWhere('product_id', $item->product_id))
                        <div class="col-lg-6">
                            <div class="border rounded-3 p-3 h-100 bg-white">
                                <div class="d-flex gap-3 mb-3">
                                    <img src="{{ $item->displayImage() ?: 'https://placehold.co/120x150?text=Product' }}" alt="{{ $item->product_name }}" width="72" height="90" class="rounded object-fit-cover">
                                    <div>
                                        <div class="fw-bold">{{ $item->product_name }}</div>
                                        @if($review)
                                            <div class="small text-success">Bạn đã đánh giá {{ $review->rating }}/5 sao.</div>
                                            @if($review->shop_reply)
                                                <div class="small text-muted mt-1">Shop đã phản hồi feedback của bạn.</div>
                                            @endif
                                        @else
                                            <div class="small text-muted">Chưa có đánh giá.</div>
                                        @endif
                                    </div>
                                </div>

                                <form method="POST" action="{{ route('orders.reviews.store', $order) }}">
                                    @csrf
                                    <input type="hidden" name="product_id" value="{{ $item->product_id }}">
                                    <div class="mb-2">
                                        <label class="form-label">Số sao</label>
                                        <select name="rating" class="luxe-select" required>
                                            @for($rating = 5; $rating >= 1; $rating--)
                                                <option value="{{ $rating }}" @selected((int) old('rating', $review->rating ?? 5) === $rating)>{{ $rating }} sao</option>
                                            @endfor
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Nhận xét</label>
                                        <textarea name="comment" class="luxe-textarea" placeholder="Chia sẻ cảm nhận về chất lượng, size, đóng gói...">{{ old('comment', $review->comment ?? '') }}</textarea>
                                    </div>
                                    <button class="luxe-btn">{{ $review ? 'Cập nhật đánh giá' : 'Gửi đánh giá' }}</button>
                                </form>
                                @if($review?->shop_reply)
                                    <div class="shop-reply-box mt-3">
                                        <strong>Phản hồi từ Luxe Store</strong>
                                        <p class="mb-0">{{ $review->shop_reply }}</p>
                                    </div>
                                @endif
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @else
            <div class="alert alert-info mt-4">
                Bạn sẽ có thể đánh giá sản phẩm sau khi đơn hàng chuyển sang trạng thái <strong>completed</strong>.
            </div>
        @endif
    </div>
</section>
@endsection
