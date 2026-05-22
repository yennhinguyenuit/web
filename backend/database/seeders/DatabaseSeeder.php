<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\ChatMessage;
use App\Models\Coupon;
use App\Models\FlashSale;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentTransaction;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Support\ProductImageCatalog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Quản trị viên',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'phone' => '0900000000',
            'address' => 'Văn phòng quản trị',
            'role' => 'admin',
            'status' => 'active',
        ]);

        $customers = collect([
            ['Nguyen Minh Anh', 'minhanh@example.com', '0911000001', '12 Nguyen Trai, Quan 1, TP.HCM', 'bronze'],
            ['Tran Hoang Nam', 'hoangnam@example.com', '0911000002', '45 Le Loi, Quan 3, TP.HCM', 'gold'],
            ['Le Thu Ha', 'thuha@example.com', '0911000003', '88 Cau Giay, Ha Noi', 'vip'],
        ])->map(fn ($item) => User::create([
            'name' => $item[0],
            'email' => $item[1],
            'password' => Hash::make('password'),
            'phone' => $item[2],
            'address' => $item[3],
            'role' => 'customer',
            'status' => 'active',
            'customer_tier' => $item[4],
        ]));

        foreach ($customers as $customer) {
            ChatMessage::create([
                'user_id' => $customer->id,
                'sender' => 'customer',
                'message' => 'Shop còn tư vấn size và chương trình giảm giá hôm nay không?',
            ]);
            ChatMessage::create([
                'user_id' => $customer->id,
                'sender' => 'seller',
                'message' => 'Shop có hỗ trợ tư vấn size, đổi trả và mã WELCOME10 cho đơn đủ điều kiện.',
            ]);
        }

        $categories = collect([
            ['Áo nam', 'ao-nam'],
            ['Áo nữ', 'ao-nu'],
            ['Quần', 'quan'],
            ['Giày dép', 'giay-dep'],
            ['Phụ kiện', 'phu-kien'],
        ])->mapWithKeys(fn ($item) => [
            $item[1] => Category::create([
                'name' => $item[0],
                'slug' => $item[1],
                'description' => 'Danh mục '.$item[0].' cho cửa hàng thời trang.',
            ]),
        ]);

        $productRows = [
            ['Áo thun basic trắng', 'ao-thun-basic-trang', 'ao-nam', 199000, 249000],
            ['Áo polo navy', 'ao-polo-navy', 'ao-nam', 329000, 399000],
            ['Sơ mi Oxford xanh', 'so-mi-oxford-xanh', 'ao-nam', 459000, 529000],
            ['Áo khoác bomber đen', 'ao-khoac-bomber-den', 'ao-nam', 799000, 899000],
            ['Áo kiểu cổ vuông', 'ao-kieu-co-vuong', 'ao-nu', 289000, 349000],
            ['Đầm midi hoa nhí', 'dam-midi-hoa-nhi', 'ao-nu', 599000, 699000],
            ['Áo blazer nữ be', 'ao-blazer-nu-be', 'ao-nu', 899000, 990000],
            ['Cardigan len mỏng', 'cardigan-len-mong', 'ao-nu', 429000, 499000],
            ['Quần jean slim nam', 'quan-jean-slim-nam', 'quan', 549000, 649000],
            ['Quần kaki regular', 'quan-kaki-regular', 'quan', 489000, 559000],
            ['Chân váy chữ A', 'chan-vay-chu-a', 'quan', 359000, 429000],
            ['Quần culottes nữ', 'quan-culottes-nu', 'quan', 399000, 459000],
            ['Sneaker trắng cổ thấp', 'sneaker-trang-co-thap', 'giay-dep', 699000, 799000],
            ['Giày loafer da nâu', 'giay-loafer-da-nau', 'giay-dep', 890000, 990000],
            ['Sandal quai ngang', 'sandal-quai-ngang', 'giay-dep', 329000, 399000],
            ['Boot cổ ngắn nữ', 'boot-co-ngan-nu', 'giay-dep', 990000, 1190000],
            ['Túi tote canvas', 'tui-tote-canvas', 'phu-kien', 189000, 229000],
            ['Thắt lưng da đen', 'that-lung-da-den', 'phu-kien', 259000, 329000],
            ['Mũ bucket kaki', 'mu-bucket-kaki', 'phu-kien', 159000, 199000],
            ['Khăn lụa họa tiết', 'khan-lua-hoa-tiet', 'phu-kien', 219000, 269000],
            ['Sản phẩm test 1K', 'san-pham-test-1k', 'phu-kien', 1000, 10000],
        ];

        $productColors = ['#ffffff', '#1f2937', '#93c5fd', '#111827', '#f5d0fe', '#f9a8d4', '#d6d3d1', '#e5e7eb', '#2563eb', '#a16207', '#111827', '#7c2d12', '#f8fafc', '#92400e', '#f3e8ff', '#111827', '#f5f5dc', '#111827', '#78716c', '#dc2626', '#800020'];

        $products = collect($productRows)->map(function ($row, $index) use ($categories, $productColors) {
            return Product::create([
                'category_id' => $categories[$row[2]]->id,
                'name' => $row[0],
                'slug' => $row[1],
                'sku' => 'FSH-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                'description' => 'Sản phẩm '.$row[0].' chất liệu đẹp, dễ phối đồ, phù hợp phong cách hằng ngày.',
                'price' => $row[3],
                'original_price' => $row[4],
                'stock' => 30 + $index,
                'color' => $productColors[$index] ?? '#800020',
                'image' => ProductImageCatalog::imageForSlug($row[1], $row[0]),
                'is_active' => true,
            ]);
        });

        $coupons = collect([
            ['WELCOME10', 'Giảm 10% đơn đầu', 'percent', 10, 300000, 80000, 100],
            ['FREESHIP50', 'Hỗ trợ phí ship', 'fixed', 50000, 0, null, 80],
            ['SALE20', 'Giảm 20% thời trang', 'percent', 20, 500000, 150000, 50],
            ['VIP100K', 'Giam 100K cho VIP', 'fixed', 100000, 900000, null, 30, 'vip'],
            ['FLASH15', 'Flash coupon 15%', 'percent', 15, 400000, 120000, 60],
        ])->map(fn ($row) => Coupon::create([
            'code' => $row[0],
            'name' => $row[1],
            'discount_type' => $row[2],
            'discount_value' => $row[3],
            'min_order_value' => $row[4],
            'max_discount' => $row[5],
            'usage_limit' => $row[6],
            'used_count' => 0,
            'start_at' => now()->subDays(15),
            'end_at' => now()->addDays(45),
            'is_active' => true,
            'customer_tier' => $row[7] ?? null,
        ]));

        $flashSale = FlashSale::create([
            'name' => 'Flash Sale cuối tuần',
            'discount_percent' => 18,
            'start_at' => now()->subDay(),
            'end_at' => now()->addDays(5),
            'is_active' => true,
        ]);
        $flashSale->products()->attach($products->take(6)->pluck('id'));

        $statuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
        $paymentMethods = ['cod', 'payos'];

        for ($i = 1; $i <= 12; $i++) {
            $customer = $customers[($i - 1) % $customers->count()];
            $coupon = $i % 3 === 0 ? $coupons[$i % $coupons->count()] : null;
            $selectedProducts = $products->shuffle()->take(2 + ($i % 2));
            $subtotal = 0;

            foreach ($selectedProducts as $product) {
                $subtotal += (float) $product->price * (1 + ($i % 2));
            }

            $shippingKeys = array_keys(Order::shippingMethods());
            $shippingMethod = $shippingKeys[$i % count($shippingKeys)];
            $shippingFee = Order::shippingMethods()[$shippingMethod]['fee'];
            $discount = 0;
            $productDiscount = 0;
            $shippingDiscount = 0;

            if ($coupon) {
                $isShippingCoupon = str_contains($coupon->code, 'SHIP');
                $discountBase = $isShippingCoupon ? $shippingFee : $subtotal;
                $discount = $coupon->discount_type === 'percent'
                    ? $discountBase * ((float) $coupon->discount_value / 100)
                    : (float) $coupon->discount_value;
                if ($coupon->max_discount) {
                    $discount = min($discount, (float) $coupon->max_discount);
                }
                $discount = min($discount, $discountBase);
                $productDiscount = $isShippingCoupon ? 0 : $discount;
                $shippingDiscount = $isShippingCoupon ? $discount : 0;
                $coupon->increment('used_count');
            }

            $status = $statuses[$i % count($statuses)];
            $paymentMethod = $paymentMethods[$i % count($paymentMethods)];
            $paymentStatus = $status === 'completed' ? 'paid' : ($paymentMethod === 'cod' ? 'unpaid' : 'pending');

            $order = Order::create([
                'order_code' => 'ORD-'.now()->format('Ymd').'-'.str_pad((string) $i, 4, '0', STR_PAD_LEFT),
                'user_id' => $customer->id,
                'customer_name' => $customer->name,
                'customer_phone' => $customer->phone,
                'customer_address' => $customer->address,
                'shipping_method' => $shippingMethod,
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'discount' => $discount,
                'product_discount' => $productDiscount,
                'shipping_discount' => $shippingDiscount,
                'total' => max($subtotal + $shippingFee - $discount, 0),
                'coupon_id' => $coupon?->id,
                'coupon_code' => $coupon?->code,
                'product_coupon_id' => $productDiscount > 0 ? $coupon?->id : null,
                'product_coupon_code' => $productDiscount > 0 ? $coupon?->code : null,
                'shipping_coupon_id' => $shippingDiscount > 0 ? $coupon?->id : null,
                'shipping_coupon_code' => $shippingDiscount > 0 ? $coupon?->code : null,
                'status' => $status,
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
                'ordered_at' => now()->subMonths(11 - $i)->subDays($i),
                'created_at' => now()->subMonths(11 - $i)->subDays($i),
                'updated_at' => now()->subMonths(11 - $i)->subDays($i),
            ]);

            foreach ($selectedProducts as $product) {
                $quantity = 1 + ($i % 2);
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_image' => $product->image,
                    'unit_price' => $product->price,
                    'quantity' => $quantity,
                    'subtotal' => (float) $product->price * $quantity,
                ]);

                if ($status === 'completed') {
                    Review::create([
                        'user_id' => $customer->id,
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'rating' => 5,
                        'comment' => 'Sản phẩm đẹp, giao đúng mô tả và dễ phối đồ.',
                        'shop_reply' => 'Cảm ơn bạn đã tin chọn Luxe Store. Shop rất vui khi sản phẩm phù hợp với bạn.',
                        'replied_by' => 1,
                        'replied_at' => now()->subMonths(11 - $i)->subDays($i)->addDay(),
                        'is_visible' => true,
                    ]);
                }
            }

            if ($paymentMethod === 'payos') {
                PaymentTransaction::create([
                    'order_id' => $order->id,
                    'transaction_code' => 'PAY-SEED-'.Str::upper(Str::random(8)),
                    'provider' => $paymentMethod,
                    'amount' => $order->total,
                    'status' => $paymentStatus === 'paid' ? 'paid' : 'pending',
                    'payment_url' => '/payments/'.$order->id.'/pay',
                    'bank_reference' => null,
                    'note' => 'Giao dịch thanh toán mẫu.',
                    'paid_at' => $paymentStatus === 'paid' ? $order->created_at : null,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                ]);
            }
        }
    }
}
