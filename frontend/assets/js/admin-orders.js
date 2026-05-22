const orderAlert = document.getElementById('order-alert');
const orderCsrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

function showOrderAlert(message, type = 'success') {
    orderAlert.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

const orderStatusLabels = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
};

const paymentStatusLabels = {
    unpaid: 'Chưa thanh toán',
    pending: 'Đang chờ',
    paid: 'Đã thanh toán',
    failed: 'Thất bại',
    refunded: 'Hoàn tiền',
};

function setPill(pill, prefix, status, labels) {
    const roleClass = prefix === 'order-pill' ? 'order-status' : 'payment-status';
    pill.className = `${prefix} ${prefix}-${status} ${roleClass}`;
    pill.dataset.status = status;
    pill.textContent = labels[status] || status;
}

document.querySelectorAll('.order-update').forEach((button) => {
    button.addEventListener('click', async () => {
        const row = document.getElementById(`order-row-${button.dataset.id}`);
        const status = row.querySelector('.status-select').value;
        const paymentSelect = row.querySelector('.payment-select');

        if (row.dataset.paymentMethod === 'cod' && status === 'completed') {
            paymentSelect.value = 'paid';
        }

        const paymentStatus = paymentSelect.value;

        const response = await fetch(`/admin/orders/${button.dataset.id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': orderCsrfToken,
            },
            body: JSON.stringify({ status, payment_status: paymentStatus }),
        });
        const payload = await response.json();
        if (!response.ok) return showOrderAlert(payload.message || 'Không thể cập nhật đơn hàng.', 'danger');

        setPill(row.querySelector('.order-status'), 'order-pill', payload.order.status, orderStatusLabels);
        setPill(row.querySelector('.payment-status'), 'payment-pill', payload.order.payment_status, paymentStatusLabels);
        row.querySelector('.status-select').value = payload.order.status;
        paymentSelect.value = payload.order.payment_status;
        showOrderAlert(payload.message || 'Đã cập nhật đơn hàng.');
    });
});

document.querySelectorAll('.cancel-review').forEach((button) => {
    button.addEventListener('click', async () => {
        const decision = button.dataset.decision;
        const message = decision === 'approved'
            ? 'Duyệt hủy đơn hàng này?'
            : 'Từ chối yêu cầu hủy đơn này?';

        if (!confirm(message)) return;

        const response = await fetch(`/admin/orders/${button.dataset.id}/cancel-request`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': orderCsrfToken,
            },
            body: JSON.stringify({ decision }),
        });
        const payload = await response.json();
        if (!response.ok) return showOrderAlert(payload.message || 'Không thể xử lý yêu cầu hủy.', 'danger');

        showOrderAlert(payload.message || 'Đã xử lý yêu cầu hủy.');
        window.location.reload();
    });
});
