# 🤖 Chatbot Cải Tiến - Tài Liệu Kỹ Thuật

## Giới Thiệu

Chatbot thông minh sử dụng **Google Gemini AI** với khả năng:
- ✅ Hiểu trạng thái đơn hàng của từng user
- ✅ Biết tất cả sản phẩm để tư vấn
- ✅ Cung cấp thông tin liên lạc seller
- ✅ Hoạt động cả khi chưa đăng nhập (guest mode)
- ✅ Tối ưu hóa context nếu user đã đăng nhập

---

## Kiến Trúc

### System Architecture
```
Client Request
    ↓
Chatbot Route (Optional Auth Middleware)
    ↓
Chatbot Controller
    ├── Lấy User Info (nếu authenticated)
    ├── Query Orders từ Database
    ├── Query Products từ Database
    ├── Build Dynamic System Instruction
    └── Call Gemini API
    ↓
Gemini AI Response
    ↓
Return to Client
```

### Workflow Chi Tiết

```
1. Request đến /api/chatbot
   ├── Message: "Đơn hàng của tôi ở đâu?"
   └── Token: "Bearer eyJhbGc..." (optional)

2. Optional Auth Middleware
   ├── Nếu có token → Parse user info
   └── Nếu không có → Tiếp tục (guest)

3. Chatbot Controller
   ├── Lấy userId (nếu authenticated)
   │
   ├── Query Orders
   │   └── SELECT * FROM Order WHERE userId = ?
   │
   ├── Query Products
   │   └── SELECT * FROM Product WHERE isActive = true
   │
   ├── Build System Instruction
   │   ├── Base instructions
   │   ├── + Seller contact info
   │   ├── + User orders (nếu có)
   │   └── + Product list
   │
   └── Call Gemini API
       └── POST /v1beta/models/gemini-1.5-flash:generateContent

4. Gemini Response
   ├── Parse AI response
   └── Return to client
```

---

## API Endpoint

### POST /api/chatbot

**Không cần xác thực** (optional auth)

#### Request Body

```json
{
  "message": "Đơn hàng của tôi ở đâu?",
  "history": [
    {
      "role": "user",
      "content": "Xin chào"
    },
    {
      "role": "model",
      "content": "Xin chào! Tôi là trợ lý chat của Luxe Store. Tôi có thể giúp bạn với sản phẩm, đơn hàng, vận chuyển..."
    }
  ]
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "Chatbot tra loi thanh cong",
  "data": {
    "reply": "Dựa trên thông tin của bạn, đơn hàng #ORD-001 đang ở trạng thái 'shipped' và sẽ được giao trong 2-3 ngày tới. Bạn có thể theo dõi chi tiết trên trang 'Đơn hàng của tôi'.",
    "model": "gemini-1.5-flash",
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

## Dynamic System Instruction

### Cấu Trúc

System instruction được xây dựng động với 5 phần:

#### 1. Base Instructions (cố định)
```
- Bạn là trợ lý chat của Luxe Store
- Trả lời bằng tiếng Việt, ngắn gọn, thân thiện
- Hỗ trợ sản phẩm, giỏ hàng, đặt hàng, thanh toán...
```

#### 2. Seller Contact Info
```
THÔNG TIN LIÊN LẠC NGƯỜI BÁN:
- Điện thoại: 0975771727
- Email: luxestore@gmail.com
```

#### 3. Order Status Mapping
```
TRẠNG THÁI ĐƠN HÀNG:
- pending: Chờ xác nhận
- confirmed: Đã xác nhận
- processing: Đang chuẩn bị
- shipped: Đã gửi
- delivered: Đã giao
- cancelled: Đã hủy
```

#### 4. User Orders (Dynamic - nếu authenticated)
```
THÔNG TIN ĐƠN HÀNG CỦA KHÁCH HÀNG:
- Mã đơn: ORD-001, Trạng thái: shipped, Thanh toán: paid, Ngày: 07/05/2026
- Mã đơn: ORD-002, Trạng thái: pending, Thanh toán: pending, Ngày: 05/05/2026
```

#### 5. Product List (Dynamic)
```
CÁC SẢN PHẨM CÓ TRÊN SHOP:
- Áo Thun Nam (Quần Áo): 150,000 VND, Rating: 4.5/5
- Quần Jean (Quần Áo): 350,000 VND, Rating: 4.2/5
- Giày Sneaker (Giày Dép): 899,000 VND, Rating: 4.8/5
...
```

---

## Use Cases

### UC1: Guest User Hỏi Về Liên Lạc

```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Làm sao mà liên hệ được người bán?",
    "history": []
  }'
```

**Response:**
```
Bạn có thể liên hệ người bán qua:
- Điện thoại: 0975771727
- Email: luxestore@gmail.com

Tôi sẵn sàng hỗ trợ bạn!
```

### UC2: Authenticated User Hỏi Về Đơn Hàng

```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "message": "Đơn hàng của tôi đã được giao chưa?",
    "history": []
  }'
```

**Response:**
```
Bạn có 2 đơn hàng:
1. Mã ORD-001 (ngày 07/05/2026):
   - Trạng thái: Đã gửi (shipped)
   - Thanh toán: Đã thanh toán
   - Dự kiến giao: 2-3 ngày tới

2. Mã ORD-002 (ngày 05/05/2026):
   - Trạng thái: Chờ xác nhận
   - Thanh toán: Chưa thanh toán
   - Hãy thanh toán để tiếp tục xử lý đơn hàng

Cần giúp gì thêm không?
```

### UC3: Hỏi Tư Vấn Sản Phẩm

```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tôi cần tìm một chiếc áo chất lượng tốt. Có gì gợi ý không?",
    "history": []
  }'
```

**Response:**
```
Dựa trên danh sách sản phẩm, tôi gợi ý:
- Áo Thun Nam: 150,000 VND (Rating: 4.5/5) - Sản phẩm bán chạy
- Áo Sơ Mi Lụa: 250,000 VND (Rating: 4.3/5) - Thích hợp cho dịp lễ

Bạn muốn xem thêm chi tiết sản phẩm nào không?
```

---

## Code Implementation

### Modified Files

1. **[src/controllers/chatbot.controller.js](src/controllers/chatbot.controller.js)**
   - ✅ Thêm import prisma
   - ✅ Thêm SELLER_INFO constant
   - ✅ Tạo hàm `buildSystemInstruction()` động
   - ✅ Sửa `postToGemini()` để nhận systemInstruction
   - ✅ Cập nhật `chatWithGemini()` để query DB

2. **[src/middlewares/auth.middleware.js](src/middlewares/auth.middleware.js)**
   - ✅ Thêm `optionalAuthMiddleware` function
   - ✅ Export cả `authenticate` và `optionalAuthenticate`
   - ✅ Maintain backward compatibility

3. **[src/routes/chatbot.routes.js](src/routes/chatbot.routes.js)**
   - ✅ Sử dụng `optionalAuthenticate` middleware
   - ✅ Rate limit vẫn giữ nguyên

---

## Performance Optimization

### Database Queries
- ⚡ Limit orders: 10 đơn gần nhất
- ⚡ Limit products: 50 sản phẩm gần nhất
- ⚡ Select chỉ những field cần thiết
- ⚡ Lọc: isActive=true, isDeleted=false

### Response Time
```
Typical: 2-5 giây (tùy Gemini API latency)
- DB Query: ~100-300ms
- Gemini API: ~1-4s
- Response format: ~10-50ms
```

### Caching Strategy (Future)
- [ ] Cache product list (1 giờ)
- [ ] Cache user orders (5 phút)
- [ ] Redis cache cho thường xuyên hỏi

---

## Error Handling

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-----------|---------|
| 400 | Message trống | Kiểm tra message không rỗng |
| 504 | Gemini timeout | Retry hoặc hỏi lại |
| 500 | Missing API Key | Check .env GEMINI_API_KEY |
| 502 | Gemini lỗi | Check Gemini quota |

---

## Testing

### Test bằng Terminal

```bash
# Test 1: Basic message
node backend/test-chatbot.js "Xin chào"

# Test 2: Question about contact
node backend/test-chatbot.js "Liên hệ người bán như nào?"

# Test 3: Multi-turn conversation
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Có sản phẩm nào sale không?",
    "history": [
      {
        "role": "user",
        "content": "Xin chào"
      },
      {
        "role": "model",
        "content": "Xin chào! Tôi là trợ lý chat Luxe Store..."
      }
    ]
  }'
```

### Test File
Chạy: `node backend/test-chatbot.js`

---

## Frontend Integration

### React Hook Example

```javascript
import { useState } from 'react';

export const useChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Optional: thêm token nếu user đã đăng nhập
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: content,
          history: messages,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages([
          ...messages,
          { role: 'user', content },
          { role: 'model', content: data.data.reply },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, sendMessage };
};
```

### Component Usage

```jsx
export const ChatBot = () => {
  const { messages, loading, sendMessage } = useChatbot();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="chatbot-container">
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
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Hỏi gì đó..."
      />
      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Đang gõ...' : 'Gửi'}
      </button>
    </div>
  );
};
```

---

## Configuration

### Environment Variables
```
# .env
GEMINI_API_KEY=AIzaSyDN2zgAmQ9fv9G_tQGFd-FBkzlcdaXk668
GEMINI_MODEL=gemini-1.5-flash
```

### Seller Info (CONSTANT)
```javascript
const SELLER_INFO = {
  phone: "0975771727",
  email: "luxestore@gmail.com",
};
```

---

## Lưu Ý Quan Trọng

1. **Guest Mode**: Chatbot hoạt động cả khi chưa đăng nhập
2. **Optional Auth**: Nếu user đăng nhập, sẽ hiển thị order & tư vấn cá nhân hóa hơn
3. **Dynamic Context**: System instruction được build mỗi lần request → real-time data
4. **Rate Limit**: 20 requests/phút/IP
5. **Timeout**: 20 giây cho mỗi request

---

## Cải Tiến Tương Lai

- [ ] WebSocket cho real-time streaming
- [ ] Caching database queries
- [ ] Multi-language support
- [ ] Sentiment analysis
- [ ] User feedback rating (👍/👎)
- [ ] Export chat history
- [ ] FAQ integration
- [ ] Product recommendation engine
