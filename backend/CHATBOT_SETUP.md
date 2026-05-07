# 🚀 Setup Chatbot Gemini API - Hướng Dẫn Đầy Đủ

## 📋 Yêu Cầu

- ✅ Node.js >= 18
- ✅ PostgreSQL Database
- ✅ Google Account (để lấy Gemini API Key)

---

## 1️⃣ Lấy Gemini API Key

### Bước 1: Truy cập Google AI Studio
👉 https://aistudio.google.com/apikey

### Bước 2: Tạo API Key
1. Click **"Create API Key"**
2. Chọn project (hoặc tạo project mới)
3. Copy API Key vừa tạo

### Bước 3: Lưu vào .env
```bash
# backend/.env
GEMINI_API_KEY=YOUR_API_KEY_HERE
GEMINI_MODEL=gemini-2.0-flash
```

---

## 2️⃣ Models Dostupni

| Model | Status | Rate Limit | Input Tokens/min | Ưu Điểm |
|-------|--------|-----------|-----------------|---------|
| `gemini-2.0-flash` | ✅ Recommended | Free | 1M | Nhanh, rẻ, đủ tốt |
| `gemini-1.5-flash` | ✅ Free | Free | 1M | Stable |
| `gemini-1.5-pro` | ⚠️ Paid | Needs credit | 2M | Chất lượng tốt hơn |

**Gợi ý:** Dùng `gemini-2.0-flash` cho production

---

## 3️⃣ Cấu Trúc Dự Án

```
backend/
├── .env                          ← API Key ở đây
├── src/
│   ├── controllers/
│   │   └── chatbot.controller.js ← Main logic
│   ├── routes/
│   │   └── chatbot.routes.js
│   └── middlewares/
│       └── auth.middleware.js    ← Optional auth
├── CHATBOT_SMART.md              ← Tech doc
└── test-chatbot.js               ← Test script
```

---

## 4️⃣ Chức Năng Chatbot

### ✨ Core Features

1. **Hiểu Trạng Thái Đơn Hàng** 🎁
   - Nếu user đã đăng nhập → hiển thị orders của họ
   - Trạng thái: pending, confirmed, processing, shipped, delivered, cancelled

2. **Biết Tất Cả Sản Phẩm** 🛍️
   - Query 50 sản phẩm mới nhất
   - Gợi ý dựa trên nhu cầu khách

3. **Thông Tin Liên Lạc Seller** 📞
   - Điện thoại: **0975771727**
   - Email: **luxestore@gmail.com**
   - Auto-reply khi khách hỏi

4. **Hoạt Động Cả Khi Chưa Đăng Nhập** 👥
   - Guest mode (không cần token)
   - Authenticated mode (có token)

---

## 5️⃣ API Endpoint

```
POST /api/chatbot
```

### Request (No Auth Required)
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Đơn hàng của tôi ở đâu?",
    "history": []
  }'
```

### Request (With Auth)
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "message": "Đơn hàng của tôi ở đâu?",
    "history": []
  }'
```

### Response
```json
{
  "success": true,
  "message": "Chatbot tra loi thanh cong",
  "data": {
    "reply": "Dựa trên thông tin của bạn...",
    "model": "gemini-2.0-flash",
    "finishReason": "STOP",
    "usage": {
      "promptTokens": 1234,
      "candidatesTokens": 89,
      "totalTokens": 1323
    }
  }
}
```

---

## 6️⃣ Testing

### Test 1: Hỏi Về Liên Lạc
```bash
node backend/test-chatbot.js "Làm sao liên hệ người bán?"
```

**Expected Response:**
```
Bạn có thể liên hệ người bán qua:
- Điện thoại: 0975771727
- Email: luxestore@gmail.com
```

### Test 2: Hỏi Về Sản Phẩm
```bash
node backend/test-chatbot.js "Có sản phẩm nào sale không?"
```

### Test 3: Hỏi Về Đơn Hàng (Cần Token)
```bash
# Trước tiên phải login để lấy token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Sau đó dùng token để hỏi
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "message": "Đơn hàng của tôi ở đâu?"
  }'
```

---

## 7️⃣ Rate Limiting

```
- 20 requests/phút/IP
- Nếu vượt: "Quá nhiều tin nhắn, vui lòng thử lại sau"
```

---

## 8️⃣ Troubleshooting

### ❌ Error: "Missing GEMINI_API_KEY"
**Nguyên nhân:** API Key chưa được set
**Giải pháp:**
```bash
# Check .env
cat backend/.env

# Hoặc set trực tiếp
export GEMINI_API_KEY=YOUR_KEY_HERE
```

### ❌ Error: "API quota exceeded"
**Nguyên nhân:** Free tier hết quota
**Giải pháp:**
1. Lấy API key khác từ Google AI Studio
2. Hoặc enable billing trên Google Cloud
3. Hoặc chờ 24 giờ để reset

### ❌ Error: "Model not found"
**Nguyên nhân:** Model name sai
**Giải pháp:**
```bash
# Check models khả dụng
# https://ai.google.dev/models

# Update .env
GEMINI_MODEL=gemini-2.0-flash
```

### ❌ Error: "Timeout"
**Nguyên nhân:** Gemini API quá chậm
**Giải pháp:**
```bash
# Retry lại sau 5-10 giây
# Hoặc kiểm tra status: https://status.cloud.google.com/
```

---

## 9️⃣ Frontend Implementation

### React Component
```jsx
import { useState } from 'react';

export const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const token = localStorage.getItem('auth_token'); // Nếu đã login

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          message: input,
          history: messages,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages([
          ...messages,
          { role: 'user', content: input },
          { role: 'model', content: data.data.reply },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="chatbot">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Hỏi gì đó..."
        disabled={loading}
      />
      <button onClick={sendMessage} disabled={loading}>
        {loading ? '⏳' : '➤'}
      </button>
    </div>
  );
};
```

---

## 🔟 Performance Tips

### Optimization
1. ✅ Cache product list (1 giờ)
2. ✅ Cache user orders (5 phút)
3. ✅ Limit products to 50, orders to 10
4. ✅ Use Redis for hot data

### Typical Response Time
```
Database Query:    100-300ms
Gemini API Call:   1-4 seconds
Response Format:   10-50ms
-----------------------
Total:             1-5 seconds
```

---

## 📖 Documentations

- 📄 [CHATBOT_SMART.md](./CHATBOT_SMART.md) - Technical details
- 📄 [MESSAGING_API.md](./MESSAGING_API.md) - Chat giữa buyer & seller
- 📄 [API_REFERENCE.md](./API_REFERENCE.md) - Tất cả endpoints

---

## 🎯 Next Steps

1. ✅ Lấy Gemini API Key mới
2. ✅ Update `backend/.env`
3. ✅ Restart server: `npm run dev`
4. ✅ Test API: `node backend/test-chatbot.js "Xin chào"`
5. ✅ Integrate vào Frontend

---

## 🆘 Support

Nếu gặp vấn đề:
1. Check server logs: `npm run dev`
2. Check API status: https://status.cloud.google.com/
3. Check quota: https://console.cloud.google.com/
4. Read: https://ai.google.dev/docs

---

**Last Updated:** May 7, 2026
**Status:** ✅ Ready for Production
