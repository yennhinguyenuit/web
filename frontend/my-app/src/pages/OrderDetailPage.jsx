import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import OrderTimeline from '../components/OrderTimeline'; 
import { orderAPI } from '../services/api';
import { paymentAPI } from '../services/api';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const isPayOS = useMemo(() => (
    String(order?.paymentMethod?.code || '').toLowerCase() === 'payos'
  ), [order?.paymentMethod?.code]);

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

  useEffect(() => {
    if (!order) return;
    if (!isPayOS) return;
    if (order.paymentStatus === 'paid') return;

    let ignore = false;
    let intervalId = null;

    const loadOrCreateIntent = async () => {
      setPaymentLoading(true);
      try {
        const intentRes = await paymentAPI.createPaymentIntent(order.id);
        if (!ignore) setPayment(intentRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setPaymentLoading(false);
      }
    };

    const pollStatus = async () => {
      try {
        const statusRes = await paymentAPI.getPaymentStatus(order.id);
        if (ignore) return;

        // backend returns { paymentStatus, payment, latestTransaction, ... }
        setPayment(statusRes?.data?.payment || null);

        const nextStatus = statusRes?.data?.paymentStatus;
        if (nextStatus && nextStatus !== order.paymentStatus) {
          setOrder((prev) => (prev ? { ...prev, paymentStatus: nextStatus } : prev));
        }

        if (String(nextStatus).toLowerCase() === 'paid') {
          if (intervalId) clearInterval(intervalId);
        }
      } catch (err) {
        // ignore intermittent errors
      }
    };

    loadOrCreateIntent().then(pollStatus);
    intervalId = setInterval(pollStatus, 5000);

    return () => {
      ignore = true;
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, isPayOS, order?.paymentStatus]);

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

      {/* 💳 PAYMENT (PayOS) */}
      {isPayOS && (
        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold mb-2 text-red-600">💳 Thanh toán PayOS</p>

          {order.paymentStatus === 'paid' ? (
            <p className="text-green-600 font-medium">Đơn hàng đã được thanh toán.</p>
          ) : paymentLoading ? (
            <p className="text-sm text-gray-500">Đang tạo liên kết thanh toán...</p>
          ) : payment?.checkout?.url ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Mở trang PayOS để quét QR / thanh toán. Sau khi thanh toán xong, trang này sẽ tự cập nhật trạng thái.
              </p>

              {(() => {
                const checkoutUrl = payment?.checkout?.url || '';
                const qrCode = payment?.checkout?.qrCode || '';

                // Prefer generating QR from checkoutUrl (most reliable for PayOS hosted page).
                const qrData = checkoutUrl || qrCode;
                if (!qrData) return null;

                // If PayOS returns an image URL or data URL, render directly.
                const qrLooksLikeImageUrl =
                  typeof qrCode === 'string' &&
                  (qrCode.startsWith('http://') ||
                    qrCode.startsWith('https://') ||
                    qrCode.startsWith('data:image/'));

                const imgSrc = qrLooksLikeImageUrl
                  ? qrCode
                  : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                      String(qrData)
                    )}`;

                return (
                  <div className="flex justify-center">
                    <img
                      alt="PayOS QR"
                      className="w-56 h-56 border rounded"
                      src={imgSrc}
                    />
                  </div>
                );
              })()}

              <a
                href={payment.checkout.url}
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-red-600 text-white px-4 py-2 rounded font-semibold"
              >
                Mở trang thanh toán PayOS
              </a>

              <button
                onClick={() => paymentAPI.getPaymentStatus(order.id).then((r) => {
                  setPayment(r?.data?.payment || null);
                  const nextStatus = r?.data?.paymentStatus;
                  if (nextStatus) setOrder((prev) => (prev ? { ...prev, paymentStatus: nextStatus } : prev));
                }).catch(() => {})}
                className="ml-3 inline-block border px-4 py-2 rounded"
              >
                Kiểm tra trạng thái
              </button>
            </div>
          ) : (
            <p className="text-sm text-red-600">
              Không tạo được QR/Link PayOS. Hãy kiểm tra cấu hình PayOS (env) và thử lại.
            </p>
          )}
        </div>
      )}

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