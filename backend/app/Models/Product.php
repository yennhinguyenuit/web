<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'description',
        'price',
        'original_price',
        'stock',
        'color',
        'sold',
        'image',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'original_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function colorOptions(): array
    {
        $baseColor = $this->color ?: '#800020';
        $baseName = $this->colorName($baseColor);

        $options = [
            ['name' => $baseName, 'hex' => $baseColor],
        ];

        $name = mb_strtolower($this->name.' '.($this->category->name ?? ''));

        if (str_contains($name, 'giày') || str_contains($name, 'sneaker') || str_contains($name, 'loafer') || str_contains($name, 'boot') || str_contains($name, 'sandal')) {
            $options = array_merge($options, [
                ['name' => 'Trắng', 'hex' => '#f8fafc'],
                ['name' => 'Đen', 'hex' => '#111827'],
                ['name' => 'Nâu', 'hex' => '#92400e'],
            ]);
        } elseif (str_contains($name, 'túi') || str_contains($name, 'mũ') || str_contains($name, 'khăn') || str_contains($name, 'phụ kiện')) {
            $options = array_merge($options, [
                ['name' => 'Đen', 'hex' => '#111827'],
                ['name' => 'Be', 'hex' => '#d6d3d1'],
                ['name' => 'Đỏ đô', 'hex' => '#800020'],
            ]);
        } else {
            $options = array_merge($options, [
                ['name' => 'Trắng', 'hex' => '#ffffff'],
                ['name' => 'Đen', 'hex' => '#111827'],
                ['name' => 'Be', 'hex' => '#d6d3d1'],
                ['name' => 'Đỏ đô', 'hex' => '#800020'],
            ]);
        }

        return collect($options)
            ->unique(fn ($option) => mb_strtolower($option['hex']))
            ->values()
            ->all();
    }

    public function colorName(?string $hex = null): string
    {
        $hex = mb_strtolower($hex ?: $this->color ?: '#800020');

        return [
            '#ffffff' => 'Trắng',
            '#f8fafc' => 'Trắng',
            '#111827' => 'Đen',
            '#1f2937' => 'Xám đen',
            '#93c5fd' => 'Xanh nhạt',
            '#2563eb' => 'Xanh denim',
            '#f5d0fe' => 'Hồng tím',
            '#f9a8d4' => 'Hồng',
            '#d6d3d1' => 'Be',
            '#e5e7eb' => 'Xám sáng',
            '#a16207' => 'Kaki',
            '#7c2d12' => 'Nâu đất',
            '#92400e' => 'Nâu',
            '#f3e8ff' => 'Tím nhạt',
            '#f5f5dc' => 'Kem',
            '#78716c' => 'Xám kaki',
            '#dc2626' => 'Đỏ',
            '#800020' => 'Đỏ đô',
        ][$hex] ?? mb_strtoupper($hex);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function flashSales(): BelongsToMany
    {
        return $this->belongsToMany(FlashSale::class, 'flash_sale_items')->withTimestamps();
    }
}
