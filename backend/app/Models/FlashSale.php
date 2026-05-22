<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class FlashSale extends Model
{
    protected $fillable = ['name', 'discount_percent', 'start_at', 'end_at', 'is_active'];

    protected function casts(): array
    {
        return [
            'discount_percent' => 'decimal:2',
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'flash_sale_items')->withTimestamps();
    }
}
