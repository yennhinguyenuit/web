let orderAlert = document.getElementById('order-alert');
const orderCsrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

if (document.querySelector('.order-status-form') && !orderCsrfToken) {
    console.error('Order status CSRF token is missing.');
}

function getOrderAlert() {
    if (orderAlert) return orderAlert;

    orderAlert = document.createElement('div');
    document.querySelector('.admin-content')?.prepend(orderAlert);

    return orderAlert;
}

function showOrderAlert(message, type = 'success') {
    const alertTarget = getOrderAlert();

    if (!alertTarget) {
        console.error(message);
        return;
    }

    alertTarget.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    alertTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function readOrderJson(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

function validationMessage(payload, fallback) {
    const errors = Object.values(payload.errors || {}).flat().filter(Boolean);

    return payload.message || errors.join(' ') || fallback;
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
    if (!pill) return;

    const roleClass = prefix === 'order-pill' ? 'order-status' : 'payment-status';
    pill.className = `${prefix} ${prefix}-${status} ${roleClass}`;
    pill.dataset.status = status;
    pill.textContent = labels[status] || status;
}

document.querySelectorAll('.order-status-form').forEach((form) => {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!orderCsrfToken) {
            console.error('Order status CSRF token is missing.');
            showOrderAlert('Thiếu CSRF token. Vui lòng tải lại trang rồi thử lại.', 'danger');
            return;
        }

        if (!form.getAttribute('action')) {
            console.error('Order status form action is missing.', { form });
            showOrderAlert('Thiếu URL cập nhật đơn hàng. Vui lòng tải lại trang.', 'danger');
            return;
        }

        const row = form.closest('tr');
        const statusSelect = form.querySelector('.status-select');
        const paymentSelect = form.querySelector('.payment-select');
        const submitButton = form.querySelector('.order-update');
        const status = statusSelect.value;

        if (row?.dataset.paymentMethod === 'cod' && status === 'completed') {
            paymentSelect.value = 'paid';
        }

        submitButton.disabled = true;

        try {
            const response = await fetch(form.getAttribute('action'), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': orderCsrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    status,
                    payment_status: paymentSelect.value,
                }),
            });
            const payload = await readOrderJson(response);

            if (!response.ok) {
                showOrderAlert(validationMessage(payload, 'Không thể cập nhật đơn hàng.'), 'danger');
                return;
            }

            setPill(row?.querySelector('.order-status'), 'order-pill', payload.order.status, orderStatusLabels);
            setPill(row?.querySelector('.payment-status'), 'payment-pill', payload.order.payment_status, paymentStatusLabels);
            statusSelect.value = payload.order.status;
            paymentSelect.value = payload.order.payment_status;
            showOrderAlert(payload.message || 'Đã cập nhật đơn hàng.');
            setTimeout(() => window.location.reload(), 700);
        } catch {
            showOrderAlert('Không kết nối được tới máy chủ đơn hàng.', 'danger');
        } finally {
            submitButton.disabled = false;
        }
    });
});

document.querySelectorAll('.cancel-review').forEach((button) => {
    button.addEventListener('click', async () => {
        const decision = button.dataset.decision;

        if (!orderCsrfToken) {
            console.error('Cancel review CSRF token is missing.');
            showOrderAlert('Thiếu CSRF token. Vui lòng tải lại trang rồi thử lại.', 'danger');
            return;
        }

        if (!button.dataset.url && !button.dataset.id) {
            console.error('Cancel review button is missing route data.', { button });
            showOrderAlert('Thiếu URL xử lý yêu cầu hủy. Vui lòng tải lại trang.', 'danger');
            return;
        }

        button.disabled = true;

        try {
            const response = await fetch(button.dataset.url || `/admin/orders/${button.dataset.id}/cancel-request`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': orderCsrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ decision }),
            });
            const payload = await readOrderJson(response);

            if (!response.ok) {
                showOrderAlert(validationMessage(payload, 'Không thể xử lý yêu cầu hủy.'), 'danger');
                return;
            }

            showOrderAlert(payload.message || 'Đã xử lý yêu cầu hủy.');
            setTimeout(() => window.location.reload(), 700);
        } catch {
            showOrderAlert('Không kết nối được tới máy chủ đơn hàng.', 'danger');
        } finally {
            button.disabled = false;
        }
    });
});
