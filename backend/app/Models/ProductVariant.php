<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'sku',
        'name',
        'color_name',
        'color_hex',
        'image',
        'stock',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'stock' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function displayName(): string
    {
        return $this->color_name ?: ($this->name ?: ($this->color_hex ?: 'Default'));
    }

    public function displayImage(): ?string
    {
        return $this->image ?: $this->product?->image;
    }
}
