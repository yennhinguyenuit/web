<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SellerChatController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/shop', [ProductController::class, 'index'])->name('shop');
Route::redirect('/men', '/products?category=ao-nam')->name('men');
Route::redirect('/women', '/products?category=ao-nu')->name('women');
Route::redirect('/accessories', '/products?category=phu-kien')->name('accessories');
Route::redirect('/shoes', '/products?category=giay-dep')->name('shoes');

Route::view('/about', 'static.page', [
    'title' => 'Giới thiệu',
    'heading' => 'Giới thiệu Luxe Store',
    'body' => 'Luxe Store là website thương mại điện tử thời trang, tập trung vào trải nghiệm mua sắm rõ ràng, sản phẩm dễ chọn và quy trình đặt hàng nhanh.',
])->name('about');
Route::view('/blog', 'static.page', [
    'title' => 'Blog',
    'heading' => 'Blog thời trang',
    'body' => 'Cập nhật xu hướng phối đồ, bộ sưu tập mới và các chương trình khuyến mãi nổi bật tại Luxe Store.',
])->name('blog');
Route::view('/contact', 'static.contact')->name('contact');
Route::view('/reviews', 'static.page', [
    'title' => 'Đánh giá',
    'heading' => 'Đánh giá khách hàng',
    'body' => 'Khách hàng có thể gửi đánh giá sản phẩm sau khi đơn hàng hoàn tất. Mỗi sản phẩm trong một đơn hàng chỉ được đánh giá một lần.',
])->name('reviews');
Route::view('/faq', 'static.page', [
    'title' => 'FAQ',
    'heading' => 'Câu hỏi thường gặp',
    'body' => 'Các thông tin thường gặp về đặt hàng, thanh toán, vận chuyển, đổi trả và mã giảm giá.',
])->name('faq');
Route::view('/size-guide', 'static.page', [
    'title' => 'Bảng size',
    'heading' => 'Bảng size',
    'body' => 'Khách hàng nên kiểm tra số đo cơ thể và thông tin từng sản phẩm trước khi đặt hàng.',
])->name('size-guide');
Route::view('/shipping-returns', 'static.page', [
    'title' => 'Vận chuyển & đổi trả',
    'heading' => 'Vận chuyển & đổi trả',
    'body' => 'Đơn hàng được xử lý theo trạng thái pending, confirmed, shipping và completed. Chính sách đổi trả áp dụng theo tình trạng sản phẩm.',
])->name('shipping-returns');
Route::view('/gift-cards', 'static.page', [
    'title' => 'Thẻ quà tặng',
    'heading' => 'Thẻ quà tặng',
    'body' => 'Có thể dùng coupon tại checkout để áp dụng khuyến mãi và ưu đãi trong hệ thống.',
])->name('gift-cards');

Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{slug}', [ProductController::class, 'show'])->name('products.show');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.store');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.store');
});
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
    Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');
    Route::patch('/cart/items/{item}', [CartController::class, 'update'])->name('cart.items.update');
    Route::delete('/cart/items/{item}', [CartController::class, 'destroy'])->name('cart.items.destroy');

    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout/apply-coupon', [CheckoutController::class, 'applyCoupon'])->name('checkout.apply-coupon');
    Route::post('/checkout/place-order', [CheckoutController::class, 'placeOrder'])->name('checkout.place-order');
    Route::post('/validate-coupon', [CouponController::class, 'validateCoupon'])->name('coupons.validate');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::post('/orders/{order}/reviews', [ReviewController::class, 'store'])->name('orders.reviews.store');

    Route::get('/payments/{order}/pay', [PaymentController::class, 'pay'])->name('payments.pay');
    Route::post('/payments/{order}/confirm', [PaymentController::class, 'confirm'])->name('payments.confirm');
    Route::get('/payment/result', [PaymentController::class, 'result'])->name('payments.result');

    Route::post('/chatbot/send', [ChatbotController::class, 'send'])->name('chatbot.send');
    Route::get('/seller-chat/messages', [SellerChatController::class, 'messages'])->name('seller-chat.messages');
    Route::post('/seller-chat/send', [SellerChatController::class, 'send'])->name('seller-chat.send');
});

require __DIR__.'/admin.php';
