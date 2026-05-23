const adminChatToken = document.querySelector('meta[name="csrf-token"]')?.content;
const adminChatLog = document.getElementById('admin-chat-log');
const adminChatTitle = document.getElementById('admin-chat-title');
const adminChatSubtitle = document.getElementById('admin-chat-subtitle');
const adminChatForm = document.getElementById('admin-chat-form');
const adminChatInput = document.getElementById('admin-chat-message');
const adminChatSubmit = document.getElementById('admin-chat-submit');
let activeCustomerId = null;
let adminChatTimer = null;
const adminChatNavBadges = document.querySelectorAll('[data-admin-chat-unread-badge]');
const adminChatNoticeLinks = document.querySelectorAll('[data-admin-chat-unread-link]');

if ((adminChatForm || adminChatLog) && (!adminChatForm || !adminChatLog || !adminChatInput || !adminChatSubmit)) {
    console.error('Admin chat is missing a required element.', {
        hasForm: Boolean(adminChatForm),
        hasLog: Boolean(adminChatLog),
        hasInput: Boolean(adminChatInput),
        hasSubmit: Boolean(adminChatSubmit),
    });
}

function escapeAdminChatHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function readAdminChatJson(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

function showAdminChatError(message) {
    if (!adminChatLog) return;

    adminChatLog.insertAdjacentHTML(
        'beforeend',
        `<div class="seller-chat-empty text-danger">${escapeAdminChatHtml(message)}</div>`
    );
    adminChatLog.scrollTop = adminChatLog.scrollHeight;
}

function renderAdminMessages(messages) {
    if (!adminChatLog) return;

    if (!messages.length) {
        adminChatLog.innerHTML = '<div class="seller-chat-empty">Khách hàng chưa gửi nội dung.</div>';
        return;
    }

    adminChatLog.innerHTML = messages.map((item) => {
        const sender = item.sender === 'seller' ? 'customer' : 'seller';
        const label = item.sender === 'seller' ? 'Bạn' : 'Khách';
        return `<div class="seller-chat-line ${sender}">
            <div class="seller-chat-bubble"><strong>${label}</strong><br>${escapeAdminChatHtml(item.message)}</div>
        </div>`;
    }).join('');
    adminChatLog.scrollTop = adminChatLog.scrollHeight;
}

function updateUnreadIndicators(button, unreadTotal = null) {
    button?.classList.remove('has-unread');
    button?.querySelector('.admin-chat-unread-badge')?.remove();

    if (unreadTotal === null) return;

    adminChatNavBadges.forEach((badge) => {
        if (unreadTotal > 0) {
            badge.hidden = false;
            badge.textContent = String(unreadTotal);
        } else {
            badge.hidden = true;
            badge.textContent = '';
        }
    });

    adminChatNoticeLinks.forEach((link) => {
        if (unreadTotal > 0) {
            link.hidden = false;
            link.textContent = `${unreadTotal} chat mới`;
        } else {
            link.hidden = true;
        }
    });
}

async function loadAdminChat(button) {
    const customerId = button.dataset.customerId || button.dataset.id;
    const messagesUrl = button.dataset.messagesUrl || `/admin/chats/${customerId}/messages`;

    if (!customerId || !messagesUrl) {
        console.error('Admin chat customer button is missing route data.', {
            customerId,
            messagesUrl,
            replyUrl: button.dataset.replyUrl,
        });
        return;
    }

    try {
        const response = await fetch(messagesUrl, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
        });
        const payload = await readAdminChatJson(response);

        if (!response.ok) {
            showAdminChatError(payload.message || 'Không tải được hội thoại.');
            return;
        }

        activeCustomerId = customerId;
        adminChatForm?.setAttribute('action', button.dataset.replyUrl || `/admin/chats/${customerId}/reply`);
        adminChatTitle.textContent = payload.customer.name;
        adminChatSubtitle.textContent = `${payload.customer.email || ''} ${payload.customer.phone || ''}`;
        adminChatInput.disabled = false;
        adminChatSubmit.disabled = false;
        renderAdminMessages(payload.messages || []);
        updateUnreadIndicators(button, payload.unread_total);
    } catch {
        showAdminChatError('Không kết nối được tới máy chủ chat.');
    }
}

document.querySelectorAll('.admin-chat-customer').forEach((button) => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.admin-chat-customer').forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        loadAdminChat(button);
        clearInterval(adminChatTimer);
        adminChatTimer = setInterval(() => loadAdminChat(button), 5000);
    });
});

adminChatForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeCustomerId) return;

    const message = adminChatInput?.value.trim();
    if (!message) return;

    if (!adminChatToken) {
        console.error('Admin chat CSRF token is missing.');
        showAdminChatError('Thiếu CSRF token. Vui lòng tải lại trang rồi thử lại.');
        return;
    }

    adminChatInput.value = '';
    adminChatSubmit.disabled = true;

    try {
        const response = await fetch(adminChatForm.getAttribute('action'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': adminChatToken,
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            body: JSON.stringify({ message }),
        });
        const payload = await readAdminChatJson(response);

        if (!response.ok) {
            showAdminChatError(payload.message || 'Không gửi được phản hồi.');
            return;
        }

        renderAdminMessages(payload.messages || []);
    } catch {
        showAdminChatError('Không kết nối được tới máy chủ chat.');
    } finally {
        adminChatSubmit.disabled = false;
    }
});

document.querySelector('.admin-chat-customer')?.click();
