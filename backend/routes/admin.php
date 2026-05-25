<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ChatController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FlashSaleController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ReviewController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::patch('/products/{product}/hide', [ProductController::class, 'hide'])->name('products.hide');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::get('/customers/create', [CustomerController::class, 'create'])->name('customers.create');
    Route::get('/customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    Route::get('/customers/{customer}/edit', [CustomerController::class, 'edit'])->name('customers.edit');
    Route::put('/customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
    Route::patch('/orders/{order}/cancel-request', [OrderController::class, 'reviewCancel'])->name('orders.cancel-request');

    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create');
    Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('/coupons', [CouponController::class, 'index'])->name('coupons.index');
    Route::post('/coupons', [CouponController::class, 'store'])->name('coupons.store');
    Route::get('/coupons/create', [CouponController::class, 'create'])->name('coupons.create');
    Route::get('/coupons/{coupon}/edit', [CouponController::class, 'edit'])->name('coupons.edit');
    Route::put('/coupons/{coupon}', [CouponController::class, 'update'])->name('coupons.update');
    Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy'])->name('coupons.destroy');

    Route::get('/flash-sales', [FlashSaleController::class, 'index'])->name('flash-sales.index');
    Route::post('/flash-sales', [FlashSaleController::class, 'store'])->name('flash-sales.store');
    Route::get('/flash-sales/create', [FlashSaleController::class, 'create'])->name('flash-sales.create');
    Route::get('/flash-sales/{flashSale}/edit', [FlashSaleController::class, 'edit'])->name('flash-sales.edit');
    Route::put('/flash-sales/{flashSale}', [FlashSaleController::class, 'update'])->name('flash-sales.update');
    Route::delete('/flash-sales/{flashSale}', [FlashSaleController::class, 'destroy'])->name('flash-sales.destroy');

    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/revenue', [ReportController::class, 'revenue'])->name('reports.revenue');
    Route::get('/reports/order-status', [ReportController::class, 'orderStatus'])->name('reports.order-status');
    Route::get('/reports/top-products', [ReportController::class, 'topProducts'])->name('reports.top-products');
    Route::get('/reports/traffic', [ReportController::class, 'traffic'])->name('reports.traffic');
    Route::get('/reports/product-clicks', [ReportController::class, 'productClicks'])->name('reports.product-clicks');

    Route::get('/chats', [ChatController::class, 'index'])->name('chats.index');
    Route::get('/chats/{customer}/messages', [ChatController::class, 'messages'])->name('chats.messages');
    Route::post('/chats/{customer}/reply', [ChatController::class, 'reply'])->name('chats.reply');

    Route::get('/feedback', [ReviewController::class, 'index'])->name('reviews.index');
    Route::patch('/feedback/{review}/reply', [ReviewController::class, 'reply'])->name('reviews.reply');
    Route::patch('/feedback/{review}/visibility', [ReviewController::class, 'toggleVisibility'])->name('reviews.visibility');
});
