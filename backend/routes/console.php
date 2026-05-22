<?php

use App\Models\Category;
use App\Models\Product;
use App\Support\ProductImageCatalog;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('app:fix-mojibake {--dry-run : Chi xem truoc, khong cap nhat database}', function () {
    $tables = [
        'users' => ['name', 'address'],
        'categories' => ['name', 'description'],
        'products' => ['name', 'description'],
        'coupons' => ['name'],
        'orders' => ['customer_name', 'customer_address', 'coupon_code'],
        'order_items' => ['product_name'],
        'flash_sales' => ['name'],
        'payment_transactions' => ['note'],
        'chat_messages' => ['message'],
        'reviews' => ['comment'],
    ];

    $markers = [
        "\u{00C3}",
        "\u{00C2}",
        "\u{00C4}",
        "\u{00C5}",
        "\u{00C6}",
        "\u{00D0}",
        "\u{00E1}\u{00BA}",
        "\u{00E1}\u{00BB}",
        "\u{00F0}\u{0178}",
        "\u{00E2}\u{20AC}",
        "\u{FFFD}",
    ];
    $windows1252 = [
        '€' => "\x80",
        '‚' => "\x82",
        'ƒ' => "\x83",
        '„' => "\x84",
        '…' => "\x85",
        '†' => "\x86",
        '‡' => "\x87",
        'ˆ' => "\x88",
        '‰' => "\x89",
        'Š' => "\x8A",
        '‹' => "\x8B",
        'Œ' => "\x8C",
        'Ž' => "\x8E",
        '‘' => "\x91",
        '’' => "\x92",
        '“' => "\x93",
        '”' => "\x94",
        '•' => "\x95",
        '–' => "\x96",
        '—' => "\x97",
        '˜' => "\x98",
        '™' => "\x99",
        'š' => "\x9A",
        '›' => "\x9B",
        'œ' => "\x9C",
        'ž' => "\x9E",
        'Ÿ' => "\x9F",
    ];

    $score = static function (?string $value) use ($markers): int {
        if ($value === null || $value === '') {
            return 0;
        }

        $count = 0;
        foreach ($markers as $marker) {
            $count += substr_count($value, $marker);
        }

        return $count;
    };

    $repairOnce = static function (string $value) use ($windows1252): ?string {
        $bytes = '';
        foreach (mb_str_split($value) as $character) {
            $code = mb_ord($character, 'UTF-8');

            if ($code <= 255) {
                $bytes .= chr($code);
                continue;
            }

            $bytes .= $windows1252[$character] ?? $character;
        }

        return mb_check_encoding($bytes, 'UTF-8') ? $bytes : null;
    };

    $repair = static function (?string $value) use ($score, $repairOnce): ?string {
        if ($value === null || $value === '' || $score($value) === 0) {
            return $value;
        }

        $best = $value;
        $bestScore = $score($value);
        $current = $value;

        for ($i = 0; $i < 3; $i++) {
            $next = $repairOnce($current);
            if ($next === null) {
                break;
            }

            $nextScore = $score($next);
            if ($nextScore < $bestScore) {
                $best = $next;
                $bestScore = $nextScore;
            }

            if ($nextScore === 0 || $next === $current) {
                break;
            }

            $current = $next;
        }

        return $best;
    };

    $dryRun = (bool) $this->option('dry-run');
    $updatedRows = 0;
    $updatedFields = 0;

    foreach ($tables as $table => $columns) {
        if (! Schema::hasTable($table)) {
            continue;
        }

        $availableColumns = array_values(array_filter(
            $columns,
            static fn (string $column): bool => Schema::hasColumn($table, $column)
        ));

        if ($availableColumns === []) {
            continue;
        }

        DB::table($table)
            ->select(array_merge(['id'], $availableColumns))
            ->orderBy('id')
            ->chunkById(100, function ($rows) use ($table, $availableColumns, $repair, $score, $dryRun, &$updatedRows, &$updatedFields) {
                foreach ($rows as $row) {
                    $changes = [];

                    foreach ($availableColumns as $column) {
                        $original = $row->{$column};
                        $fixed = $repair($original);

                        if ($fixed !== $original && $score($fixed) < $score($original)) {
                            $changes[$column] = $fixed;
                        }
                    }

                    if ($changes === []) {
                        continue;
                    }

                    $updatedRows++;
                    $updatedFields += count($changes);

                    if ($dryRun) {
                        $firstColumn = array_key_first($changes);
                        $this->line("{$table}#{$row->id}.{$firstColumn}: {$row->{$firstColumn}} -> {$changes[$firstColumn]}");
                        continue;
                    }

                    DB::table($table)->where('id', $row->id)->update($changes);
                }
            });
    }

    $mode = $dryRun ? 'can sua' : 'da sua';
    $this->info("Hoan tat: {$mode} {$updatedFields} truong trong {$updatedRows} dong.");
})->purpose('Sua chu tieng Viet bi loi ma hoa trong database');

Artisan::command('app:refresh-product-images', function () {
    $updatedImages = 0;

    foreach (ProductImageCatalog::images() as $slug => $image) {
        $product = Product::withTrashed()->where('slug', $slug)->first();

        if (! $product) {
            continue;
        }

        $product->forceFill(['image' => $image])->save();
        DB::table('order_items')
            ->where('product_id', $product->id)
            ->update(['product_image' => $image]);

        $updatedImages++;
    }

    $test = ProductImageCatalog::testProduct();
    $category = Category::firstOrCreate(
        ['slug' => $test['category_slug']],
        [
            'name' => 'Phụ kiện',
            'description' => 'Danh mục phụ kiện cho cửa hàng thời trang.',
        ]
    );

    $product = Product::withTrashed()->updateOrCreate(
        ['slug' => $test['slug']],
        [
            'category_id' => $category->id,
            'name' => $test['name'],
            'sku' => 'FSH-TEST-1K',
            'description' => $test['description'],
            'price' => $test['price'],
            'original_price' => $test['original_price'],
            'stock' => $test['stock'],
            'image' => $test['image'],
            'is_active' => true,
        ]
    );

    if (method_exists($product, 'trashed') && $product->trashed()) {
        $product->restore();
    }

    $this->info("Da cap nhat anh cho {$updatedImages} san pham va tao/cap nhat san pham test 1K.");
})->purpose('Cap nhat anh san pham va san pham test 1K');
