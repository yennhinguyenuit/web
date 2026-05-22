const chatbotForm = document.getElementById('chatbot-form');
const chatbotLog = document.getElementById('chatbot-log');
const chatbotInput = document.getElementById('chatbot-message');
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotCard = document.getElementById('chatbot-card');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotSuggestionButtons = document.querySelectorAll('[data-chatbot-suggestion]');
const chatbotCsrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function setChatbotOpen(isOpen) {
    if (!chatbotCard || !chatbotToggle) return;

    chatbotCard.hidden = !isOpen;
    chatbotToggle.setAttribute('aria-expanded', String(isOpen));
    chatbotToggle.textContent = isOpen ? 'Thu gọn chatbot' : 'Mở chatbot';
    localStorage.setItem('luxe_chatbot_open', isOpen ? '1' : '0');
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

async function sendChatbotMessage(message) {
    if (!message) return;

    setChatbotOpen(true);
    appendChat('Bạn', message);
    if (chatbotInput) {
        chatbotInput.value = '';
    }

    const response = await fetch('/chatbot/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': chatbotCsrfToken,
        },
        body: JSON.stringify({ message }),
    });

    const payload = await response.json();
    appendChat('Trợ lý', response.ok ? payload.reply : 'Không thể gửi tin nhắn lúc này.');
}

chatbotToggle?.addEventListener('click', () => {
    setChatbotOpen(chatbotCard?.hidden ?? true);
});

chatbotClose?.addEventListener('click', () => {
    setChatbotOpen(false);
});

if (chatbotCard && chatbotToggle) {
    setChatbotOpen(localStorage.getItem('luxe_chatbot_open') === '1');
}

chatbotForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = chatbotInput.value.trim();
    await sendChatbotMessage(message);
});

chatbotSuggestionButtons.forEach((button) => {
    button.addEventListener('click', async () => {
        await sendChatbotMessage(button.dataset.chatbotSuggestion || button.textContent.trim());
    });
});
