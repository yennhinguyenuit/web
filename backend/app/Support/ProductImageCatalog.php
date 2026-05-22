<?php

namespace App\Support;

class ProductImageCatalog
{
    public static function imageForSlug(string $slug, string $fallbackText): string
    {
        return self::images()[$slug] ?? 'https://placehold.co/900x1200?text='.urlencode($fallbackText);
    }

    public static function images(): array
    {
        return [
            'ao-thun-basic-trang' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
            'ao-polo-navy' => 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=900&q=80',
            'so-mi-oxford-xanh' => 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
            'ao-khoac-bomber-den' => 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80',
            'ao-kieu-co-vuong' => 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80',
            'dam-midi-hoa-nhi' => 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
            'ao-blazer-nu-be' => 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80',
            'cardigan-len-mong' => 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80',
            'quan-jean-slim-nam' => 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80',
            'quan-kaki-regular' => 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80',
            'chan-vay-chu-a' => 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80',
            'quan-culottes-nu' => 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80',
            'sneaker-trang-co-thap' => 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
            'giay-loafer-da-nau' => 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=80',
            'sandal-quai-ngang' => 'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=900&q=80',
            'boot-co-ngan-nu' => 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=900&q=80',
            'tui-tote-canvas' => 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
            'that-lung-da-den' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
            'mu-bucket-kaki' => 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80',
            'khan-lua-hoa-tiet' => 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80',
            'san-pham-test-1k' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
        ];
    }

    public static function testProduct(): array
    {
        return [
            'name' => 'Sản phẩm test 1K',
            'slug' => 'san-pham-test-1k',
            'category_slug' => 'phu-kien',
            'price' => 1000,
            'original_price' => 10000,
            'stock' => 999,
            'image' => self::imageForSlug('san-pham-test-1k', 'Sản phẩm test 1K'),
            'description' => 'Sản phẩm giá 1.000đ dùng để test nhanh luồng giỏ hàng, checkout và coupon.',
        ];
    }
}
