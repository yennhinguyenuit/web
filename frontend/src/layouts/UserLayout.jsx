import Header from "../components/Header"
import Footer from "../components/Footer"

function UserLayout({ children }) {
  return (
    <>
      <Header />

      <main style={{ minHeight: "80vh" }}>
        {children}
      </main>

      <Footer />
    </>
  )
}

export default UserLayout