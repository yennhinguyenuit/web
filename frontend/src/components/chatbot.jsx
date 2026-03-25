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
    <div>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            padding: 10,
            borderRadius: "50%"
          }}
        >
          💬
        </button>
      )}

      {open && (
        <div style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 300,
          height: 400,
          background: "white",
          border: "1px solid #ccc",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ padding: 10, background: "black", color: "white" }}>
            Chat
            <button onClick={() => setOpen(false)} style={{ float: "right" }}>X</button>
          </div>

          <div style={{ flex: 1, padding: 10, overflowY: "auto" }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                textAlign: m.sender === "user" ? "right" : "left"
              }}>
                {m.text}
              </div>
            ))}
          </div>

          <div style={{ display: "flex" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatBot