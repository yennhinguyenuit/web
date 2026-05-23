@php
    $target = old('discount_target', isset($coupon) ? $coupon->target() : 'product');
@endphp

<div class="col-md-4">
    <label class="form-label">Mã</label>
    <input class="form-control" name="code" value="{{ old('code', $coupon->code ?? '') }}" required>
</div>
<div class="col-md-8">
    <label class="form-label">Tên coupon</label>
    <input class="form-control" name="name" value="{{ old('name', $coupon->name ?? '') }}" required>
</div>
<div class="col-md-4">
    <label class="form-label">Áp dụng cho</label>
    <select class="form-select" name="discount_target" required>
        <option value="product" @selected($target === 'product')>Giảm tiền sản phẩm</option>
        <option value="shipping" @selected($target === 'shipping')>Giảm phí vận chuyển</option>
    </select>
    <div class="form-text">Không cần đặt mã có chữ SHIP nữa, chọn trực tiếp ở đây.</div>
</div>
<div class="col-md-4">
    <label class="form-label">Loại giảm</label>
    <select class="form-select" name="discount_type">
        <option value="percent" @selected(old('discount_type', $coupon->discount_type ?? '') === 'percent')>Phần trăm</option>
        <option value="fixed" @selected(old('discount_type', $coupon->discount_type ?? '') === 'fixed')>Số tiền cố định</option>
    </select>
</div>
<div class="col-md-4">
    <label class="form-label">Giá trị</label>
    <input class="form-control" type="number" name="discount_value" value="{{ old('discount_value', $coupon->discount_value ?? '') }}" min="1" step="1000" required>
</div>
<div class="col-md-4">
    <label class="form-label">Đơn tối thiểu</label>
    <input class="form-control" type="number" name="min_order_value" value="{{ old('min_order_value', $coupon->min_order_value ?? 0) }}" min="0" step="1000">
</div>
<div class="col-md-4">
    <label class="form-label">Giảm tối đa</label>
    <input class="form-control" type="number" name="max_discount" value="{{ old('max_discount', $coupon->max_discount ?? '') }}" min="0" step="1000">
</div>
<div class="col-md-4">
    <label class="form-label">Giới hạn lượt</label>
    <input class="form-control" type="number" name="usage_limit" value="{{ old('usage_limit', $coupon->usage_limit ?? '') }}" min="0">
</div>
<div class="col-md-3">
    <label class="form-label">Trạng thái</label>
    <select class="form-select" name="is_active">
        <option value="1" @selected(old('is_active', $coupon->is_active ?? true))>active</option>
        <option value="0" @selected(!old('is_active', $coupon->is_active ?? true))>off</option>
    </select>
</div>
<div class="col-md-3">
    <label class="form-label">Hạng áp dụng</label>
    <select class="form-select" name="customer_tier">
        <option value="">Tất cả</option>
        @foreach(['bronze','silver','gold','vip'] as $tier)
            <option value="{{ $tier }}" @selected(old('customer_tier', $coupon->customer_tier ?? '') === $tier)>{{ $tier }}</option>
        @endforeach
    </select>
</div>
<div class="col-md-3">
    <label class="form-label">Bắt đầu</label>
    <input class="form-control" type="datetime-local" name="start_at" value="{{ old('start_at', isset($coupon) && $coupon->start_at ? $coupon->start_at->format('Y-m-d\TH:i') : '') }}">
</div>
<div class="col-md-3">
    <label class="form-label">Kết thúc</label>
    <input class="form-control" type="datetime-local" name="end_at" value="{{ old('end_at', isset($coupon) && $coupon->end_at ? $coupon->end_at->format('Y-m-d\TH:i') : '') }}">
</div>
