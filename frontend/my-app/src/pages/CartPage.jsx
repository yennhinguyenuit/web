import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeItem, updateQuantity, clearCart } = useCart();

  const items = cart?.items || [];
  const totalQuantity = cart?.totalQuantity || 0;

  const total = items.reduce((t, i) => {
    const price = i.price || 100000;
    return t + (price * i.quantity);
  }, 0);

  const handleRemoveItem = (productId) => {
    removeItem(productId);
  };

  const handleUpdateQty = (productId, qty) => {
    if (qty < 1) return;
    updateQuantity(productId, qty);
  };

  const handleClearCart = () => {
    clearCart();
  };

  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-[80vh]">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Giỏ hàng</h1>
            <p className="text-gray-600 mt-1">
              {totalQuantity} sản phẩm
            </p>
          </div>

          <div className="flex gap-3">
            <Link to="/shop" className="px-4 py-2 border rounded hover:bg-white">
              Tiếp tục mua sắm
            </Link>

            {items.length > 0 && (
              <button
                onClick={handleClearCart}
                className="px-4 py-2 border rounded hover:bg-white"
              >
                Xóa giỏ hàng
              </button>
            )}
          </div>
        </div>

        {/* EMPTY */}
        {items.length === 0 ? (
          <div className="bg-white p-10 rounded shadow text-center space-y-3">
            <p className="text-lg font-medium">Giỏ hàng đang trống</p>
            <p className="text-gray-500">Thêm sản phẩm để bắt đầu mua hàng.</p>
            <Link to="/shop" className="inline-block bg-red-600 text-white px-6 py-3 rounded">
              Đi mua sắm
            </Link>
          </div>
        ) : (

          <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-6">

            {/* LIST */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="bg-white p-4 rounded shadow">

                  <div className="flex gap-4 items-start">

                    {/* IMAGE */}
                    <img
                      src={item.image || 'https://via.placeholder.com/100'}
                      className="w-24 h-24 object-cover rounded"
                    />

                    <div className="flex-1">
                      <p className="font-semibold">
                        {item.name || `Product ${item.productId}`}
                      </p>

                      <p className="text-red-600">
                        {Number(item.price || 100000).toLocaleString()}đ
                      </p>

                      <p className="text-sm text-gray-500">
                        Tạm tính: {(item.quantity * (item.price || 100000)).toLocaleString()}đ
                      </p>

                      {/* QTY */}
                      <div className="flex items-center gap-3 my-2">
                        <button
                          onClick={() => handleUpdateQty(item.productId, item.quantity - 1)}
                          className="px-3 bg-gray-200 rounded"
                        >-</button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() => handleUpdateQty(item.productId, item.quantity + 1)}
                          className="px-3 bg-gray-200 rounded"
                        >+</button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-red-500"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SUMMARY */}
            <aside className="bg-white p-6 rounded shadow space-y-4">
              <h2 className="text-xl font-bold">Tóm tắt đơn hàng</h2>

              <div className="flex justify-between">
                <span>Số lượng</span>
                <span>{totalQuantity}</span>
              </div>

              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{total.toLocaleString()}đ</span>
              </div>

              <div className="pt-3 border-t flex justify-between font-bold text-lg">
                <span>Thành tiền</span>
                <span>{total.toLocaleString()}đ</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-red-600 text-white py-3 rounded"
              >
                Thanh toán
              </button>
            </aside>

          </div>
        )}
      </div>
    </div>
  );
}