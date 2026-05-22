<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'cancel_status')) {
                $table->string('cancel_status')->nullable()->after('payment_status');
            }

            if (! Schema::hasColumn('orders', 'cancel_reason')) {
                $table->text('cancel_reason')->nullable()->after('cancel_status');
            }

            if (! Schema::hasColumn('orders', 'cancel_requested_at')) {
                $table->timestamp('cancel_requested_at')->nullable()->after('cancel_reason');
            }

            if (! Schema::hasColumn('orders', 'cancel_reviewed_at')) {
                $table->timestamp('cancel_reviewed_at')->nullable()->after('cancel_requested_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            foreach (['cancel_reviewed_at', 'cancel_requested_at', 'cancel_reason', 'cancel_status'] as $column) {
                if (Schema::hasColumn('orders', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
