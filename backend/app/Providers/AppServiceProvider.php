<?php

namespace App\Providers;

use App\Models\ChatMessage;
use App\Models\Order;
use App\Support\StorefrontCache;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Paginator::useBootstrapFive();

        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        View::composer('layouts.frontend', function ($view): void {
            $view->with('layoutCategories', StorefrontCache::categories());
        });

        View::composer('layouts.admin', function ($view): void {
            $view->with(Cache::store('file')->remember('admin.layout-counts.v2', now()->addSeconds(30), function () {
                $hasAdminReadColumn = Cache::store('file')->remember('admin.chat-read-column.v1', now()->addDay(), fn () => Schema::hasColumn('chat_messages', 'admin_read_at'));
                $latestChatIds = ChatMessage::query()
                    ->selectRaw('MAX(id)')
                    ->whereNotNull('user_id')
                    ->whereIn('sender', ['customer', 'seller'])
                    ->groupBy('user_id');

                return [
                    'adminPendingOrdersCount' => Order::where(fn ($query) => $query
                        ->where('status', 'pending')
                        ->orWhere('cancel_status', 'pending')
                    )->count(),
                    'adminNewChatsCount' => $hasAdminReadColumn
                        ? ChatMessage::where('sender', 'customer')
                            ->whereNull('admin_read_at')
                            ->whereNotNull('user_id')
                            ->distinct()
                            ->count('user_id')
                        : ChatMessage::whereIn('id', $latestChatIds)
                            ->where('sender', 'customer')
                            ->count(),
                ];
            }));
        });
    }
}
