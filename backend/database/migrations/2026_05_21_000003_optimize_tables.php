<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add soft deletes to products for audit trail
        Schema::table('products', function (Blueprint $table) {
            $table->softDeletes()->nullable()->after('is_active');
            $table->integer('sold')->default(0)->after('stock');
            $table->index(['category_id', 'is_active', 'deleted_at']);
        });

        // Optimize orders table
        Schema::table('orders', function (Blueprint $table) {
            $table->softDeletes()->nullable()->after('updated_at');
            $table->index(['created_at']);
        });

        // Add tracking to reviews
        if (!Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained()->cascadeOnDelete();
                $table->foreignId('product_id')->constrained()->restrictOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->integer('rating')->min(1)->max(5);
                $table->text('comment')->nullable();
                $table->softDeletes()->nullable();
                $table->timestamps();
                $table->index(['product_id', 'created_at']);
                $table->index(['user_id', 'created_at']);
            });
        }

        // Optimize users table
        Schema::table('users', function (Blueprint $table) {
            $table->index(['role', 'status']);
            $table->softDeletes()->nullable()->after('updated_at');
        });

        // Add audit logs table
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action'); // create, update, delete
            $table->string('model'); // Product, Order, etc
            $table->unsignedBigInteger('model_id');
            $table->text('changes')->nullable(); // JSON
            $table->string('ip_address')->nullable();
            $table->timestamps();
            $table->index(['model', 'model_id']);
            $table->index(['user_id', 'created_at']);
        });

        // Add activity logs
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action'); // login, purchase, view, etc
            $table->string('ip_address')->nullable();
            $table->text('data')->nullable(); // JSON
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
            $table->index(['action', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('audit_logs');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropIndex(['role', 'status']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropIndex(['created_at']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn('sold');
            $table->dropIndex(['category_id', 'is_active']);
        });
    }
};
