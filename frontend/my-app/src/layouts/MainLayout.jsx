import Header from "../components/Header"
import Footer from "../components/Footer"
import ChatBot from "../components/chatbot"

function MainLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <ChatBot />
    </>
  )
}

export default MainLayout