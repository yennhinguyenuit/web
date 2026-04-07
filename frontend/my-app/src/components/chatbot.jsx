import { useState } from "react"

function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { text: "Xin chào! Tôi có thể giúp gì?", sender: "bot" }
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input) return

    setMessages([...messages, { text: input, sender: "user" }])
    setInput("")

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { text: "Đây là phản hồi tự động 🤖", sender: "bot" }
      ])
    }, 500)
  }

  return (
    <>
      {/* BUTTON */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700"
        >
          💬
        </button>
      )}

      {/* CHAT BOX */}
      {open && (
        <div className="fixed bottom-5 right-5 w-80 h-[420px] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="bg-red-600 text-white px-4 py-2 flex justify-between items-center">
            <span className="font-semibold">Chat</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                  m.sender === "user"
                    ? "bg-red-500 text-white ml-auto"
                    : "bg-gray-200 text-black"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* INPUT */}
          <div className="flex border-t">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 outline-none"
              placeholder="Nhập tin nhắn..."
            />
            <button
              onClick={handleSend}
              className="bg-red-600 text-white px-4 hover:bg-red-700"
            >
              Send
            </button>
          </div>

        </div>
      )}
    </>
  )
}

export default ChatBot