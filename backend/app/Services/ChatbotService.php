<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class ChatbotService
{
    public function reply(string $message): string
    {
        return $this->respond($message)['reply'];
    }

    public function respond(string $message): array
    {
        $fit = $this->fitFromMessage($message);
        $productIntent = $this->hasProductIntent($message) || $fit !== null;
        $couponIntent = $this->hasCouponIntent($message) || $productIntent;

        $products = $productIntent
            ? $this->recommendedProducts($message, $fit)->map(fn (Product $product) => $this->formatProduct($product, $fit))->values()->all()
            : [];

        $coupons = $couponIntent
            ? $this->activeCoupons()->map(fn (Coupon $coupon) => $this->formatCoupon($coupon))->values()->all()
            : [];

        $reply = null;
        $provider = 'local';
        $aiError = null;

        if (config('services.gemini.enabled') && config('services.gemini.key')) {
            $gemini = $this->replyWithGemini($message, $products, $coupons, $fit);
            $reply = $gemini['reply'];
            $aiError = $gemini['error'];
            if ($reply !== null) {
                $provider = 'gemini';
            }
        }

        return [
            'reply' => $reply ?: $this->replyWithLocalRules($message, $products, $coupons, $fit),
            'products' => $products,
            'coupons' => $coupons,
            'provider' => $provider,
            'ai_error' => $aiError,
        ];
    }

    /**
     * @return array{reply:?string,error:?string}
     */
    private function replyWithGemini(string $message, array $products, array $coupons, ?array $fit): array
    {
        $key = config('services.gemini.key');
        $model = config('services.gemini.model', 'gemini-2.5-flash');
        $context = $this->buildStoreContext($products, $coupons, $fit);

        try {
            $response = Http::timeout(10)->withHeaders([
                'x-goog-api-key' => $key,
            ])->post(
                "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent",
                [
                    'system_instruction' => [
                        'parts' => [[
                            'text' => 'Bạn là trợ lý mua sắm của Luxe Store. Trả lời tự nhiên, ngắn gọn bằng tiếng Việt. Luôn ưu tiên dữ liệu sản phẩm, giá, size, coupon, checkout, thanh toán và trạng thái đơn hàng được cung cấp. Không tự bịa sản phẩm hoặc mã giảm giá ngoài dữ liệu.',
                        ]],
                    ],
                    'contents' => [[
                        'parts' => [[
                            'text' => "{$context}\n\nKhách hỏi: {$message}",
                        ]],
                    ]],
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'topP' => 0.9,
                        'maxOutputTokens' => 420,
                    ],
                ]
            );

            if (! $response->successful()) {
                $error = 'Gemini trả về HTTP '.$response->status();
                Log::warning('Gemini chatbot request failed.', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return ['reply' => null, 'error' => $error];
            }

            $reply = data_get($response->json(), 'candidates.0.content.parts.0.text');

            return [
                'reply' => is_string($reply) && trim($reply) !== '' ? trim($reply) : null,
                'error' => null,
            ];
        } catch (Throwable $exception) {
            Log::warning('Gemini chatbot request exception.', [
                'error' => $exception->getMessage(),
            ]);

            return ['reply' => null, 'error' => $exception->getMessage()];
        }
    }

    private function replyWithLocalRules(string $message, array $products, array $coupons, ?array $fit): string
    {
        $text = mb_strtolower($message);

        if (str_contains($text, 'đơn hàng') || str_contains($text, 'trạng thái')) {
            return 'Bạn vào mục Đơn hàng để xem trạng thái pending, confirmed, shipping, completed hoặc cancelled. Nếu cần hỏi người bán, mở trang Liên hệ để chat trực tiếp.';
        }

        if ($this->hasCouponIntent($message) && $coupons !== []) {
            return 'Các mã giảm giá đang dùng được nằm bên dưới. Khi checkout, bạn nhập đúng mã và hệ thống sẽ tự kiểm tra điều kiện đơn tối thiểu, thời hạn và lượt dùng.';
        }

        if (str_contains($text, 'thanh toán') || str_contains($text, 'online') || str_contains($text, 'payos')) {
            return 'Website hỗ trợ COD, chuyển khoản ngân hàng, PayOS và thanh toán online. Với thanh toán online, hệ thống tạo giao dịch thanh toán và cập nhật trạng thái sau khi xác nhận.';
        }

        if ($products !== []) {
            $sizeText = $fit ? ' Size gợi ý hiện tại là '.$fit['size'].', bạn vẫn nên đối chiếu form dáng và số đo cá nhân trước khi đặt.' : '';

            return 'Mình gợi ý vài sản phẩm đang hiển thị trong shop bên dưới, có kèm hình ảnh, giá và link xem chi tiết.'.$sizeText;
        }

        if ($this->hasCouponIntent($message)) {
            return 'Hiện chưa tìm thấy mã giảm giá còn hiệu lực. Bạn có thể kiểm tra lại ở trang checkout hoặc hỏi shop để được hỗ trợ thêm.';
        }

        return 'Mình có thể gợi ý sản phẩm theo nhu cầu, size, cân nặng, ngân sách, mã giảm giá, checkout, thanh toán online và trạng thái đơn hàng.';
    }

    private function recommendedProducts(string $message, ?array $fit): Collection
    {
        $keywords = $this->productKeywords($message);
        $query = Product::with('category')
            ->where('is_active', true)
            ->where('stock', '>', 0);

        if ($keywords !== []) {
            $query->where(function ($query) use ($keywords) {
                foreach ($keywords as $keyword) {
                    $like = '%'.mb_strtolower($keyword).'%';
                    $query->orWhereRaw('LOWER(name) LIKE ?', [$like])
                        ->orWhereRaw('LOWER(description) LIKE ?', [$like])
                        ->orWhereHas('category', fn ($category) => $category->whereRaw('LOWER(name) LIKE ?', [$like]));
                }
            });
        }

        $products = $query->orderByDesc('sold')->latest()->take(4)->get();

        if ($products->isNotEmpty()) {
            return $products;
        }

        $topProductIds = OrderItem::selectRaw('product_id, SUM(quantity) as sold_quantity')
            ->groupBy('product_id')
            ->orderByDesc('sold_quantity')
            ->limit(4)
            ->pluck('product_id')
            ->filter()
            ->values();

        if ($topProductIds->isNotEmpty()) {
            $order = array_flip($topProductIds->all());

            return Product::with('category')
                ->where('is_active', true)
                ->where('stock', '>', 0)
                ->whereIn('id', $topProductIds)
                ->get()
                ->sortBy(fn (Product $product) => $order[$product->id] ?? 999)
                ->values();
        }

        return Product::with('category')
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->latest()
            ->take(4)
            ->get();
    }

    private function activeCoupons(): Collection
    {
        $now = now();

        return Coupon::where('is_active', true)
            ->where(function ($query) use ($now) {
                $query->whereNull('start_at')->orWhere('start_at', '<=', $now);
            })
            ->where(function ($query) use ($now) {
                $query->whereNull('end_at')->orWhere('end_at', '>=', $now);
            })
            ->where(function ($query) {
                $query->whereNull('usage_limit')->orWhereColumn('used_count', '<', 'usage_limit');
            })
            ->orderByDesc('discount_value')
            ->take(3)
            ->get();
    }

    private function productKeywords(string $message): array
    {
        $text = mb_strtolower($message);
        $keywords = [];

        $groups = [
            ['terms' => ['áo', 'polo', 'sơ mi', 'blazer', 'khoác', 'cardigan'], 'keywords' => ['áo', 'polo', 'sơ mi', 'blazer', 'khoác', 'cardigan']],
            ['terms' => ['quần', 'jean', 'kaki', 'culottes'], 'keywords' => ['quần', 'jean', 'kaki', 'culottes']],
            ['terms' => ['váy', 'đầm', 'chân váy'], 'keywords' => ['váy', 'đầm', 'chân váy']],
            ['terms' => ['giày', 'sneaker', 'loafer', 'sandal', 'boot'], 'keywords' => ['giày', 'sneaker', 'loafer', 'sandal', 'boot']],
            ['terms' => ['túi', 'mũ', 'khăn', 'thắt lưng', 'phụ kiện'], 'keywords' => ['túi', 'mũ', 'khăn', 'thắt lưng', 'phụ kiện']],
            ['terms' => ['nam'], 'keywords' => ['nam']],
            ['terms' => ['nữ'], 'keywords' => ['nữ']],
        ];

        foreach ($groups as $group) {
            foreach ($group['terms'] as $term) {
                if (str_contains($text, $term)) {
                    $keywords = array_merge($keywords, $group['keywords']);
                    break;
                }
            }
        }

        return array_values(array_unique($keywords));
    }

    private function hasProductIntent(string $message): bool
    {
        $text = mb_strtolower($message);

        foreach (['sản phẩm', 'gợi ý', 'mua', 'chọn', 'size', 'cỡ', 'cân', 'kg', 'áo', 'quần', 'váy', 'đầm', 'giày', 'túi', 'phụ kiện'] as $keyword) {
            if (str_contains($text, $keyword)) {
                return true;
            }
        }

        return false;
    }

    private function hasCouponIntent(string $message): bool
    {
        $text = mb_strtolower($message);

        foreach (['giảm giá', 'coupon', 'voucher', 'mã', 'khuyến mãi', 'freeship', 'sale'] as $keyword) {
            if (str_contains($text, $keyword)) {
                return true;
            }
        }

        return false;
    }

    private function fitFromMessage(string $message): ?array
    {
        $weight = null;
        $height = null;

        if (preg_match('/(\d{2,3})\s*(kg|kí|ký|kilogram|cân)/iu', $message, $matches)) {
            $weight = (int) $matches[1];
        }

        if (preg_match('/(\d{2,3})\s*cm/iu', $message, $matches)) {
            $height = (int) $matches[1];
        }

        if ($weight === null && $height === null) {
            return null;
        }

        $size = match (true) {
            $weight !== null && $weight <= 45 => 'XS',
            $weight !== null && $weight <= 52 => 'S',
            $weight !== null && $weight <= 60 => 'M',
            $weight !== null && $weight <= 68 => 'L',
            $weight !== null && $weight <= 78 => 'XL',
            $weight !== null => 'XXL',
            $height !== null && $height < 155 => 'S',
            $height !== null && $height < 165 => 'M',
            $height !== null && $height < 175 => 'L',
            default => 'XL',
        };

        return [
            'height' => $height,
            'weight' => $weight,
            'size' => $size,
            'note' => 'Gợi ý theo thông tin khách cung cấp, cần đối chiếu thêm form dáng sản phẩm.',
        ];
    }

    private function formatProduct(Product $product, ?array $fit): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'category' => $product->category?->name ?: 'Sản phẩm',
            'price' => (float) $product->price,
            'price_label' => number_format((float) $product->price).'đ',
            'original_price_label' => $product->original_price ? number_format((float) $product->original_price).'đ' : null,
            'image' => $product->image ?: 'https://placehold.co/240x300?text=Luxe',
            'url' => '/products/'.$product->slug,
            'stock' => $product->stock,
            'size' => $fit['size'] ?? null,
            'size_note' => $fit ? 'Size gợi ý: '.$fit['size'].' theo cân nặng/chiều cao bạn gửi.' : 'Có đủ size XS đến XXL, xem chi tiết để chọn size.',
        ];
    }

    private function formatCoupon(Coupon $coupon): array
    {
        $isPercent = $coupon->discount_type === 'percent';
        $target = $this->couponTarget($coupon);

        return [
            'code' => $coupon->code,
            'name' => $coupon->name,
            'type' => $target,
            'type_label' => $target === 'shipping' ? 'Giảm phí ship' : 'Giảm tiền sản phẩm',
            'discount_label' => $isPercent
                ? '-'.rtrim(rtrim(number_format((float) $coupon->discount_value, 2), '0'), '.').'%'
                : '-'.number_format((float) $coupon->discount_value).'đ',
            'min_order_label' => 'Đơn tối thiểu '.number_format((float) $coupon->min_order_value).'đ',
            'max_discount_label' => $coupon->max_discount ? 'Giảm tối đa '.number_format((float) $coupon->max_discount).'đ' : null,
            'end_at_label' => $coupon->end_at ? 'HSD '.$coupon->end_at->format('d/m/Y') : 'Không giới hạn ngày hết hạn',
        ];
    }

    private function couponTarget(Coupon $coupon): string
    {
        $target = $coupon->discount_target ?? null;

        if (in_array($target, ['product', 'shipping'], true)) {
            return $target;
        }

        return str_contains(strtoupper($coupon->code), 'SHIP') ? 'shipping' : 'product';
    }

    private function buildStoreContext(array $products, array $coupons, ?array $fit): string
    {
        $productLines = collect($products)
            ->map(fn (array $product) => "- {$product['name']} | {$product['price_label']} | {$product['category']} | {$product['size_note']}")
            ->implode("\n");

        $couponLines = collect($coupons)
            ->map(fn (array $coupon) => "- {$coupon['code']} | {$coupon['type_label']} | {$coupon['discount_label']} | {$coupon['min_order_label']} | {$coupon['end_at_label']}")
            ->implode("\n");

        $fitLine = $fit
            ? "Khách cung cấp: chiều cao ".($fit['height'] ?: 'chưa rõ')."cm, cân nặng ".($fit['weight'] ?: 'chưa rõ')."kg, size gợi ý {$fit['size']}."
            : 'Khách chưa cung cấp đủ chiều cao/cân nặng.';

        return "Sản phẩm phù hợp:\n".($productLines ?: '- Chưa có sản phẩm phù hợp trong truy vấn.')."\n\nMã giảm giá còn hiệu lực:\n".($couponLines ?: '- Chưa có mã phù hợp.')."\n\n{$fitLine}";
    }
}
