const adminChatToken = document.querySelector('meta[name="csrf-token"]')?.content;
const adminChatLog = document.getElementById('admin-chat-log');
const adminChatTitle = document.getElementById('admin-chat-title');
const adminChatSubtitle = document.getElementById('admin-chat-subtitle');
const adminChatForm = document.getElementById('admin-chat-form');
const adminChatInput = document.getElementById('admin-chat-message');
const adminChatSubmit = document.getElementById('admin-chat-submit');
let activeCustomerId = null;
let adminChatTimer = null;

function escapeAdminChatHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderAdminMessages(messages) {
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

async function loadAdminChat(customerId) {
    const response = await fetch(`/admin/chats/${customerId}/messages`, { headers: { Accept: 'application/json' } });
    if (!response.ok) return;
    const payload = await response.json();
    adminChatTitle.textContent = payload.customer.name;
    adminChatSubtitle.textContent = `${payload.customer.email || ''} ${payload.customer.phone || ''}`;
    adminChatInput.disabled = false;
    adminChatSubmit.disabled = false;
    renderAdminMessages(payload.messages || []);
}

document.querySelectorAll('.admin-chat-customer').forEach((button) => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.admin-chat-customer').forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        activeCustomerId = button.dataset.customerId || button.dataset.id;
        if (!activeCustomerId) return;
        loadAdminChat(activeCustomerId);
        clearInterval(adminChatTimer);
        adminChatTimer = setInterval(() => loadAdminChat(activeCustomerId), 5000);
    });
});

adminChatForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeCustomerId) return;
    const message = adminChatInput.value.trim();
    if (!message) return;
    adminChatInput.value = '';

    const response = await fetch(`/admin/chats/${activeCustomerId}/reply`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': adminChatToken,
        },
        body: JSON.stringify({ message }),
    });
    if (!response.ok) return;
    const payload = await response.json();
    renderAdminMessages(payload.messages || []);
});

document.querySelector('.admin-chat-customer')?.click();
