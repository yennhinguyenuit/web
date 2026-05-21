import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { chatbotAPI } from "../services/api";

const starterMessages = [
  {
    text: "Xin chào, mình là trợ lý Luxe Store. Bạn cần gợi ý size, phối đồ hay kiểm tra sản phẩm nào?",
    sender: "bot",
  },
];

const quickPrompts = [
  "Gợi ý áo đi chơi cuối tuần",
  "Tư vấn size quần jean",
  "Có flash sale nào không?",
];

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (value = input) => {
    const text = value.trim();
    if (!text || loading) return;

    const history = messages.map((message) => ({
      role: message.sender === "user" ? "user" : "model",
      text: message.text,
    }));

    setMessages((current) => [...current, { text, sender: "user" }]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatbotAPI.sendMessage(text, history);
      const data = response?.data || {};
      setMessages((current) => [
        ...current,
        {
          text: data.reply || "Mình chưa có câu trả lời phù hợp. Bạn mô tả rõ hơn giúp mình nhé.",
          sender: "bot",
          recommendations: data.recommendations || [],
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          text: error?.message || "Chưa kết nối được chatbot. Bạn thử lại sau nhé.",
          sender: "bot",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-zinc-950 text-white shadow-2xl ring-4 ring-white transition hover:-translate-y-0.5 hover:bg-zinc-800"
          aria-label="Mở chatbot"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
            <path d="M8 9h8M8 13h5" />
          </svg>
        </button>
      )}

      {open && (
        <section className="fixed bottom-5 right-5 z-50 flex h-[min(640px,calc(100vh-40px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-zinc-950 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-black">Trợ lý Luxe Store</p>
              <p className="text-xs text-zinc-300">Tư vấn sản phẩm, size và phối đồ</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full text-zinc-200 transition hover:bg-white/10 hover:text-white"
              aria-label="Đóng chatbot"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-zinc-50 p-4">
            {messages.map((message, index) => (
              <div key={`${message.sender}-${index}`} className={message.sender === "user" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.sender === "user"
                      ? "rounded-br-sm bg-zinc-950 text-white"
                      : message.error
                        ? "rounded-bl-sm border border-red-200 bg-red-50 text-red-700"
                        : "rounded-bl-sm border border-zinc-200 bg-white text-zinc-800"
                  }`}
                >
                  {message.text}
                </div>

                {message.recommendations?.length > 0 && (
                  <div className="mt-2 grid gap-2 text-left">
                    {message.recommendations.slice(0, 2).map((product) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.id}`}
                        className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-2 text-sm transition hover:border-zinc-400"
                      >
                        <img src={product.image} alt={product.name} className="h-14 w-14 rounded-md object-cover" />
                        <div>
                          <p className="line-clamp-1 font-bold text-zinc-950">{product.name}</p>
                          <p className="text-zinc-600">{Number(product.price || 0).toLocaleString("vi-VN")}đ</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="inline-flex rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500">
                Đang soạn câu trả lời...
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-zinc-200 bg-white p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="shrink-0 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="min-w-0 flex-1 rounded-full border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-4 focus:ring-zinc-200 disabled:bg-zinc-100"
                placeholder="Nhập tin nhắn..."
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="grid h-12 w-12 place-items-center rounded-full bg-zinc-950 text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                aria-label="Gửi tin nhắn"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}

export default ChatBot;
