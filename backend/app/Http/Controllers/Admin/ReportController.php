<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class ReportController extends Controller
{
    public function index(): View
    {
        $year = now()->year;
        $paidRevenue = Order::where('payment_status', 'paid')->whereYear('created_at', $year)->sum('total');
        $totalOrders = Order::whereYear('created_at', $year)->count();
        $completedOrders = Order::whereYear('created_at', $year)->where('status', 'completed')->count();
        $averageOrderValue = $totalOrders > 0 ? $paidRevenue / $totalOrders : 0;
        $topProduct = OrderItem::select('product_name', DB::raw('SUM(quantity) as sold_quantity'))
            ->whereHas('order', fn ($query) => $query->whereYear('created_at', $year))
            ->groupBy('product_name')
            ->orderByDesc('sold_quantity')
            ->first();

        return view('admin.reports.index', [
            'year' => $year,
            'paidRevenue' => $paidRevenue,
            'totalOrders' => $totalOrders,
            'completedOrders' => $completedOrders,
            'averageOrderValue' => $averageOrderValue,
            'topProduct' => $topProduct,
        ]);
    }

    public function revenue(Request $request): JsonResponse
    {
        $year = (int) $request->input('year', now()->year);
        $rows = Order::selectRaw('EXTRACT(MONTH FROM created_at) as month, SUM(total) as revenue')
            ->whereYear('created_at', $year)
            ->where('payment_status', 'paid')
            ->groupBy(DB::raw('EXTRACT(MONTH FROM created_at)'))
            ->orderBy(DB::raw('EXTRACT(MONTH FROM created_at)'))
            ->get()
            ->keyBy(fn ($row) => (int) $row->month);

        $data = collect(range(1, 12))->map(fn ($month) => [
            'label' => 'Tháng '.$month,
            'value' => (float) ($rows->get($month)?->revenue ?? 0),
        ]);

        return response()->json($data);
    }

    public function orderStatus(): JsonResponse
    {
        $labels = [
            'pending' => 'Chờ xử lý',
            'confirmed' => 'Đã xác nhận',
            'shipping' => 'Đang giao',
            'completed' => 'Hoàn thành',
            'cancelled' => 'Đã hủy',
        ];

        $rows = Order::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->orderBy('status')
            ->get();

        return response()->json($rows->map(fn ($row) => [
            'label' => $labels[$row->status] ?? $row->status,
            'status' => $row->status,
            'value' => (int) $row->total,
        ]));
    }

    public function topProducts(Request $request): JsonResponse
    {
        $year = (int) $request->input('year', now()->year);
        $limit = (int) $request->input('limit', 5);
        $rows = OrderItem::select('product_name', DB::raw('SUM(quantity) as sold_quantity'))
            ->whereHas('order', fn ($query) => $query->whereYear('created_at', $year))
            ->groupBy('product_name')
            ->orderByDesc('sold_quantity')
            ->limit($limit)
            ->get();

        return response()->json($rows->map(fn ($row) => [
            'label' => $row->product_name,
            'value' => (int) $row->sold_quantity,
        ]));
    }
}

