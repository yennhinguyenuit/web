<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->nullable()->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('original_price', 12, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->string('color', 32)->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 12, 2);
            $table->string('selected_size', 10)->nullable();
            $table->string('selected_color', 32)->nullable();
            $table->string('selected_color_name', 80)->nullable();
            $table->timestamps();
            $table->unique(['cart_id', 'product_id', 'selected_size', 'selected_color'], 'cart_items_cart_product_size_color_unique');
        });

        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('discount_type');
            $table->decimal('discount_value', 12, 2);
            $table->decimal('min_order_value', 12, 2)->default(0);
            $table->decimal('max_discount', 12, 2)->nullable();
            $table->integer('usage_limit')->nullable();
            $table->integer('used_count')->default(0);
            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('customer_tier')->nullable();
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->text('customer_address');
            $table->string('shipping_method')->default('standard');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('shipping_fee', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->foreignId('coupon_id')->nullable()->constrained()->nullOnDelete();
            $table->string('coupon_code')->nullable();
            $table->foreignId('product_coupon_id')->nullable()->constrained('coupons')->nullOnDelete();
            $table->string('product_coupon_code')->nullable();
            $table->decimal('product_discount', 12, 2)->default(0);
            $table->foreignId('shipping_coupon_id')->nullable()->constrained('coupons')->nullOnDelete();
            $table->string('shipping_coupon_code')->nullable();
            $table->decimal('shipping_discount', 12, 2)->default(0);
            $table->string('status')->default('pending');
            $table->string('payment_method')->default('cod');
            $table->string('payment_status')->default('unpaid');
            $table->string('cancel_status')->nullable();
            $table->text('cancel_reason')->nullable();
            $table->timestamp('cancel_requested_at')->nullable();
            $table->timestamp('cancel_reviewed_at')->nullable();
            $table->timestamp('ordered_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'payment_status']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->string('product_name');
            $table->string('product_image')->nullable();
            $table->string('selected_size', 10)->nullable();
            $table->string('selected_color', 32)->nullable();
            $table->string('selected_color_name', 80)->nullable();
            $table->decimal('unit_price', 12, 2);
            $table->integer('quantity');
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();
        });

        Schema::create('flash_sales', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('discount_percent', 5, 2);
            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['is_active', 'start_at', 'end_at']);
        });

        Schema::create('flash_sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flash_sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['flash_sale_id', 'product_id']);
        });

        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('transaction_code')->unique();
            $table->string('provider')->default('online_payment');
            $table->decimal('amount', 12, 2);
            $table->string('status')->default('pending');
            $table->string('payment_url')->nullable();
            $table->text('qr_code')->nullable();
            $table->string('bank_reference')->nullable();
            $table->text('note')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->index(['order_id', 'status']);
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('sender');
            $table->text('message');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('flash_sale_items');
        Schema::dropIfExists('flash_sales');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};
