let revenueChart;
let statusChart;
let topProductsChart;

const chartColors = {
    ink: '#111827',
    zinc: '#52525b',
    muted: '#a1a1aa',
    grid: 'rgba(17, 24, 39, 0.08)',
    blue: '#2563eb',
    green: '#16a34a',
    amber: '#f59e0b',
    red: '#800020',
};

const statusColors = {
    confirmed: chartColors.ink,
    shipping: chartColors.blue,
    completed: chartColors.green,
    pending: chartColors.amber,
    cancelled: chartColors.red,
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
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `Đã bán: ${context.parsed.x}`,
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
        },
    });
}

async function loadReports() {
    const year = document.getElementById('report-year').value;
    const button = document.getElementById('report-filter');
    button.disabled = true;
    button.textContent = 'Đang tải...';

    try {
        const [revenue, statuses, topProducts] = await Promise.all([
            loadJson(`/admin/reports/revenue?year=${year}`),
            loadJson('/admin/reports/order-status'),
            loadJson(`/admin/reports/top-products?year=${year}`),
        ]);

        drawRevenue(revenue);
        drawStatus(statuses);
        drawTopProducts(topProducts);
    } finally {
        button.disabled = false;
        button.textContent = 'Lọc báo cáo';
    }
}

document.getElementById('report-filter')?.addEventListener('click', loadReports);
loadReports();
