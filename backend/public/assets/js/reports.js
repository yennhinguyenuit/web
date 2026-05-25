let revenueChart;
let statusChart;
let topProductsChart;
let trafficChart;
let deviceChart;
let productClicksChart;

const chartColors = {
    ink: '#111827',
    zinc: '#52525b',
    muted: '#a1a1aa',
    grid: 'rgba(17, 24, 39, 0.08)',
    blue: '#2563eb',
    green: '#16a34a',
    amber: '#f59e0b',
    red: '#800020',
    teal: '#0f766e',
};

const statusColors = {
    confirmed: chartColors.ink,
    shipping: chartColors.blue,
    completed: chartColors.green,
    pending: chartColors.amber,
    cancelled: chartColors.red,
};

const deviceColors = {
    mobile: chartColors.green,
    desktop: chartColors.ink,
    tablet: chartColors.blue,
    unknown: chartColors.muted,
};

Chart.defaults.font.family = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
Chart.defaults.color = '#52525b';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.boxWidth = 8;

async function loadJson(url) {
    const response = await fetch(url, {
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
    });
    if (!response.ok) throw new Error('Không thể tải dữ liệu báo cáo');
    return response.json();
}

function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + 'đ';
}

function formatNumber(value) {
    return new Intl.NumberFormat('vi-VN').format(Number(value || 0));
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function destroyChart(chart) {
    if (chart) chart.destroy();
}

function baseScales() {
    return {
        x: {
            grid: { color: chartColors.grid, drawBorder: false },
            ticks: { color: chartColors.zinc },
        },
        y: {
            beginAtZero: true,
            grid: { color: chartColors.grid, drawBorder: false },
            ticks: { color: chartColors.zinc },
        },
    };
}

function setMetric(id, value) {
    const target = document.getElementById(id);
    if (target) target.textContent = formatNumber(value);
}

function drawRevenue(rows) {
    destroyChart(revenueChart);
    const target = document.getElementById('revenueChart');
    const gradient = target.getContext('2d').createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, 'rgba(17, 24, 39, 0.95)');
    gradient.addColorStop(1, 'rgba(17, 24, 39, 0.35)');

    revenueChart = new Chart(target, {
        type: 'bar',
        data: {
            labels: rows.map((row) => row.label),
            datasets: [{
                label: 'Doanh thu',
                data: rows.map((row) => row.value),
                backgroundColor: gradient,
                borderRadius: 8,
                borderSkipped: false,
                maxBarThickness: 42,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `Doanh thu: ${formatCurrency(context.parsed.y)}`,
                    },
                },
            },
            scales: {
                ...baseScales(),
                y: {
                    ...baseScales().y,
                    ticks: {
                        color: chartColors.zinc,
                        callback: (value) => formatCurrency(value),
                    },
                },
            },
        },
    });
}

function drawStatus(rows) {
    destroyChart(statusChart);
    const colors = rows.map((row) => statusColors[row.status] || chartColors.muted);

    statusChart = new Chart(document.getElementById('statusChart'), {
        type: 'doughnut',
        data: {
            labels: rows.map((row) => row.label),
            datasets: [{
                data: rows.map((row) => row.value),
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 4,
                hoverOffset: 6,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 16 },
                },
            },
        },
    });
}

function drawTopProducts(rows) {
    destroyChart(topProductsChart);

    topProductsChart = new Chart(document.getElementById('topProductsChart'), {
        type: 'bar',
        data: {
            labels: rows.map((row) => row.label),
            datasets: [{
                label: 'Số lượng bán',
                data: rows.map((row) => row.value),
                backgroundColor: chartColors.ink,
                borderRadius: 8,
                borderSkipped: false,
                maxBarThickness: 28,
            }],
        },
        options: horizontalBarOptions('Đã bán'),
    });
}

function drawTraffic(rows) {
    destroyChart(trafficChart);

    trafficChart = new Chart(document.getElementById('trafficChart'), {
        type: 'line',
        data: {
            labels: rows.map((row) => row.label),
            datasets: [{
                label: 'Lượt truy cập',
                data: rows.map((row) => row.value),
                borderColor: chartColors.teal,
                backgroundColor: 'rgba(15, 118, 110, 0.12)',
                borderWidth: 3,
                fill: true,
                pointRadius: 3,
                tension: 0.35,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `Lượt truy cập: ${formatNumber(context.parsed.y)}`,
                    },
                },
            },
            scales: {
                ...baseScales(),
                y: {
                    ...baseScales().y,
                    ticks: { precision: 0, color: chartColors.zinc },
                },
            },
        },
    });
}

function drawDevices(rows) {
    destroyChart(deviceChart);
    const hasData = rows.length > 0;
    const chartRows = hasData ? rows : [{ label: 'Chưa có dữ liệu', device: 'unknown', value: 1 }];

    deviceChart = new Chart(document.getElementById('deviceChart'), {
        type: 'doughnut',
        data: {
            labels: chartRows.map((row) => row.label),
            datasets: [{
                data: chartRows.map((row) => row.value),
                backgroundColor: chartRows.map((row) => deviceColors[row.device] || chartColors.muted),
                borderColor: '#fff',
                borderWidth: 4,
                hoverOffset: 6,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 16 },
                },
                tooltip: {
                    callbacks: {
                        label: (context) => hasData ? `${context.label}: ${formatNumber(context.parsed)}` : 'Chưa có dữ liệu',
                    },
                },
            },
        },
    });
}

function drawProductClicks(rows) {
    destroyChart(productClicksChart);

    productClicksChart = new Chart(document.getElementById('productClicksChart'), {
        type: 'bar',
        data: {
            labels: rows.map((row) => row.label),
            datasets: [{
                label: 'Lượt click',
                data: rows.map((row) => row.value),
                backgroundColor: chartColors.blue,
                borderRadius: 8,
                borderSkipped: false,
                maxBarThickness: 28,
            }],
        },
        options: horizontalBarOptions('Lượt click'),
    });
}

function horizontalBarOptions(label) {
    return {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `${label}: ${formatNumber(context.parsed.x)}`,
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: { color: chartColors.grid, drawBorder: false },
                ticks: { precision: 0, color: chartColors.zinc },
            },
            y: {
                grid: { display: false },
                ticks: { color: chartColors.zinc },
            },
        },
    };
}

function renderTopPages(rows) {
    const target = document.getElementById('topPagesList');
    if (!target) return;

    if (!rows.length) {
        target.innerHTML = '<div class="report-empty">Chưa có dữ liệu truy cập.</div>';
        return;
    }

    target.innerHTML = rows.map((row) => `
        <div class="report-list-row">
            <span>${escapeHtml(row.label)}</span>
            <strong>${formatNumber(row.value)}</strong>
        </div>
    `).join('');
}

function renderRecentVisits(rows) {
    const target = document.getElementById('recentVisitsTable');
    if (!target) return;

    if (!rows.length) {
        target.innerHTML = '<tr><td colspan="6" class="report-empty">Chưa có dữ liệu truy cập.</td></tr>';
        return;
    }

    target.innerHTML = rows.map((row) => `
        <tr>
            <td>${escapeHtml(row.time)}</td>
            <td>${escapeHtml(row.page)}</td>
            <td>${escapeHtml(row.device)}</td>
            <td>${escapeHtml(row.ip || '-')}</td>
            <td>${escapeHtml(row.user || 'Khách')}</td>
            <td>${escapeHtml(row.referer || '-')}</td>
        </tr>
    `).join('');
}

async function loadReports() {
    const year = document.getElementById('report-year').value;
    const button = document.getElementById('report-filter');
    button.disabled = true;
    button.textContent = 'Đang tải...';

    try {
        const [revenue, statuses, topProducts, traffic, productClicks] = await Promise.all([
            loadJson(`/admin/reports/revenue?year=${year}`),
            loadJson('/admin/reports/order-status'),
            loadJson(`/admin/reports/top-products?year=${year}`),
            loadJson('/admin/reports/traffic?days=30'),
            loadJson('/admin/reports/product-clicks?days=30'),
        ]);

        drawRevenue(revenue);
        drawStatus(statuses);
        drawTopProducts(topProducts);
        drawTraffic(traffic.daily || []);
        drawDevices(traffic.devices || []);
        drawProductClicks(productClicks.products || []);
        renderTopPages(traffic.top_pages || []);
        renderRecentVisits(traffic.recent_visits || []);

        setMetric('traffic-page-views', traffic.summary?.page_views || 0);
        setMetric('traffic-unique-visitors', traffic.summary?.unique_visitors || 0);
        setMetric('traffic-mobile-visits', traffic.summary?.mobile_visits || 0);
        setMetric('traffic-desktop-visits', traffic.summary?.desktop_visits || 0);
    } catch (error) {
        console.error(error);
    } finally {
        button.disabled = false;
        button.textContent = 'Lọc báo cáo';
    }
}

document.getElementById('report-filter')?.addEventListener('click', loadReports);
loadReports();
