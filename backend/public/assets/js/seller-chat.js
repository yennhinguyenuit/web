const sellerChatBox = document.getElementById('seller-chat-box');
const sellerChatLog = document.getElementById('seller-chat-log');
const sellerChatForm = document.getElementById('seller-chat-form');
const sellerChatInput = document.getElementById('seller-chat-message');
const sellerChatToken = document.querySelector('meta[name="csrf-token"]')?.content;
const sellerChatOpenButtons = document.querySelectorAll('[data-open-seller-chat]');
const sellerChatCloseButtons = document.querySelectorAll('[data-close-seller-chat]');

function escapeSellerHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
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

    const response = await fetch('/seller-chat/messages', { headers: { Accept: 'application/json' } });
    if (!response.ok) return;

    const payload = await response.json();
    renderSellerMessages(payload.messages || []);
}

sellerChatOpenButtons.forEach((button) => {
    button.addEventListener('click', openSellerChat);
});

sellerChatCloseButtons.forEach((button) => {
    button.addEventListener('click', closeSellerChat);
});

sellerChatForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = sellerChatInput.value.trim();
    if (!message) return;

    sellerChatInput.value = '';

    const response = await fetch('/seller-chat/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': sellerChatToken,
        },
        body: JSON.stringify({ message }),
    });

    if (!response.ok) return;

    const payload = await response.json();
    renderSellerMessages(payload.messages || []);
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
