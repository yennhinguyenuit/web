<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_code',
        'user_id',
        'customer_name',
        'customer_phone',
        'customer_address',
        'shipping_method',
        'subtotal',
        'shipping_fee',
        'discount',
        'total',
        'coupon_id',
        'coupon_code',
        'product_coupon_id',
        'product_coupon_code',
        'product_discount',
        'shipping_coupon_id',
        'shipping_coupon_code',
        'shipping_discount',
        'status',
        'payment_method',
        'payment_status',
        'cancel_status',
        'cancel_reason',
        'cancel_requested_at',
        'cancel_reviewed_at',
        'ordered_at',
    ];

    public static function shippingMethods(): array
    {
        return [
            'standard' => [
                'label' => 'Giao hàng tiêu chuẩn',
                'description' => 'Giao trong 2-4 ngày làm việc',
                'fee' => 30000,
            ],
            'express' => [
                'label' => 'Giao nhanh',
                'description' => 'Ưu tiên xử lý và giao nhanh',
                'fee' => 50000,
            ],
            'same_day' => [
                'label' => 'Giao trong ngày',
                'description' => 'Áp dụng cho khu vực đủ điều kiện',
                'fee' => 80000,
            ],
        ];
    }

    public function shippingMethodLabel(): string
    {
        return self::shippingMethods()[$this->shipping_method]['label']
            ?? self::shippingMethods()['standard']['label'];
    }

    public function statusLabel(): string
    {
        return [
            'pending' => 'Chờ xử lý',
            'confirmed' => 'Đã xác nhận',
            'shipping' => 'Đang giao',
            'completed' => 'Hoàn thành',
            'cancelled' => 'Đã hủy',
        ][$this->status] ?? $this->status;
    }

    public function statusBadgeClass(): string
    {
        return 'order-pill order-pill-'.$this->status;
    }

    public function paymentStatusLabel(): string
    {
        return [
            'unpaid' => 'Chưa thanh toán',
            'pending' => 'Đang chờ',
            'paid' => 'Đã thanh toán',
            'failed' => 'Thất bại',
            'refunded' => 'Hoàn tiền',
        ][$this->payment_status] ?? $this->payment_status;
    }

    public function paymentBadgeClass(): string
    {
        return 'payment-pill payment-pill-'.$this->payment_status;
    }

    public function cancelStatusLabel(): ?string
    {
        return [
            'pending' => 'Chờ shop duyệt hủy',
            'approved' => 'Shop đã duyệt hủy',
            'rejected' => 'Shop từ chối hủy',
        ][$this->cancel_status] ?? null;
    }

    public function canCustomerCancelDirectly(): bool
    {
        return $this->status === 'pending';
    }

    public function canCustomerRequestCancel(): bool
    {
        return in_array($this->status, ['confirmed', 'shipping'], true)
            && $this->cancel_status !== 'pending';
    }

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'shipping_fee' => 'decimal:2',
            'discount' => 'decimal:2',
            'product_discount' => 'decimal:2',
            'shipping_discount' => 'decimal:2',
            'total' => 'decimal:2',
            'cancel_requested_at' => 'datetime',
            'cancel_reviewed_at' => 'datetime',
            'ordered_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function productCoupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class, 'product_coupon_id');
    }

    public function shippingCoupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class, 'shipping_coupon_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
