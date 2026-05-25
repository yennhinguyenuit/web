<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Order;
use App\Models\OrderItem;
use App\Support\TrafficTelemetry;
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

    public function traffic(Request $request): JsonResponse
    {
        [$start, $end, $days] = $this->reportWindow($request);

        $logs = ActivityLog::with('user')
            ->where('action', 'page_view')
            ->whereBetween('created_at', [$start, $end])
            ->latest()
            ->get();

        $dailyCounts = $logs
            ->groupBy(fn (ActivityLog $log) => $log->created_at->toDateString())
            ->map->count();

        $daily = collect(range(0, $days - 1))->map(function (int $offset) use ($start, $dailyCounts) {
            $date = $start->copy()->addDays($offset);

            return [
                'label' => $date->format('d/m'),
                'value' => (int) ($dailyCounts->get($date->toDateString(), 0)),
            ];
        });

        $deviceCounts = $logs
            ->groupBy(fn (ActivityLog $log) => $this->logData($log)['device_type'] ?? 'unknown')
            ->map->count();

        $topPages = $logs
            ->groupBy(fn (ActivityLog $log) => $this->pageLabel($log))
            ->map(fn ($group, string $page) => [
                'label' => $page,
                'value' => $group->count(),
            ])
            ->sortByDesc('value')
            ->take(8)
            ->values();

        $recentVisits = $logs->take(15)->map(function (ActivityLog $log) {
            $data = $this->logData($log);

            return [
                'time' => $log->created_at->format('d/m/Y H:i'),
                'page' => $this->pageLabel($log),
                'device' => TrafficTelemetry::deviceLabel($data['device_type'] ?? null),
                'ip' => $log->ip_address,
                'user' => $log->user?->name,
                'referer' => $this->refererHost($data['referer'] ?? null),
            ];
        });

        return response()->json([
            'summary' => [
                'page_views' => $logs->count(),
                'unique_visitors' => $logs->map(fn (ActivityLog $log) => $this->visitorKey($log))->filter()->unique()->count(),
                'mobile_visits' => (int) ($deviceCounts->get('mobile', 0)),
                'desktop_visits' => (int) ($deviceCounts->get('desktop', 0)),
            ],
            'daily' => $daily,
            'devices' => $this->deviceRows($deviceCounts),
            'top_pages' => $topPages,
            'recent_visits' => $recentVisits,
        ]);
    }

    public function productClicks(Request $request): JsonResponse
    {
        [$start, $end] = $this->reportWindow($request);

        $logs = ActivityLog::query()
            ->where('action', 'product_click')
            ->whereBetween('created_at', [$start, $end])
            ->latest()
            ->get();

        $productGroups = $logs
            ->groupBy(fn (ActivityLog $log) => $this->logData($log)['product_id'] ?? $this->logData($log)['product_name'] ?? 'unknown')
            ->filter(fn ($group, $key) => $key !== 'unknown');

        $products = $productGroups
            ->map(function ($group) {
                /** @var ActivityLog $first */
                $first = $group->first();
                $last = $group->sortByDesc('created_at')->first();
                $data = $this->logData($first);

                return [
                    'label' => $data['product_name'] ?? 'Không rõ sản phẩm',
                    'product_id' => $data['product_id'] ?? null,
                    'category' => $data['category'] ?? null,
                    'value' => $group->count(),
                    'last_clicked_at' => $last?->created_at?->format('d/m/Y H:i'),
                ];
            })
            ->sortByDesc('value')
            ->take(10)
            ->values();

        $deviceCounts = $logs
            ->groupBy(fn (ActivityLog $log) => $this->logData($log)['device_type'] ?? 'unknown')
            ->map->count();

        $recentClicks = $logs->take(15)->map(function (ActivityLog $log) {
            $data = $this->logData($log);

            return [
                'time' => $log->created_at->format('d/m/Y H:i'),
                'product' => $data['product_name'] ?? 'Không rõ sản phẩm',
                'device' => TrafficTelemetry::deviceLabel($data['device_type'] ?? null),
                'source' => $this->pathFromUrl($data['source_url'] ?? null),
            ];
        });

        return response()->json([
            'summary' => [
                'total_clicks' => $logs->count(),
                'clicked_products' => $productGroups->count(),
            ],
            'products' => $products,
            'devices' => $this->deviceRows($deviceCounts),
            'recent_clicks' => $recentClicks,
        ]);
    }

    private function reportWindow(Request $request): array
    {
        $days = max(1, min((int) $request->input('days', 30), 90));

        return [
            now()->subDays($days - 1)->startOfDay(),
            now()->endOfDay(),
            $days,
        ];
    }

    private function logData(ActivityLog $log): array
    {
        return is_array($log->data) ? $log->data : [];
    }

    private function deviceRows($deviceCounts)
    {
        return collect(['mobile', 'desktop', 'tablet', 'unknown'])
            ->map(fn (string $device) => [
                'label' => TrafficTelemetry::deviceLabel($device),
                'device' => $device,
                'value' => (int) ($deviceCounts->get($device, 0)),
            ])
            ->filter(fn (array $row) => $row['value'] > 0)
            ->values();
    }

    private function pageLabel(ActivityLog $log): string
    {
        $data = $this->logData($log);
        $path = $data['path'] ?? $this->pathFromUrl($data['url'] ?? null);

        return $path === '/' ? 'Trang chủ' : ($path ?: 'Không rõ');
    }

    private function pathFromUrl(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        $path = parse_url($url, PHP_URL_PATH);

        return $path ?: '/';
    }

    private function refererHost(?string $referer): ?string
    {
        if (! $referer) {
            return null;
        }

        return parse_url($referer, PHP_URL_HOST) ?: $referer;
    }

    private function visitorKey(ActivityLog $log): ?string
    {
        $data = $this->logData($log);

        return $data['session_id']
            ?? ($log->ip_address ? $log->ip_address.'|'.($data['user_agent'] ?? '') : null);
    }
}

