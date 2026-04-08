import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatBot from '../components/chatbot';

function UserLayout({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-[80vh]">{children || <Outlet />}</main>
      <Footer />
      <ChatBot />
    </>
  );
}

export default UserLayout;
