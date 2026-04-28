import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import OrderTimeline from '../components/OrderTimeline'; 
import { orderAPI } from '../services/api';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getOrderById(id);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        alert(err?.message || 'Lỗi server');
      }
    };

    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Bạn chắc chắn muốn hủy đơn?')) return;

    try {
      await orderAPI.updateOrderStatus(id, { status: 'cancelled' });
      alert('Đã hủy đơn');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Lỗi server');
    }
  };

  if (!order) return <p className="p-10">Đang tải...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">

      {/* 🔥 TIMELINE (THÊM Ở ĐÂY) */}
      <div className="bg-white p-4 rounded shadow">
        <p className="font-semibold mb-3 text-red-600">
          📦 Trạng thái đơn hàng
        </p>
        <OrderTimeline status={order.status} />
      </div>

      {/* 🚚 VẬN CHUYỂN */}
      <div className="bg-white p-4 rounded shadow">
        <p className="font-semibold mb-2">Thông tin vận chuyển</p>
        <p>Standard Express</p>
      </div>

      {/* 📍 ĐỊA CHỈ */}
      <div className="bg-white p-4 rounded shadow">
        <p className="font-semibold mb-2">Địa chỉ nhận hàng</p>

        <p>{order.address?.name}</p>
        <p>{order.address?.phone}</p>

        <p>
          {[
            order.address?.address,
            order.address?.ward,
            order.address?.district,
            order.address?.city
          ]
            .filter(Boolean)
            .join(', ')
          }
        </p>
      </div>

      {/* 🛍️ SẢN PHẨM */}
      <div className="bg-white p-4 rounded shadow">
        <p className="font-semibold mb-3">Sản phẩm</p>

        {order.items?.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b py-3"
          >

            <div className="flex items-center gap-3">
              <img
                src={item.product?.image || '/no-image.png'}
                alt={item.product?.name}
                className="w-16 h-16 object-cover rounded"
              />

              <div>
                <p className="font-medium">
                  {item.product?.name || 'Sản phẩm'}
                </p>

                <p className="text-sm text-gray-500">
                  Số lượng: {item.quantity}
                </p>
              </div>
            </div>

            <div className="text-right">
              {item.price && (
                <p className="font-medium">
                  {Number(item.price).toLocaleString()}đ
                </p>
              )}
            </div>

          </div>
        ))}

        <div className="flex justify-between mt-4 font-bold text-red-600">
          <span>Thành tiền:</span>
          <span>{Number(order.total).toLocaleString()}đ</span>
        </div>
      </div>

      {/* 🔘 BUTTON */}
      <div className="flex gap-3">
        {order.status === 'pending' && (
          <button
            onClick={handleCancel}
            className="px-4 py-2 border rounded text-red-600 hover:bg-red-50"
          >
            Hủy đơn hàng
          </button>
        )}

        <button className="px-4 py-2 border rounded hover:bg-gray-100">
          Liên hệ Shop
        </button>
      </div>

    </div>
  );
}