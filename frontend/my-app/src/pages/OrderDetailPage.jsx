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

  const paymentCode = useMemo(() => (
    String(order?.paymentMethod?.code || '').toLowerCase()
  ), [order?.paymentMethod?.code]);

  const isPayOS = paymentCode === 'payos';
  const isBankTransfer = paymentCode === 'bank_transfer';
  const isOnlinePayment = order?.paymentMethod?.isOnline;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getOrderById(id);
        setOrder(res.data);
        setPayment(res?.data?.payment || null);
      } catch (err) {
        console.error(err);
        alert(err?.message || 'Lỗi server');
      }
    };

    fetchOrder();
  }, [id]);

  // Handle payment for both PayOS and Bank Transfer
  useEffect(() => {
    if (!order) return;
    if (!isOnlinePayment) return;
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
        if (!ignore) setPaymentLoading(false);
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
  }, [order?.id, isOnlinePayment, order?.paymentStatus]);

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

      {/* 🔥 TIMELINE */}
      <div className="bg-white p-4 rounded shadow">
        <p className="font-semibold mb-3 text-red-600">
          📦 Trạng thái đơn hàng
        </p>
        <OrderTimeline status={order.status} />
      </div>

      {/* 💳 PAYMENT SECTION - Online Payment */}
      {isOnlinePayment && (
        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold mb-3 text-red-600">💳 Thanh toán {order.paymentMethod?.name}</p>

          {order.paymentStatus === 'paid' ? (
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="text-green-700 font-medium">✅ Đơn hàng đã được thanh toán.</p>
            </div>
          ) : paymentLoading ? (
            <p className="text-sm text-gray-500">⏳ Đang tạo liên kết thanh toán...</p>
          ) : payment ? (
            <div className="space-y-3">
              {/* BANK TRANSFER */}
              {isBankTransfer && payment?.qr ? (
                <>
                  <p className="text-sm text-gray-600">
                    📱 Quét mã QR bằng ứng dụng ngân hàng để thanh toán. Trang này sẽ tự cập nhật trạng thái trong vài giây.
                  </p>

                  {payment.qr?.imageUrl && (
                    <div className="flex flex-col items-center">
                      <img
                        alt="Bank Transfer QR"
                        className="w-64 h-64 border-2 border-red-200 rounded-lg"
                        src={payment.qr.imageUrl}
                      />
                      {payment.qr?.expiresAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          HSD: {new Date(payment.qr.expiresAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm">
                    <p className="font-semibold text-blue-900">Thông tin chuyển khoản:</p>
                    {payment.bankAccount?.accountName && (
                      <p>👤 <strong>Tên tài khoản:</strong> {payment.bankAccount.accountName}</p>
                    )}
                    {payment.bankAccount?.accountNo && (
                      <p>🏦 <strong>Số tài khoản:</strong> {payment.bankAccount.accountNo}</p>
                    )}
                    {payment.bankAccount?.transferContent && (
                      <p>📝 <strong>Nội dung:</strong> {payment.bankAccount.transferContent}</p>
                    )}
                    <p>💰 <strong>Số tiền:</strong> {Number(payment.amount).toLocaleString()}đ</p>
                  </div>

                  <button
                    onClick={() => paymentAPI.getPaymentStatus(order.id).then((r) => {
                      setPayment(r?.data?.payment || null);
                      const nextStatus = r?.data?.paymentStatus;
                      if (nextStatus) setOrder((prev) => (prev ? { ...prev, paymentStatus: nextStatus } : prev));
                    }).catch(() => alert('Lỗi kiểm tra trạng thái'))}
                    className="w-full border border-gray-300 px-4 py-2 rounded text-center hover:bg-gray-50"
                  >
                    🔄 Kiểm tra trạng thái
                  </button>
                </>
              ) : isPayOS && payment?.checkout?.url ? (
                <>
                  <p className="text-sm text-gray-600">
                    🌐 Mở trang PayOS để quét QR / thanh toán. Sau khi thanh toán xong, trang này sẽ tự cập nhật trạng thái.
                  </p>

                  {(() => {
                    const checkoutUrl = payment?.checkout?.url || '';
                    const qrCode = payment?.checkout?.qrCode || '';

                    const qrData = qrCode || checkoutUrl;
                    if (!qrData) return null;

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
                          className="w-56 h-56 border-2 border-red-200 rounded-lg"
                          src={imgSrc}
                        />
                      </div>
                    );
                  })()}

                  <a
                    href={payment.checkout.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block w-full text-center bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700"
                  >
                    🔗 Mở trang thanh toán PayOS
                  </a>

                  <button
                    onClick={() => paymentAPI.getPaymentStatus(order.id).then((r) => {
                      setPayment(r?.data?.payment || null);
                      const nextStatus = r?.data?.paymentStatus;
                      if (nextStatus) setOrder((prev) => (prev ? { ...prev, paymentStatus: nextStatus } : prev));
                    }).catch(() => alert('Lỗi kiểm tra trạng thái'))}
                    className="w-full border border-gray-300 px-4 py-2 rounded text-center hover:bg-gray-50"
                  >
                    🔄 Kiểm tra trạng thái
                  </button>
                </>
              ) : (
                <p className="text-sm text-red-600">
                  ⚠️ Không tạo được mã thanh toán. Hãy kiểm tra cấu hình hệ thống và thử lại.
                </p>
              )}
            </div>
          ) : null}
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
