<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            if (! Schema::hasColumn('cart_items', 'selected_size')) {
                $table->string('selected_size', 10)->nullable()->after('unit_price');
            }

            if (! Schema::hasColumn('cart_items', 'selected_color')) {
                $table->string('selected_color', 32)->nullable()->after('selected_size');
            }

            if (! Schema::hasColumn('cart_items', 'selected_color_name')) {
                $table->string('selected_color_name', 80)->nullable()->after('selected_color');
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            if (! Schema::hasColumn('order_items', 'selected_size')) {
                $table->string('selected_size', 10)->nullable()->after('product_image');
            }

            if (! Schema::hasColumn('order_items', 'selected_color')) {
                $table->string('selected_color', 32)->nullable()->after('selected_size');
            }

            if (! Schema::hasColumn('order_items', 'selected_color_name')) {
                $table->string('selected_color_name', 80)->nullable()->after('selected_color');
            }
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_cart_id_product_id_unique');
        }

        DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS cart_items_cart_product_size_color_unique ON cart_items (cart_id, product_id, selected_size, selected_color)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS cart_items_cart_product_size_color_unique');

        Schema::table('order_items', function (Blueprint $table) {
            foreach (['selected_color_name', 'selected_color', 'selected_size'] as $column) {
                if (Schema::hasColumn('order_items', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('cart_items', function (Blueprint $table) {
            foreach (['selected_color_name', 'selected_color', 'selected_size'] as $column) {
                if (Schema::hasColumn('cart_items', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
