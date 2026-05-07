# Hệ Thống Messaging - Tài Liệu API

## Giới Thiệu
Hệ thống messaging cho phép Người Mua (Buyer) và Nhà Bán (Seller) liên lạc trực tiếp với nhau.

## Cấu Trúc Dữ Liệu

### Conversation
```
{
  id: string (UUID),
  buyerId: string,
  sellerId: string,
  productId?: string,
  orderId?: string,
  subject?: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
  messages: Message[]
}
```

### Message
```
{
  id: string (UUID),
  conversationId: string,
  senderId: string,
  content: string,
  isRead: boolean,
  readAt?: Date,
  createdAt: Date
}
```

## API Endpoints

### 1. Lấy Danh Sách Conversation
**Endpoint:** `GET /api/messaging/conversations`

**Query Parameters:**
- `role` (optional): "buyer" | "seller" - Lọc theo vai trò (bỏ trống để lấy cả 2)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách conversation thành công",
  "data": [
    {
      "id": "conv-123",
      "buyerId": "user-1",
      "sellerId": "user-2",
      "productId": "prod-123",
      "subject": "Hỏi về sản phẩm",
      "isActive": true,
      "messages": [
        {
          "id": "msg-1",
          "content": "Tin nhắn gần nhất",
          "senderId": "user-2",
          "createdAt": "2026-05-07T10:30:00Z"
        }
      ],
      "updatedAt": "2026-05-07T10:30:00Z"
    }
  ]
}
```

---

### 2. Tạo/Lấy Conversation
**Endpoint:** `POST /api/messaging/conversations`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sellerId": "seller-uuid",
  "productId": "product-uuid (optional)",
  "orderId": "order-uuid (optional)",
  "subject": "Tiêu đề (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Tạo conversation thành công",
  "data": {
    "id": "conv-123",
    "buyerId": "user-1",
    "sellerId": "seller-uuid",
    "productId": "product-uuid",
    "isActive": true,
    "createdAt": "2026-05-07T10:00:00Z"
  }
}
```

---

### 3. Lấy Chi Tiết Conversation (Tất Cả Messages)
**Endpoint:** `GET /api/messaging/conversations/:conversationId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy chi tiết conversation thành công",
  "data": {
    "id": "conv-123",
    "buyerId": "user-1",
    "sellerId": "user-2",
    "messages": [
      {
        "id": "msg-1",
        "conversationId": "conv-123",
        "senderId": "user-1",
        "content": "Xin chào, bạn có sản phẩm này không?",
        "isRead": true,
        "readAt": "2026-05-07T10:05:00Z",
        "createdAt": "2026-05-07T10:00:00Z"
      },
      {
        "id": "msg-2",
        "conversationId": "conv-123",
        "senderId": "user-2",
        "content": "Có chứ, bao nhiêu chiếc?",
        "isRead": true,
        "readAt": "2026-05-07T10:10:00Z",
        "createdAt": "2026-05-07T10:03:00Z"
      }
    ]
  }
}
```

**Lưu ý:** Tin nhắn không phải của mình sẽ được tự động đánh dấu là đã đọc.

---

### 4. Gửi Tin Nhắn
**Endpoint:** `POST /api/messaging/messages`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "conversationId": "conv-123",
  "content": "Nội dung tin nhắn"
}
```

**Constraints:**
- Content không được trống
- Tối đa 5000 ký tự

**Response (201):**
```json
{
  "success": true,
  "message": "Gửi tin nhắn thành công",
  "data": {
    "id": "msg-123",
    "conversationId": "conv-123",
    "senderId": "user-1",
    "content": "Nội dung tin nhắn",
    "isRead": false,
    "createdAt": "2026-05-07T10:30:00Z"
  }
}
```

---

### 5. Lấy Số Lượng Tin Nhắn Chưa Đọc
**Endpoint:** `GET /api/messaging/unread-count`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy số lượng tin nhắn chưa đọc thành công",
  "data": {
    "unreadCount": 5
  }
}
```

---

### 6. Đánh Dấu Conversation Hoạt Động/Không Hoạt Động
**Endpoint:** `PATCH /api/messaging/conversations/:conversationId/status`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái conversation thành công",
  "data": {
    "id": "conv-123",
    "isActive": false,
    "updatedAt": "2026-05-07T10:30:00Z"
  }
}
```

---

## Luồng Sử Dụng

### Scenario 1: Buyer Muốn Hỏi Về Sản Phẩm

```
1. Buyer tạo conversation mới:
   POST /api/messaging/conversations
   {
     "sellerId": "seller-uuid",
     "productId": "product-uuid",
     "subject": "Hỏi về kích cỡ sản phẩm"
   }

2. Buyer gửi tin nhắn:
   POST /api/messaging/messages
   {
     "conversationId": "conv-123",
     "content": "Có size S không?"
   }

3. Seller nhận được tin nhắn và trả lời
   (Seller có thể thấy unread count và lấy chi tiết conversation)

4. Buyer xem tin nhắn mới:
   GET /api/messaging/conversations/conv-123
   (Tin nhắn tự động được đánh dấu là đã đọc)
```

### Scenario 2: Seller Muốn Liên Lạc Về Đơn Hàng

```
1. Seller lấy danh sách conversation:
   GET /api/messaging/conversations?role=seller

2. Seller chọn một conversation:
   GET /api/messaging/conversations/conv-123

3. Seller gửi tin nhắn:
   POST /api/messaging/messages
   {
     "conversationId": "conv-123",
     "content": "Đơn hàng của bạn sắp được giao"
   }
```

---

## Lỗi Có Thể Gặp

| Code | Message | Mô Tả |
|------|---------|-------|
| 400 | Vui lòng cung cấp sellerId | Thiếu dữ liệu bắt buộc |
| 400 | Nội dung tin nhắn không được trống | Gửi tin nhắn trống |
| 403 | Bạn không có quyền truy cập | Không phải là participant |
| 404 | Conversation không tồn tại | ID conversation sai |
| 404 | Seller không tồn tại | Seller ID không hợp lệ |
| 500 | Lỗi server | Lỗi hệ thống |

---

## Lưu Ý

1. **Xác thực**: Tất cả endpoints đều yêu cầu JWT token
2. **Quyền truy cập**: Chỉ buyer hoặc seller mới có thể truy cập conversation
3. **Tự động đánh dấu đã đọc**: Khi lấy chi tiết conversation, tin nhắn không phải của mình sẽ được tự động đánh dấu là đã đọc
4. **Unique Constraint**: Mỗi cặp (buyer, seller, product) chỉ có thể có 1 conversation
5. **Tin nhắn mới nhất**: API danh sách conversation sẽ trả về tin nhắn mới nhất của mỗi conversation để hiển thị preview

---

## Frontend Integration

### React Hook Example

```javascript
// Tạo conversation
const startChat = async (sellerId, productId) => {
  const response = await fetch('http://localhost:5000/api/messaging/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      sellerId,
      productId
    })
  });
  return response.json();
};

// Gửi tin nhắn
const sendMessage = async (conversationId, content) => {
  const response = await fetch('http://localhost:5000/api/messaging/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      conversationId,
      content
    })
  });
  return response.json();
};

// Lấy danh sách conversation
const getConversations = async (role) => {
  const url = role 
    ? `http://localhost:5000/api/messaging/conversations?role=${role}`
    : 'http://localhost:5000/api/messaging/conversations';
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Lấy chi tiết conversation
const getConversationDetail = async (conversationId) => {
  const response = await fetch(
    `http://localhost:5000/api/messaging/conversations/${conversationId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
};
```

---

## Cải Tiến Tương Lai

- [ ] WebSocket để tin nhắn real-time
- [ ] Xóa messages
- [ ] Edit messages
- [ ] Typing indicator
- [ ] File upload
- [ ] Emoji reactions
- [ ] Message search
- [ ] Auto-reply patterns
