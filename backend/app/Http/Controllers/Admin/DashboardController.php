<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(): View
    {
        // KPIs
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total');
        $totalOrders = Order::count();
        $totalProducts = Product::count();
        $totalCustomers = User::where('role', 'customer')->count();
        
        // Current month
        $currentMonthRevenue = Order::where('payment_status', 'paid')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total');
        
        // Latest orders
        $latestOrders = Order::with('user')
            ->latest()
            ->take(10)
            ->get();
        
        // Low stock products
        $lowStockProducts = Product::where('stock', '<=', 5)
            ->orderBy('stock')
            ->take(8)
            ->get();
        
        // Top products (sold)
        $topProducts = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->with('product')
            ->get();
        
        // Revenue by month (6 months)
        $revenueByMonth = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subMonths(6))
            ->selectRaw("DATE_TRUNC('month', created_at) as month, SUM(total) as revenue")
            ->groupBy(DB::raw("DATE_TRUNC('month', created_at)"))
            ->orderBy('month')
            ->get()
            ->mapWithKeys(fn ($row) => [Carbon::parse($row->month)->format('m/Y') => (float) $row->revenue]);
        
        // Order status distribution
        $ordersByStatus = Order::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status');
        
        return view('admin.dashboard', [
            'totalRevenue' => $totalRevenue,
            'currentMonthRevenue' => $currentMonthRevenue,
            'totalOrders' => $totalOrders,
            'totalProducts' => $totalProducts,
            'totalCustomers' => $totalCustomers,
            'latestOrders' => $latestOrders,
            'lowStockProducts' => $lowStockProducts,
            'topProducts' => $topProducts,
            'revenueByMonth' => $revenueByMonth,
            'ordersByStatus' => $ordersByStatus,
        ]);
    }
}

