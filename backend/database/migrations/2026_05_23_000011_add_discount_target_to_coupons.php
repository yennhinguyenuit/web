<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            if (! Schema::hasColumn('coupons', 'discount_target')) {
                $table->string('discount_target', 20)->default('product')->after('name');
            }
        });

        DB::table('coupons')
            ->whereRaw('UPPER(code) LIKE ?', ['%SHIP%'])
            ->update(['discount_target' => 'shipping']);
    }

    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            if (Schema::hasColumn('coupons', 'discount_target')) {
                $table->dropColumn('discount_target');
            }
        });
    }
};
