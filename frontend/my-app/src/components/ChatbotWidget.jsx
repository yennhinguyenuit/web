// ChatbotWidget.jsx
import { useState, useRef, useEffect } from 'react';

export default function ChatbotWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          message: userMessage.text,
          history: messages.map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      if (!response.ok) throw new Error('Chatbot error');

      const { data } = await response.json();

      const botMessage = {
        role: 'model',
        text: data.reply,
        sender: 'bot',
        recommendations: data.recommendations,
        quickSuggestions: data.quickSuggestions,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: '❌ Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSuggestion = (suggestion) => {
    setInput(suggestion);
  };

  const renderRecommendations = (recommendations) => {
    if (!recommendations?.length) return null;

    return (
      <div className="recommendations">
        {recommendations.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <div style={{ flex: 1 }}>
              <h4>{product.name}</h4>
              <p className="price">
                {Number(product.price).toLocaleString('vi-VN')} VND
              </p>
              <div className="meta">
                <span className="colors">{product.colors?.slice(0, 2).join(', ')}</span>
                <span className="rating">⭐ {product.ratingAvg}</span>
              </div>
              <a 
                href={`/product/${product.slug}`}
                className="btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Xem chi tiết
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderQuickSuggestions = (suggestions) => {
    if (!suggestions?.length) return null;

    return (
      <div className="quick-suggestions">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            className="quick-suggestion"
            onClick={() => handleQuickSuggestion(suggestion)}
            disabled={loading}
          >
            {suggestion}
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          className="chat-button"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 999
          }}
        >
          💬
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="chatbot-widget">
          {/* Header */}
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0 }}>💬 Trợ lý Luxe Store</h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                width: '32px',
                height: '32px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                paddingTop: '40px'
              }}>
                <p style={{ fontSize: '14px' }}>
                  👋 Xin chào! Tôi có thể giúp bạn gì?
                </p>
                <p style={{ fontSize: '12px' }}>
                  Hỏi về sản phẩm, đơn hàng, hoặc bất cứ điều gì!
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-text">{msg.text}</div>

                {msg.recommendations && renderRecommendations(msg.recommendations)}
                {msg.quickSuggestions && renderQuickSuggestions(msg.quickSuggestions)}
              </div>
            ))}

            {loading && (
              <div className="message bot">
                <div className="message-text" style={{ fontStyle: 'italic' }}>
                  ⏳ Đang soạn tin nhắn...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Hỏi về sản phẩm..."
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

