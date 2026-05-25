<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('product_variants')) {
            Schema::create('product_variants', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->string('sku')->nullable()->unique();
                $table->string('name')->nullable();
                $table->string('color_name', 80)->nullable();
                $table->string('color_hex', 32)->nullable();
                $table->string('image', 1000)->nullable();
                $table->integer('stock')->default(0);
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->unique(['product_id', 'color_hex']);
                $table->index(['product_id', 'is_active', 'sort_order']);
            });
        }

        Schema::table('cart_items', function (Blueprint $table) {
            if (! Schema::hasColumn('cart_items', 'product_variant_id')) {
                $table->foreignId('product_variant_id')->nullable()->after('product_id')->constrained('product_variants')->nullOnDelete();
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            if (! Schema::hasColumn('order_items', 'product_variant_id')) {
                $table->foreignId('product_variant_id')->nullable()->after('product_id')->constrained('product_variants')->nullOnDelete();
            }
        });

        DB::table('products')
            ->orderBy('id')
            ->get(['id', 'color', 'image', 'stock', 'created_at', 'updated_at'])
            ->each(function ($product): void {
                DB::table('product_variants')->updateOrInsert(
                    [
                        'product_id' => $product->id,
                        'color_hex' => $product->color ?: '#800020',
                    ],
                    [
                        'name' => 'Default',
                        'color_name' => 'Default',
                        'image' => $product->image,
                        'stock' => $product->stock ?? 0,
                        'sort_order' => 0,
                        'is_active' => true,
                        'created_at' => $product->created_at ?? now(),
                        'updated_at' => $product->updated_at ?? now(),
                    ]
                );
            });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            if (Schema::hasColumn('order_items', 'product_variant_id')) {
                $table->dropConstrainedForeignId('product_variant_id');
            }
        });

        Schema::table('cart_items', function (Blueprint $table) {
            if (Schema::hasColumn('cart_items', 'product_variant_id')) {
                $table->dropConstrainedForeignId('product_variant_id');
            }
        });

        Schema::dropIfExists('product_variants');
    }
};
