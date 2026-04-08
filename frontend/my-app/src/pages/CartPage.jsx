import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading, fetchCart, removeItem, updateQuantity, clearCart } = useCart();

  useEffect(() => {
    if (!user) {
      return;
    }

    fetchCart();
  }, [user]);

  if (!user) {
    return (
      <div className="p-10 bg-gray-100 min-h-[80vh]">
        <div className="bg-white p-6 rounded shadow text-center space-y-3 max-w-xl mx-auto">
          <h1 className="text-2xl font-bold">Giỏ hàng của bạn</h1>
          <p>Vui lòng đăng nhập để thêm sản phẩm vào giỏ và tiến hành mua hàng.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link className="text-red-600 font-medium" to="/login">Đi đến trang đăng nhập</Link>
            <Link className="font-medium" to="/shop">Tiếp tục mua sắm</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !cart) {
    return <div className="p-10 text-center">Đang tải giỏ hàng...</div>;
  }

  const items = cart?.items || [];
  const total = cart?.totalAmount || 0;
  const totalQuantity = cart?.totalQuantity || 0;

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      alert(error.message || 'Không thể xóa sản phẩm');
    }
  };

  const handleUpdateQty = async (itemId, qty) => {
    if (qty < 1) return;

    try {
      await updateQuantity(itemId, qty);
    } catch (error) {
      alert(error.message || 'Không thể cập nhật số lượng');
    }
  };

  const handleClearCart = async () => {
    if (!items.length) return;

    try {
      await clearCart();
      alert('Đã xóa toàn bộ giỏ hàng');
    } catch (error) {
      alert(error.message || 'Không thể xóa giỏ hàng');
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-[80vh]">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Giỏ hàng</h1>
            <p className="text-gray-600 mt-1">{totalQuantity} sản phẩm đang chờ thanh toán</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/shop" className="px-4 py-2 border rounded hover:bg-white">Tiếp tục mua sắm</Link>
            {items.length ? (
              <button onClick={handleClearCart} className="px-4 py-2 border rounded hover:bg-white">Xóa giỏ hàng</button>
            ) : null}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white p-10 rounded shadow text-center space-y-3">
            <p className="text-lg font-medium">Giỏ hàng đang trống</p>
            <p className="text-gray-500">Thêm vài món vào giỏ để bắt đầu mua hàng.</p>
            <Link to="/shop" className="inline-block bg-red-600 text-white px-6 py-3 rounded">Đi mua sắm</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-6">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded shadow">
                  <div className="flex gap-4 items-start">
                    {item.thumbnail ? <img src={item.thumbnail} alt={item.name} className="w-24 h-24 object-cover rounded" /> : null}

                    <div className="flex-1">
                      <Link to={`/products/${item.productId}`} className="font-semibold hover:text-red-600">{item.name}</Link>
                      <p className="text-red-600">{Number(item.price).toLocaleString()}đ</p>
                      <p className="text-sm text-gray-500">Tạm tính: {Number(item.subTotal).toLocaleString()}đ</p>
                      {item.color ? <p className="text-sm text-gray-500">Màu: {item.color}</p> : null}
                      {item.size ? <p className="text-sm text-gray-500">Size: {item.size}</p> : null}
                      {!item.isActive ? <p className="text-sm text-red-600">Sản phẩm này hiện không còn khả dụng.</p> : null}

                      <div className="flex items-center gap-3 my-2">
                        <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)} className="px-3 bg-gray-200 rounded">-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)} className="px-3 bg-gray-200 rounded">+</button>
                      </div>

                      <button onClick={() => handleRemoveItem(item.id)} className="text-red-500">Xóa</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-white p-6 rounded shadow h-fit space-y-4">
              <h2 className="text-xl font-bold">Tóm tắt đơn hàng</h2>
              <div className="flex justify-between text-sm">
                <span>Tổng số lượng</span>
                <span>{totalQuantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tạm tính</span>
                <span>{Number(total).toLocaleString()}đ</span>
              </div>
              <p className="text-sm text-gray-500">Phí vận chuyển và mã giảm giá sẽ được tính ở bước thanh toán.</p>
              <div className="pt-3 border-t flex justify-between font-bold text-lg">
                <span>Thành tiền</span>
                <span>{Number(total).toLocaleString()}đ</span>
              </div>
              <button onClick={() => navigate('/checkout')} className="w-full bg-red-600 text-white px-6 py-3 rounded">
                Tiến hành mua hàng
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
