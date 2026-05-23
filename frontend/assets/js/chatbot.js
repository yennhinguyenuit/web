const chatbotForm = document.getElementById('chatbot-form');
const chatbotLog = document.getElementById('chatbot-log');
const chatbotInput = document.getElementById('chatbot-message');
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotCard = document.getElementById('chatbot-card');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotSuggestionButtons = document.querySelectorAll('[data-chatbot-suggestion]');
const chatbotCsrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

if ((chatbotToggle || chatbotForm) && (!chatbotToggle || !chatbotCard || !chatbotForm || !chatbotForm.getAttribute('action'))) {
    console.error('Chatbot is missing a required element or route.', {
        hasToggle: Boolean(chatbotToggle),
        hasCard: Boolean(chatbotCard),
        hasForm: Boolean(chatbotForm),
        action: chatbotForm?.getAttribute('action'),
    });
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function setChatbotPreference(isOpen) {
    try {
        localStorage.setItem('luxe_chatbot_open', isOpen ? '1' : '0');
    } catch {
        // Ignore private-mode storage errors.
    }
}

function getChatbotPreference() {
    try {
        return localStorage.getItem('luxe_chatbot_open') === '1';
    } catch {
        return false;
    }
}

function setChatbotOpen(isOpen) {
    if (!chatbotCard || !chatbotToggle) return;

    chatbotCard.hidden = !isOpen;
    chatbotToggle.setAttribute('aria-expanded', String(isOpen));
    chatbotToggle.textContent = isOpen ? 'Thu gọn chatbot' : 'Mở chatbot';
    setChatbotPreference(isOpen);
}

function appendChat(sender, message) {
    if (!chatbotLog) return;

    const messageClass = sender === 'Bạn' ? 'chat-message-user' : 'chat-message-assistant';
    chatbotLog.insertAdjacentHTML(
        'beforeend',
        `<div class="chat-message ${messageClass}"><strong>${escapeHtml(sender)}</strong><span>${escapeHtml(message)}</span></div>`
    );
    chatbotLog.scrollTop = chatbotLog.scrollHeight;
}

async function readChatbotJson(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

function chatbotErrorMessage(payload) {
    const errors = Object.values(payload.errors || {}).flat().filter(Boolean);

    return payload.message || errors.join(' ') || 'Không thể gửi tin nhắn lúc này. Vui lòng thử lại sau.';
}

async function sendChatbotMessage(message) {
    if (!message) return;

    setChatbotOpen(true);
    appendChat('Bạn', message);
    if (chatbotInput) {
        chatbotInput.value = '';
    }

    if (!chatbotCsrfToken) {
        console.error('Chatbot CSRF token is missing.');
        appendChat('Trợ lý', 'Thiếu CSRF token. Vui lòng tải lại trang rồi thử lại.');
        return;
    }

    const submitButton = chatbotForm?.querySelector('button[type="submit"], button:not([type])');
    if (submitButton) submitButton.disabled = true;

    try {
        const response = await fetch(chatbotForm?.getAttribute('action') || '/chatbot/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': chatbotCsrfToken,
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            body: JSON.stringify({ message }),
        });
        const payload = await readChatbotJson(response);

        appendChat('Trợ lý', response.ok ? payload.reply : chatbotErrorMessage(payload));
    } catch {
        appendChat('Trợ lý', 'Không kết nối được tới chatbot. Popup vẫn hoạt động, vui lòng thử lại sau.');
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
}

chatbotToggle?.addEventListener('click', () => {
    setChatbotOpen(chatbotCard?.hidden ?? true);
});

chatbotClose?.addEventListener('click', () => {
    setChatbotOpen(false);
});

if (chatbotCard && chatbotToggle) {
    setChatbotOpen(getChatbotPreference());
}

chatbotForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = chatbotInput?.value.trim();
    await sendChatbotMessage(message);
});

chatbotSuggestionButtons.forEach((button) => {
    button.addEventListener('click', async () => {
        await sendChatbotMessage(button.dataset.chatbotSuggestion || button.textContent.trim());
    });
});
