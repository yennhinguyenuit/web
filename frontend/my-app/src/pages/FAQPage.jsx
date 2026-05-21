import InfoPage from '../components/InfoPage';

export default function FAQPage() {
  return (
    <InfoPage
      eyebrow="Hỗ trợ"
      title="Câu hỏi thường gặp"
      description="Những thông tin nhanh về đặt hàng, thanh toán, vận chuyển và đổi trả tại Luxe Store."
      sections={[
        {
          kicker: 'Đặt hàng',
          title: 'Tôi có thể chỉnh đơn sau khi đặt không?',
          body: 'Bạn có thể liên hệ shop khi đơn còn ở trạng thái chờ xử lý. Khi đơn đã đóng gói hoặc bàn giao vận chuyển, shop sẽ hỗ trợ theo tình trạng thực tế.',
          items: ['Kiểm tra đơn trong Tài khoản', 'Liên hệ hotline nếu cần chỉnh gấp'],
        },
        {
          kicker: 'Thanh toán',
          title: 'Thanh toán online bị gián đoạn thì sao?',
          body: 'Bạn có thể mở lại trang thanh toán từ chi tiết đơn hàng. Hệ thống cũng tự kiểm tra trạng thái định kỳ để cập nhật khi giao dịch thành công.',
          items: ['PayOS', 'Chuyển khoản ngân hàng', 'Thanh toán khi nhận hàng'],
        },
        {
          kicker: 'Vận chuyển',
          title: 'Bao lâu thì nhận được hàng?',
          body: 'Thời gian giao hàng tùy khu vực và phương thức vận chuyển được chọn. Chi tiết dự kiến sẽ hiển thị ở trang chi tiết đơn hàng.',
        },
        {
          kicker: 'Đổi trả',
          title: 'Điều kiện đổi trả là gì?',
          body: 'Sản phẩm còn nguyên tem, chưa qua sử dụng và còn trong thời hạn hỗ trợ đổi trả. Shop ưu tiên đổi size hoặc đổi mẫu phù hợp trước.',
        },
      ]}
      cta={{ title: 'Cần hỗ trợ thêm?', body: 'Đội ngũ Luxe Store luôn sẵn sàng kiểm tra đơn hàng, tư vấn size và hỗ trợ thanh toán.', href: '/contact', label: 'Liên hệ shop' }}
    />
  );
}
