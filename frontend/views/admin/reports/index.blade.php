@extends('layouts.admin')

@section('title', 'Báo cáo')

@section('content')
<div class="report-page">
    <div class="report-hero admin-card">
        <div>
            <p class="report-kicker">Thống kê quản trị</p>
            <h2>Báo cáo bán hàng</h2>
            <p>Theo dõi doanh thu, trạng thái đơn hàng, sản phẩm bán chạy, traffic website và hành vi click sản phẩm.</p>
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

    <div class="report-metrics">
        <div class="report-metric-card"><span>Lượt truy cập</span><strong id="traffic-page-views">0</strong><small>30 ngày gần nhất</small></div>
        <div class="report-metric-card"><span>Khách truy cập</span><strong id="traffic-unique-visitors">0</strong><small>Theo session/IP</small></div>
        <div class="report-metric-card"><span>Điện thoại</span><strong id="traffic-mobile-visits">0</strong><small>Lượt xem mobile</small></div>
        <div class="report-metric-card"><span>Laptop/PC</span><strong id="traffic-desktop-visits">0</strong><small>Lượt xem desktop</small></div>
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
        <section class="report-panel report-panel-wide">
            <div class="report-panel-head"><div><h3>Traffic website</h3><p>Lượt truy cập theo ngày trên các trang khách hàng.</p></div><span class="report-chip">Traffic</span></div>
            <div class="report-chart-box report-chart-lg"><canvas id="trafficChart"></canvas></div>
        </section>
        <section class="report-panel">
            <div class="report-panel-head"><div><h3>Thiết bị truy cập</h3><p>Phân nhóm theo user-agent.</p></div><span class="report-chip">Device</span></div>
            <div class="report-chart-box report-chart-md"><canvas id="deviceChart"></canvas></div>
        </section>
        <section class="report-panel report-panel-wide">
            <div class="report-panel-head"><div><h3>Click từng sản phẩm</h3><p>Đếm lượt bấm từ card sản phẩm vào trang chi tiết.</p></div><span class="report-chip">Clicks</span></div>
            <div class="report-chart-box report-chart-top"><canvas id="productClicksChart"></canvas></div>
        </section>
        <section class="report-panel">
            <div class="report-panel-head"><div><h3>Trang được xem nhiều</h3><p>Top URL có lượt truy cập cao.</p></div><span class="report-chip">Pages</span></div>
            <div id="topPagesList" class="report-list"></div>
        </section>
        <section class="report-panel report-panel-full">
            <div class="report-panel-head"><div><h3>Lịch truy cập gần đây</h3><p>Thời gian, trang, thiết bị và nguồn giới thiệu.</p></div><span class="report-chip">History</span></div>
            <div class="report-table-wrap">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Thời gian</th>
                            <th>Trang</th>
                            <th>Thiết bị</th>
                            <th>IP</th>
                            <th>User</th>
                            <th>Nguồn</th>
                        </tr>
                    </thead>
                    <tbody id="recentVisitsTable"></tbody>
                </table>
            </div>
        </section>
    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="/assets/js/reports.js?v=20260525"></script>
@endpush
