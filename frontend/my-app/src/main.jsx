import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';

import { registerSW } from 'virtual:pwa-register';

// 🔥 đăng ký Service Worker (có log để debug)
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('🔄 Có phiên bản mới, cần refresh');
  },
  onOfflineReady() {
    console.log('✅ App đã sẵn sàng offline');
  },
});

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);