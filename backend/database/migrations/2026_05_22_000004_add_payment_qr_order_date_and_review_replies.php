<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'ordered_at')) {
                $table->timestamp('ordered_at')->nullable()->after('payment_status');
            }
        });

        DB::table('orders')
            ->whereNull('ordered_at')
            ->update(['ordered_at' => DB::raw('created_at')]);

        Schema::table('payment_transactions', function (Blueprint $table) {
            if (! Schema::hasColumn('payment_transactions', 'qr_code')) {
                $table->text('qr_code')->nullable()->after('payment_url');
            }
        });

        Schema::table('reviews', function (Blueprint $table) {
            if (! Schema::hasColumn('reviews', 'shop_reply')) {
                $table->text('shop_reply')->nullable()->after('comment');
            }

            if (! Schema::hasColumn('reviews', 'replied_by')) {
                $table->foreignId('replied_by')->nullable()->after('shop_reply')->constrained('users')->nullOnDelete();
            }

            if (! Schema::hasColumn('reviews', 'replied_at')) {
                $table->timestamp('replied_at')->nullable()->after('replied_by');
            }

            if (! Schema::hasColumn('reviews', 'is_visible')) {
                $table->boolean('is_visible')->default(true)->after('replied_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (Schema::hasColumn('reviews', 'replied_by')) {
                $table->dropConstrainedForeignId('replied_by');
            }

            foreach (['is_visible', 'replied_at', 'shop_reply'] as $column) {
                if (Schema::hasColumn('reviews', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('payment_transactions', function (Blueprint $table) {
            if (Schema::hasColumn('payment_transactions', 'qr_code')) {
                $table->dropColumn('qr_code');
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'ordered_at')) {
                $table->dropColumn('ordered_at');
            }
        });
    }
};
