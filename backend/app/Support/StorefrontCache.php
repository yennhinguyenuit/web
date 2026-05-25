<?php

namespace App\Support;

use App\Models\Category;
use App\Models\FlashSale;
use App\Models\Product;
use App\Services\FlashSaleScheduleService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StorefrontCache
{
    public static function categories(): Collection
    {
        $rows = Cache::store('file')->remember('storefront.categories.v3', now()->addMinutes(15), function () {
            $categories = Category::query()
                ->select(['id', 'name', 'slug'])
                ->orderBy('name')
                ->get();

            $productCounts = Product::query()
                ->where('is_active', true)
                ->select('category_id', DB::raw('COUNT(*) as total'))
                ->groupBy('category_id')
                ->pluck('total', 'category_id');

            return $categories
                ->map(fn (Category $category) => [
                    ...$category->getAttributes(),
                    'products_count' => (int) ($productCounts->get($category->id, 0)),
                ])
                ->all();
        });

        return Category::hydrate($rows);
    }

    public static function latestProducts(): Collection
    {
        $rows = Cache::store('file')->remember('storefront.latest-products.v3', now()->addMinutes(10), fn () => Product::query()
            ->with('category:id,name,slug')
            ->where('is_active', true)
            ->latest()
            ->take(8)
            ->get()
            ->map(fn (Product $product) => self::productRow($product))
            ->all());

        return collect($rows)->map(fn (array $row) => self::productFromRow($row));
    }

    public static function heroProducts(): Collection
    {
        $rows = Cache::store('file')->remember('storefront.hero-products.v3', now()->addMinutes(10), fn () => Product::query()
            ->where('is_active', true)
            ->whereNotNull('image')
            ->where('image', '!=', '')
            ->latest()
            ->take(6)
            ->get(['name', 'image'])
            ->map->getAttributes()
            ->all());

        return Product::hydrate($rows);
    }

    public static function currentFlashSale(): ?FlashSale
    {
        $row = Cache::store('file')->remember('storefront.current-flash-sale.v3', now()->addMinutes(5), function () {
            $flashSale = app(FlashSaleScheduleService::class)->current();

            if (! $flashSale) {
                return null;
            }

            return [
                'attributes' => $flashSale->getAttributes(),
                'products' => $flashSale->products
                    ->map(fn (Product $product) => self::productRow($product))
                    ->all(),
            ];
        });

        if (! $row) {
            return null;
        }

        $flashSale = new FlashSale();
        $flashSale->setRawAttributes($row['attributes'], true);
        $flashSale->exists = true;
        $flashSale->setRelation('products', collect($row['products'])->map(fn (array $product) => self::productFromRow($product)));

        return $flashSale;
    }

    private static function productRow(Product $product): array
    {
        return [
            'attributes' => $product->getAttributes(),
            'category' => $product->relationLoaded('category') && $product->category
                ? $product->category->getAttributes()
                : null,
        ];
    }

    private static function productFromRow(array $row): Product
    {
        $product = new Product();
        $product->setRawAttributes($row['attributes'], true);
        $product->exists = true;

        if ($row['category'] ?? null) {
            $category = new Category();
            $category->setRawAttributes($row['category'], true);
            $category->exists = true;
            $product->setRelation('category', $category);
        }

        return $product;
    }
}
