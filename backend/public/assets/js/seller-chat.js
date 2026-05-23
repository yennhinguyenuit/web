const sellerChatBox = document.getElementById('seller-chat-box');
const sellerChatLog = document.getElementById('seller-chat-log');
const sellerChatForm = document.getElementById('seller-chat-form');
const sellerChatInput = document.getElementById('seller-chat-message');
const sellerChatToken = document.querySelector('meta[name="csrf-token"]')?.content;
const sellerChatOpenButtons = document.querySelectorAll('[data-open-seller-chat]');
const sellerChatCloseButtons = document.querySelectorAll('[data-close-seller-chat]');
const sellerChatMessagesUrl = sellerChatForm?.dataset.messagesUrl || '/seller-chat/messages';
const sellerChatSendUrl = sellerChatForm?.getAttribute('action') || '/seller-chat/send';

if (sellerChatForm && (!sellerChatLog || !sellerChatInput || !sellerChatMessagesUrl || !sellerChatSendUrl)) {
    console.error('Seller chat is missing a required element or route.', {
        hasLog: Boolean(sellerChatLog),
        hasInput: Boolean(sellerChatInput),
        messagesUrl: sellerChatMessagesUrl,
        sendUrl: sellerChatSendUrl,
    });
}

function escapeSellerHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function readSellerJson(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

function showSellerChatError(message) {
    if (!sellerChatLog) return;

    sellerChatLog.insertAdjacentHTML(
        'beforeend',
        `<div class="seller-chat-empty text-danger">${escapeSellerHtml(message)}</div>`
    );
    sellerChatLog.scrollTop = sellerChatLog.scrollHeight;
}

function openSellerChat() {
    if (!sellerChatBox) return;

    sellerChatBox.hidden = false;
    loadSellerMessages();
    sellerChatInput?.focus();
}

function closeSellerChat() {
    if (!sellerChatBox) return;

    sellerChatBox.hidden = true;
}

function renderSellerMessages(messages) {
    if (!sellerChatLog) return;
    if (!messages.length) {
        sellerChatLog.innerHTML = '<div class="seller-chat-empty">Bạn có thể hỏi về size, tồn kho, đơn hàng hoặc khuyến mãi.</div>';
        return;
    }

    sellerChatLog.innerHTML = messages.map((item) => {
        const sender = item.sender === 'seller' ? 'seller' : 'customer';
        const label = sender === 'seller' ? 'Người bán' : 'Bạn';

        return `<div class="seller-chat-line ${sender}">
            <div class="seller-chat-bubble"><strong>${label}</strong><br>${escapeSellerHtml(item.message)}</div>
        </div>`;
    }).join('');
    sellerChatLog.scrollTop = sellerChatLog.scrollHeight;
}

async function loadSellerMessages() {
    if (!sellerChatLog) return;

    try {
        const response = await fetch(sellerChatMessagesUrl, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
        });
        const payload = await readSellerJson(response);

        if (!response.ok) {
            showSellerChatError(payload.message || 'Không tải được tin nhắn. Vui lòng tải lại trang.');
            return;
        }

        renderSellerMessages(payload.messages || []);
    } catch {
        showSellerChatError('Không kết nối được tới máy chủ chat.');
    }
}

sellerChatOpenButtons.forEach((button) => {
    button.addEventListener('click', openSellerChat);
});

sellerChatCloseButtons.forEach((button) => {
    button.addEventListener('click', closeSellerChat);
});

sellerChatForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = sellerChatInput?.value.trim();
    if (!message) return;

    if (!sellerChatToken) {
        console.error('Seller chat CSRF token is missing.');
        showSellerChatError('Thiếu CSRF token. Vui lòng tải lại trang rồi thử lại.');
        return;
    }

    sellerChatInput.value = '';

    try {
        const response = await fetch(sellerChatSendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': sellerChatToken,
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            body: JSON.stringify({ message }),
        });
        const payload = await readSellerJson(response);

        if (!response.ok) {
            showSellerChatError(payload.message || 'Không gửi được tin nhắn. Vui lòng thử lại.');
            return;
        }

        renderSellerMessages(payload.messages || []);
    } catch {
        showSellerChatError('Không kết nối được tới máy chủ chat.');
    }
});

if (sellerChatLog) {
    if (!sellerChatBox?.hidden) {
        loadSellerMessages();
    }

    setInterval(() => {
        if (!sellerChatBox?.hidden) {
            loadSellerMessages();
        }
    }, 5000);
}
