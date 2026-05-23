@extends('layouts.admin')

@section('title', 'Báo cáo')

@section('content')
<div class="report-page">
    <div class="report-hero admin-card">
        <div>
            <p class="report-kicker">Thống kê quản trị</p>
            <h2>Báo cáo bán hàng</h2>
            <p>Theo dõi doanh thu, trạng thái đơn hàng và sản phẩm bán chạy bằng dữ liệu cập nhật.</p>
        </div>
        <div class="report-filter">
            <label for="report-year">Năm báo cáo</label>
            <div>
                <input id="report-year" class="form-control" type="number" value="{{ $year }}" min="2020" max="{{ now()->year + 1 }}">
                <button id="report-filter" class="btn btn-dark">Lọc báo cáo</button>
            </div>
        </div>
    </div>

    <div class="report-metrics">
        <div class="report-metric-card"><span>Doanh thu paid</span><strong>{{ number_format($paidRevenue) }}đ</strong><small>Năm {{ $year }}</small></div>
        <div class="report-metric-card"><span>Tổng đơn hàng</span><strong>{{ number_format($totalOrders) }}</strong><small>Tất cả trạng thái</small></div>
        <div class="report-metric-card"><span>Hoàn thành</span><strong>{{ number_format($completedOrders) }}</strong><small>Đơn completed</small></div>
        <div class="report-metric-card"><span>Giá trị TB</span><strong>{{ number_format($averageOrderValue) }}đ</strong><small>{{ $topProduct?->product_name ? 'Top: '.$topProduct->product_name : 'Chưa có dữ liệu top' }}</small></div>
    </div>

    <div class="report-grid">
        <section class="report-panel report-panel-wide">
            <div class="report-panel-head"><div><h3>Doanh thu theo tháng</h3><p>Chỉ tính các đơn đã thanh toán.</p></div><span class="report-chip">Revenue</span></div>
            <div class="report-chart-box report-chart-lg"><canvas id="revenueChart"></canvas></div>
        </section>
        <section class="report-panel">
            <div class="report-panel-head"><div><h3>Đơn hàng theo trạng thái</h3><p>Tỷ lệ pending, shipping, completed...</p></div><span class="report-chip">Orders</span></div>
            <div class="report-chart-box report-chart-md"><canvas id="statusChart"></canvas></div>
        </section>
        <section class="report-panel report-panel-full">
            <div class="report-panel-head"><div><h3>Top sản phẩm bán chạy</h3><p>Xếp hạng theo tổng số lượng trong order items.</p></div><span class="report-chip">Products</span></div>
            <div class="report-chart-box report-chart-top"><canvas id="topProductsChart"></canvas></div>
        </section>
    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="/assets/js/reports.js?v=20260523"></script>
@endpush
