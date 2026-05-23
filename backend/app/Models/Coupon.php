<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'name',
        'discount_target',
        'discount_type',
        'discount_value',
        'min_order_value',
        'max_discount',
        'usage_limit',
        'used_count',
        'start_at',
        'end_at',
        'is_active',
        'customer_tier',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'min_order_value' => 'decimal:2',
            'max_discount' => 'decimal:2',
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function target(): string
    {
        if (in_array($this->discount_target, ['product', 'shipping'], true)) {
            return $this->discount_target;
        }

        return str_contains(strtoupper($this->code), 'SHIP') ? 'shipping' : 'product';
    }

    public function targetLabel(): string
    {
        return $this->target() === 'shipping' ? 'Phí ship' : 'Tiền sản phẩm';
    }

    public function productOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'product_coupon_id');
    }

    public function shippingOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'shipping_coupon_id');
    }
}
