export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-3">Liên hệ</h1>
        <p className="text-gray-600">
          Chúng tôi luôn sẵn sàng hỗ trợ bạn về đơn hàng, đổi trả, size số và tình trạng sản phẩm.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6 space-y-3">
          <h2 className="text-xl font-semibold">Thông tin cửa hàng</h2>
          <p>Email: support@luxestore.vn</p>
          <p>Hotline: 1900 1234</p>
          <p>Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-3">
          <h2 className="text-xl font-semibold">Cách liên hệ nhanh</h2>
          <a href="mailto:support@luxestore.vn" className="block text-red-600 font-medium">Gửi email</a>
          <a href="tel:19001234" className="block text-red-600 font-medium">Gọi hotline</a>
          <p className="text-sm text-gray-500">Thời gian hỗ trợ: 8:00 - 22:00 hằng ngày.</p>
        </div>
      </div>
    </div>
  );
}
