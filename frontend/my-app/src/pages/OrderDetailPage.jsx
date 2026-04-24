import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message);
          return;
        }

        setOrder(data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Bạn chắc chắn muốn hủy đơn?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert('Đã hủy đơn');
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  if (!order) return <p className="p-10">Đang tải...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">

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
      {/* 🛍️ SẢN PHẨM (ĐÃ FIX FULL UI) */}
      <div className="bg-white p-4 rounded shadow">
        <p className="font-semibold mb-3">Sản phẩm</p>

        {order.items?.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b py-3"
          >

            {/* LEFT */}
            <div className="flex items-center gap-3">

              {/* ẢNH */}
              <img
                src={item.product?.image || '/no-image.png'}
                alt={item.product?.name}
                className="w-16 h-16 object-cover rounded"
              />

              {/* INFO */}
              <div>
                <p className="font-medium">
                  {item.product?.name || 'Sản phẩm'}
                </p>

                <p className="text-sm text-gray-500">
                  Số lượng: {item.quantity}
                </p>
              </div>
            </div>

            {/* GIÁ */}
            <div className="text-right">
             {item.price ? (
                <p className="font-medium">
                  {Number(item.price).toLocaleString()}đ
                </p>
              ) : null}
            </div>

          </div>
        ))}

        {/* TOTAL */}
        <div className="flex justify-between mt-4 font-bold">
          <span>Thành tiền:</span>
          <span>{Number(order.total).toLocaleString()}đ</span>
        </div>
      </div>

      {/* 🔘 BUTTON */}
      <div className="flex gap-3">
        {order.status === 'pending' && (
          <button
            onClick={handleCancel}
            className="px-4 py-2 border rounded text-red-600"
          >
            Hủy đơn hàng
          </button>
        )}

        <button className="px-4 py-2 border rounded">
          Liên hệ Shop
        </button>
      </div>
    </div>
  );
}