#!/usr/bin/env node
/**
 * Test Chatbot API
 * Chạy: node backend/test-chatbot.js [message]
 * Ví dụ:
 *   - node backend/test-chatbot.js "Đơn hàng của tôi ở đâu?"
 *   - node backend/test-chatbot.js "Liên hệ người bán như nào?"
 *   - node backend/test-chatbot.js "Có sản phẩm gì sale không?"
 */

const http = require("http");

const BACKEND_URL = "http://localhost:5000";
const message = process.argv[2] || "Xin chào! Tôi có thể giúp gì cho bạn?";

console.log("\n🤖 Testing Chatbot API (No Auth)\n");
console.log(`📝 Message: ${message}\n`);

// Test 1: Gọi chatbot không có auth (guest)
const testGuest = () => {
  const postData = JSON.stringify({
    message: message,
    history: [],
  });

  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/chatbot",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  const req = http.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const response = JSON.parse(data);
        console.log("✅ Response (Guest):\n");
        console.log(JSON.stringify(response.data, null, 2));
        console.log("\n" + "=".repeat(80) + "\n");

        // Sau đó test với auth
        setTimeout(() => {
          console.log("⏳ (Chờ 2 giây trước test với auth...)\n");
        }, 1000);
      } catch (error) {
        console.error("❌ Error parsing response:", error.message);
        console.log("Raw response:", data);
      }
    });
  });

  req.on("error", (error) => {
    console.error("❌ Request error:", error.message);
  });

  req.write(postData);
  req.end();
};

testGuest();

console.log("💡 Tips:\n");
console.log("1️⃣  Hỏi về tình trạng đơn hàng:");
console.log("   node backend/test-chatbot.js 'Đơn hàng của tôi đã được giao chưa?'\n");

console.log("2️⃣  Hỏi về liên lạc seller:");
console.log("   node backend/test-chatbot.js 'Làm sao liên hệ được người bán?'\n");

console.log("3️⃣  Hỏi về sản phẩm:");
console.log("   node backend/test-chatbot.js 'Có sản phẩm nào mới không?'\n");

console.log("4️⃣  Hỏi tư vấn:");
console.log("   node backend/test-chatbot.js 'Bạn có sản phẩm nào để làm quà tặng không?'\n");
