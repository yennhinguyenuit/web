// CustomerChat.jsx
import { useEffect, useState, useRef } from 'react';

export default function CustomerChat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    // Poll mỗi 3 giây để lấy tin nhắn mới
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messaging/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const { data } = await response.json();
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messaging/conversations/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to load messages');

      const { data } = await response.json();
      setMessages(data.messages || []);
      setSelectedConv(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedConv) return;

    setLoading(true);
    const messageContent = input;
    setInput('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messaging/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: selectedConv,
          content: messageContent
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      // Refresh messages
      await loadMessages(selectedConv);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('❌ Lỗi khi gửi tin nhắn');
      setInput(messageContent); // Restore input
    } finally {
      setLoading(false);
    }
  };

  const getLastMessage = (conv) => {
    const msg = conv.messages?.[0];
    return msg?.content || 'Không có tin nhắn';
  };

  const getUserId = () => {
    // Lấy từ token hoặc localStorage
    return localStorage.getItem('userId');
  };

  return (
    <div className="customer-chat">
      {/* Chat List */}
      <div className="chat-list">
        {conversations.length === 0 ? (
          <div style={{
            padding: '16px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            📭 Không có cuộc trò chuyện
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              className={`chat-item ${selectedConv === conv.id ? 'active' : ''}`}
              onClick={() => loadMessages(conv.id)}
            >
              <h4>{conv.subject || '💬 Cuộc trò chuyện'}</h4>
              <p className="last-msg">{getLastMessage(conv)}</p>
              <span className="time">
                {new Date(conv.updatedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Chat Window */}
      <div className="chat-window">
        {selectedConv ? (
          <>
            <div className="messages">
              {messages.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  paddingTop: '40px',
                  fontSize: '14px'
                }}>
                  💭 Bắt đầu cuộc trò chuyện
                </div>
              )}

              {messages.map(msg => {
                const isOwn = msg.senderId === getUserId();
                return (
                  <div
                    key={msg.id}
                    className={`message ${isOwn ? 'sent' : 'received'}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isOwn ? 'flex-end' : 'flex-start',
                      marginBottom: '8px'
                    }}
                  >
                    <p style={{
                      backgroundColor: isOwn ? 'var(--primary)' : 'var(--bg-secondary)',
                      color: isOwn ? 'white' : 'var(--text-primary)',
                      border: isOwn ? 'none' : '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      margin: 0,
                      maxWidth: '70%',
                      wordWrap: 'break-word',
                      fontSize: '14px'
                    }}>
                      {msg.content}
                    </p>
                    <span style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      marginTop: '4px'
                    }}>
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                );
              })}

              {loading && (
                <div style={{
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  fontStyle: 'italic'
                }}>
                  ⏳ Đang gửi...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="input-area">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Nhập tin nhắn..."
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
              >
                {loading ? '⏳' : '➤'}
              </button>
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-secondary)',
            fontSize: '16px'
          }}>
            👈 Chọn cuộc trò chuyện
          </div>
        )}
      </div>
    </div>
  );
}
