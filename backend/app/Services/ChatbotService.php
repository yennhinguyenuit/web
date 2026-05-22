<?php

namespace App\Services;

use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\Http;
use Throwable;

class ChatbotService
{
    public function reply(string $message): string
    {
        if (config('services.gemini.enabled') && config('services.gemini.key')) {
            $geminiReply = $this->replyWithGemini($message);

            if ($geminiReply !== null) {
                return $geminiReply;
            }
        }

        return $this->replyWithLocalRules($message);
    }

    private function replyWithGemini(string $message): ?string
    {
        $key = config('services.gemini.key');
        $model = config('services.gemini.model', 'gemini-1.5-flash');
        $context = $this->buildStoreContext();

        try {
            $response = Http::timeout(10)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$key}",
                [
                    'contents' => [[
                        'parts' => [[
                            'text' => "Bạn là trợ lý mua sắm của Luxe Store, website bán hàng thời trang Laravel. Trả lời ngắn gọn bằng tiếng Việt, ưu tiên hướng dẫn về sản phẩm, coupon, checkout, thanh toán online và trạng thái đơn hàng. Không nhắc tên nhà cung cấp AI trong câu trả lời.\n\n{$context}\n\nKhách hỏi: {$message}",
                        ]],
                    ]],
                ]
            );

            if (! $response->successful()) {
                return null;
            }

            return data_get($response->json(), 'candidates.0.content.parts.0.text');
        } catch (Throwable) {
            return null;
        }
    }

    private function replyWithLocalRules(string $message): string
    {
        $text = mb_strtolower($message);

        if (str_contains($text, 'đơn hàng') || str_contains($text, 'trạng thái')) {
            return 'Bạn vào mục Đơn hàng để xem trạng thái pending, confirmed, shipping, completed hoặc cancelled. Nếu cần hỏi người bán, mở trang Liên hệ để chat trực tiếp.';
        }

        if (str_contains($text, 'giảm giá') || str_contains($text, 'coupon') || str_contains($text, 'mã')) {
            return 'Bạn nhập mã giảm giá ở trang checkout. Hệ thống sẽ kiểm tra mã còn active không, còn hạn không, đạt giá trị tối thiểu không và còn lượt sử dụng không.';
        }

        if (str_contains($text, 'thanh toán') || str_contains($text, 'online')) {
            return 'Website hỗ trợ COD, chuyển khoản ngân hàng, PayOS và thanh toán online. Với thanh toán online, hệ thống tạo giao dịch thanh toán và cập nhật trạng thái sau khi xác nhận.';
        }

        if (str_contains($text, 'bán chạy') || str_contains($text, 'gợi ý') || str_contains($text, 'sản phẩm') || str_contains($text, 'mua')) {
            $products = $this->recommendedProducts();

            return $products !== ''
                ? 'Gợi ý nhanh cho bạn: '.$products.'. Bạn có thể bấm vào Cửa hàng để lọc theo danh mục và khoảng giá.'
                : 'Hiện chưa có sản phẩm khả dụng. Bạn quay lại sau hoặc liên hệ người bán để được tư vấn.';
        }

        return 'Mình là trợ lý mua sắm của Luxe Store. Mình có thể gợi ý sản phẩm, hướng dẫn áp mã giảm giá, checkout, thanh toán online và kiểm tra trạng thái đơn hàng.';
    }

    private function buildStoreContext(): string
    {
        return 'Sản phẩm gợi ý: '.$this->recommendedProducts()
            .'. Coupon thường dùng: WELCOME10, FREESHIP50, SALE20, FLASH15. Trạng thái đơn hàng gồm pending, confirmed, shipping, completed, cancelled.';
    }

    private function recommendedProducts(): string
    {
        $topProductNames = OrderItem::selectRaw('product_name, SUM(quantity) as sold_quantity')
            ->groupBy('product_name')
            ->orderByDesc('sold_quantity')
            ->limit(3)
            ->pluck('product_name')
            ->filter()
            ->values();

        if ($topProductNames->isEmpty()) {
            $topProductNames = Product::where('is_active', true)
                ->latest()
                ->take(3)
                ->pluck('name');
        }

        return $topProductNames->implode(', ');
    }
}
