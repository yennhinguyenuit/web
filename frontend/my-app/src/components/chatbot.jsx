import { useState } from "react"
import { chatbotAPI } from "../services/api"

const initialMessages = [
  { text: "Xin chao! Toi co the giup gi cho ban?", sender: "bot" },
]

function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const history = messages.slice(1)
    setMessages(prev => [...prev, { text, sender: "user" }])
    setInput("")
    setLoading(true)

    try {
      const response = await chatbotAPI.sendMessage(text, history)
      const reply = response?.data?.reply || "Xin loi, toi chua co cau tra loi."

      setMessages(prev => [
        ...prev,
        { text: reply, sender: "bot" },
      ])
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          text: error?.message || "Khong the ket noi chatbot. Vui long thu lai.",
          sender: "bot",
          error: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    handleSend()
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 bg-red-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-red-700"
          aria-label="Open chat"
        >
          Chat
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 w-80 h-[420px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
          <div className="bg-red-600 text-white px-4 py-2 flex justify-between items-center">
            <span className="font-semibold">Chat</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              x
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                  m.sender === "user"
                    ? "bg-red-500 text-white ml-auto"
                    : m.error
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-200 text-black"
                }`}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="max-w-[75%] px-3 py-2 rounded-lg text-sm bg-gray-200 text-black">
                Dang tra loi...
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex border-t">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 outline-none disabled:bg-gray-100"
              placeholder="Nhap tin nhan..."
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-red-600 text-white px-4 hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default ChatBot
