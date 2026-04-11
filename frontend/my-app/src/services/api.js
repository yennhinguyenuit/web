const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// 🔥 CACHE KEY
const getCacheKey = (endpoint) => `cache_${endpoint}`;

// 🔥 MAIN REQUEST (FIX FULL)
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    ...options.headers,
  };

  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (hasBody && !isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const payload = isJson
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        payload?.message || payload || 'Something went wrong';
      throw new APIError(message, response.status, payload);
    }

    // 🔥 SAVE CACHE (GET ONLY)
    if (options.method === 'GET' || !options.method) {
      localStorage.setItem(getCacheKey(endpoint), JSON.stringify(payload));
    }

    return payload;
  } catch (error) {
    console.warn('⚠️ API lỗi hoặc offline:', endpoint);

    // 🔥 OFFLINE MODE
    if (!navigator.onLine) {
      const cache = localStorage.getItem(getCacheKey(endpoint));

      if (cache) {
        console.log('📦 Load từ cache:', endpoint);
        return JSON.parse(cache);
      }

      return {
        offline: true,
        data: null,
      };
    }

    throw error;
  }
};

// 🔥 API BASE
export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: (endpoint, body) =>
    request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  put: (endpoint, body) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

// 🔥 AUTH
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  register: (userData) =>
    api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// 🔥 PRODUCTS
export const productAPI = {
  getProducts: (params = {}) => {
    const queryParams = new URLSearchParams(
      Object.entries(params).filter(
        ([, value]) =>
          value !== undefined && value !== null && value !== ''
      )
    ).toString();

    return api.get(`/products${queryParams ? `?${queryParams}` : ''}`);
  },

  getProductById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/categories'),
};

// 🔥 CART
export const cartAPI = {
  getCart: () => api.get('/cart'),

  addToCart: (productId, quantity, options = {}) =>
    api.post('/cart/items', {
      productId,
      quantity,
      ...options,
    }),

  updateQuantity: (itemId, quantity) =>
    api.patch(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId) =>
    api.delete(`/cart/items/${itemId}`),

  clearCart: () => api.delete('/cart'),
};

// 🔥 ACCOUNT
export const accountAPI = {
  getProfile: () => api.get('/account/profile'),
  updateProfile: (payload) =>
    api.patch('/account/profile', payload),
  getAddresses: () => api.get('/account/addresses'),
  createAddress: (address) =>
    api.post('/account/addresses', address),
  updateAddress: (id, address) =>
    api.patch(`/account/addresses/${id}`, address),
  deleteAddress: (id) =>
    api.delete(`/account/addresses/${id}`),
};

export const addressAPI = accountAPI;

// 🔥 ORDER
export const orderAPI = {
  createOrder: (orderData) =>
    api.post('/orders', orderData),
  getOrders: () => api.get('/orders'),
  getOrderById: (id) =>
    api.get(`/orders/${id}`),
};

// 🔥 PAYMENT
export const paymentAPI = {
  getPaymentStatus: (orderId) =>
    api.get(`/payments/orders/${orderId}/status`),
  createPaymentIntent: (orderId) =>
    api.post(`/payments/orders/${orderId}/intent`, {}),
};

// 🔥 CHECKOUT
export const checkoutAPI = {
  getShippingMethods: () =>
    api.get('/shipping-methods'),
  getPaymentMethods: () =>
    api.get('/payment-methods'),
  validateCoupon: (code, subtotal) =>
    api.post('/coupons/validate', { code, subtotal }),
};

// 🔥 WISHLIST
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  addItem: (productId) =>
    api.post('/wishlist', { productId }),
  removeItem: (productId) =>
    api.delete(`/wishlist/${productId}`),
};

// 🔥 REVIEW
export const reviewAPI = {
  getProductReviews: (productId) =>
    api.get(`/reviews/product/${productId}`),
  createReview: (productId, payload) =>
    api.post(`/reviews/product/${productId}`, payload),
  updateReview: (reviewId, payload) =>
    api.patch(`/reviews/${reviewId}`, payload),
  deleteReview: (reviewId) =>
    api.delete(`/reviews/${reviewId}`),
};

// 🔥 ADMIN
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getProducts: () => api.get('/admin/products'),
  createProduct: (payload) =>
    api.post('/admin/products', payload),
  updateProduct: (id, payload) =>
    api.patch(`/admin/products/${id}`, payload),
  toggleProductVisibility: (id, isActive) =>
    api.patch(`/admin/products/${id}/visibility`, { isActive }),
  deleteProduct: (id) =>
    api.delete(`/admin/products/${id}`),
  getOrders: () => api.get('/admin/orders'),
  getCustomers: () => api.get('/admin/customers'),
  updateOrderStatus: (id, payload) =>
    api.patch(`/admin/orders/${id}/status`, payload),
};

export { APIError, API_BASE_URL };
export default api;