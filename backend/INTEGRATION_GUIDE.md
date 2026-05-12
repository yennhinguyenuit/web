# 🚀 Hướng Dẫn Tích Hợp Frontend - Chatbot + Chat + Reviews + Dark Mode

## 📋 Tổng Quan

### ✅ Backend đã chuẩn bị:

1. **Chatbot tối ưu** 
   - Gợi ý sản phẩm chi tiết (ảnh, giá, màu sắc, size)
   - Quick suggestions dựa trên đơn hàng
   - Response gồm: reply, recommendations, quickSuggestions

2. **Hệ thống Reviews**
   - Tạo/cập nhật/xóa review
   - Lấy danh sách sản phẩm chưa đánh giá
   - Cập nhật rating tự động

3. **Kênh Chat Customer-Admin**
   - Real-time messaging
   - Conversation management
   - Unread count

---

## 🔌 API Endpoints

### 1️⃣ CHATBOT
```
POST /api/chatbot

Request:
{
  "message": "Bạn có áo nào dưới 500k không?",
  "history": [
    { "role": "user", "text": "..." },
    { "role": "model", "text": "..." }
  ]
}

Response:
{
  "success": true,
  "data": {
    "reply": "Tôi có...",
    "recommendations": [
      {
        "id": "product-id",
        "name": "Áo thun nam",
        "slug": "ao-thun-nam",
        "price": 299000,
        "image": "https://...",
        "images": ["...", "...", "..."],
        "colors": ["Đen", "Trắng"],
        "sizes": ["S", "M", "L"],
        "ratingAvg": 4.6,
        "reviewCount": 124,
        "badge": "Sale 25%",
        "stock": 120
      }
    ],
    "quickSuggestions": [
      "🛍️ Tôi muốn xem những sản phẩm mới",
      "📦 Kiểm tra đơn hàng ABC123",
      "⭐ Đánh giá sản phẩm"
    ]
  }
}
```

### 2️⃣ REVIEWS
```
# Lấy sản phẩm chưa đánh giá
GET /api/reviews/eligible/products
Authorization: Bearer <token>

Response:
{
  "data": {
    "items": [
      {
        "id": "product-id",
        "name": "Áo thun",
        "slug": "ao-thun",
        "image": "...",
        "price": 299000,
        "ratingAvg": 4.6,
        "orderId": "order-id",
        "orderCode": "ORD001"
      }
    ],
    "count": 2
  }
}

# Tạo review
POST /api/reviews/product/:productId
Authorization: Bearer <token>

Request:
{
  "rating": 5,
  "comment": "Sản phẩm rất tốt!"
}

# Lấy reviews của sản phẩm
GET /api/reviews/product/:productId
```

### 3️⃣ MESSAGING
```
# Lấy danh sách conversation
GET /api/messaging/conversations
Authorization: Bearer <token>

Response:
{
  "data": [
    {
      "id": "conv-id",
      "buyerId": "user-id",
      "sellerId": "seller-id",
      "subject": "Về sản phẩm ABC",
      "messages": [
        {
          "id": "msg-id",
          "content": "Có stock không?",
          "senderId": "user-id",
          "isRead": true
        }
      ],
      "updatedAt": "2026-05-07T10:00:00Z"
    }
  ]
}

# Gửi tin nhắn
POST /api/messaging/messages
Authorization: Bearer <token>

Request:
{
  "conversationId": "conv-id",
  "content": "Tôi muốn hỏi về..."
}

# Tạo conversation
POST /api/messaging/conversations
Authorization: Bearer <token>

Request:
{
  "sellerId": "admin-id",
  "productId": "optional",
  "orderId": "optional",
  "subject": "Hỏi về sản phẩm"
}
```

---

## 💡 Frontend Implementation

### 1. Chatbot Component

```jsx
// ChatbotWidget.jsx
import { useState, useRef, useEffect } from 'react';

export default function ChatbotWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Thêm message của user vào UI
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: input,
      sender: 'user'
    }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages
        })
      });

      const { data } = await response.json();

      // Thêm reply từ bot
      setMessages(prev => [...prev, {
        role: 'model',
        text: data.reply,
        sender: 'bot',
        recommendations: data.recommendations,
        quickSuggestions: data.quickSuggestions
      }]);

    } catch (error) {
      console.error('Chatbot error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render product recommendations
  const renderRecommendations = (recommendations) => {
    return recommendations?.map(product => (
      <div key={product.id} className="product-card">
        <img src={product.image} alt={product.name} />
        <h4>{product.name}</h4>
        <p className="price">{product.price.toLocaleString('vi-VN')} VND</p>
        <div className="meta">
          <span className="colors">
            {product.colors.join(', ')}
          </span>
          <span className="rating">⭐ {product.ratingAvg}</span>
        </div>
        <a href={`/product/${product.slug}`} className="btn-primary">
          Xem chi tiết
        </a>
      </div>
    ));
  };

  // Render quick suggestions
  const renderQuickSuggestions = (suggestions) => {
    return suggestions?.map((suggestion, idx) => (
      <button 
        key={idx}
        className="quick-suggestion"
        onClick={() => setInput(suggestion)}
      >
        {suggestion}
      </button>
    ));
  };

  return (
    <div className="chatbot-widget">
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-text">{msg.text}</div>
            
            {msg.recommendations && (
              <div className="recommendations">
                {renderRecommendations(msg.recommendations)}
              </div>
            )}
            
            {msg.quickSuggestions && (
              <div className="quick-suggestions">
                {renderQuickSuggestions(msg.quickSuggestions)}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="Hỏi về sản phẩm..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading}>Gửi</button>
      </div>
    </div>
  );
}
```

---

### 2. Reviews Component

```jsx
// ReviewsList.jsx
import { useEffect, useState } from 'react';

export default function ReviewsList() {
  const [eligibleProducts, setEligibleProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetch('/api/reviews/eligible/products')
      .then(r => r.json())
      .then(({ data }) => setEligibleProducts(data.items));
  }, []);

  const handleSubmitReview = async (productId, rating, comment) => {
    await fetch(`/api/reviews/product/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment })
    });
    
    // Refresh list
    setEligibleProducts(prev => 
      prev.filter(p => p.id !== productId)
    );
  };

  return (
    <div className="reviews-section">
      <h3>⭐ Đánh giá sản phẩm đã mua</h3>
      <div className="products-grid">
        {eligibleProducts.map(product => (
          <div key={product.id} className="product-review-card">
            <img src={product.image} alt={product.name} />
            <h4>{product.name}</h4>
            <p>Từ đơn hàng: {product.orderCode}</p>
            <button 
              onClick={() => setSelectedProduct(product)}
              className="btn-secondary"
            >
              Đánh giá
            </button>
          </div>
        ))}
      </div>

      {/* Review Form Modal */}
      {selectedProduct && (
        <ReviewForm 
          product={selectedProduct}
          onSubmit={(rating, comment) => {
            handleSubmitReview(selectedProduct.id, rating, comment);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
```

---

### 3. Dark Mode Implementation

```jsx
// ThemeContext.jsx
import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Load từ localStorage
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ThemeToggle.jsx
import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button 
      onClick={toggleTheme}
      className="theme-toggle"
      title={`Chuyển sang ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

```css
/* theme.css */
:root[data-theme="light"] {
  --bg-color: #ffffff;
  --text-color: #000000;
  --border-color: #e0e0e0;
  --shadow: 0 2px 8px rgba(0,0,0,0.1);
}

:root[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
  --border-color: #333333;
  --shadow: 0 2px 8px rgba(0,0,0,0.3);
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
}

.message {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);
}
```

---

### 4. Messaging Component

```jsx
// CustomerChat.jsx
import { useState, useEffect } from 'react';

export default function CustomerChat() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    const res = await fetch('/api/messaging/conversations');
    const { data } = await res.json();
    setConversations(data);
  };

  const loadMessages = async (conversationId) => {
    const res = await fetch(`/api/messaging/conversations/${conversationId}`);
    const { data } = await res.json();
    setMessages(data.messages || []);
    setSelected(conversationId);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    await fetch('/api/messaging/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: selected,
        content: input
      })
    });

    setInput('');
    loadMessages(selected); // Refresh
  };

  return (
    <div className="customer-chat">
      <div className="chat-list">
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`chat-item ${selected === conv.id ? 'active' : ''}`}
            onClick={() => loadMessages(conv.id)}
          >
            <h4>{conv.subject || 'Cuộc trò chuyện'}</h4>
            <p className="last-msg">
              {conv.messages[0]?.content || 'Không có tin nhắn'}
            </p>
            <span className="time">
              {new Date(conv.updatedAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        ))}
      </div>

      <div className="chat-window">
        {selected && (
          <>
            <div className="messages">
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.isRead ? 'read' : 'unread'}`}>
                  <p>{msg.content}</p>
                  <span className="time">
                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="input-area">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Nhập tin nhắn..."
              />
              <button onClick={sendMessage}>Gửi</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## 📦 Dependencies Cần Cài

```bash
# Frontend
npm install axios react-query zustand

# Backend (nếu chưa có)
npm install socket.io socket.io-client  # Cho realtime chat (optional)
npm install ioredis  # Cho session management
```

---

## 🎯 Next Steps

1. ✅ **Chatbot**: Copy component trên vào Frontend
2. ✅ **Reviews**: Thêm page `/reviews` để khách đánh giá
3. ✅ **Messaging**: Thêm page `/messages` cho chat
4. ✅ **Theme**: Integrate theme toggle vào navbar
5. 🔄 **Realtime**: Setup Socket.io cho live chat (optional)

---

## 📞 Support
Nếu cần hỗ trợ, kiểm tra:
- `.env` có `GEMINI_API_KEY` không?
- Database migration đã chạy?
- CORS được enable chưa?
