<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'product_coupon_id')) {
                $table->foreignId('product_coupon_id')->nullable()->constrained('coupons')->nullOnDelete();
            }

            if (! Schema::hasColumn('orders', 'product_coupon_code')) {
                $table->string('product_coupon_code')->nullable();
            }

            if (! Schema::hasColumn('orders', 'product_discount')) {
                $table->decimal('product_discount', 12, 2)->default(0);
            }

            if (! Schema::hasColumn('orders', 'shipping_coupon_id')) {
                $table->foreignId('shipping_coupon_id')->nullable()->constrained('coupons')->nullOnDelete();
            }

            if (! Schema::hasColumn('orders', 'shipping_coupon_code')) {
                $table->string('shipping_coupon_code')->nullable();
            }

            if (! Schema::hasColumn('orders', 'shipping_discount')) {
                $table->decimal('shipping_discount', 12, 2)->default(0);
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'product_coupon_id')) {
                $table->dropConstrainedForeignId('product_coupon_id');
            }

            if (Schema::hasColumn('orders', 'shipping_coupon_id')) {
                $table->dropConstrainedForeignId('shipping_coupon_id');
            }

            foreach (['product_coupon_code', 'product_discount', 'shipping_coupon_code', 'shipping_discount'] as $column) {
                if (Schema::hasColumn('orders', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
