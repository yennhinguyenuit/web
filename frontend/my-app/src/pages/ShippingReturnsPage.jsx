import InfoPage from '../components/InfoPage';

export default function ShippingReturnsPage() {
  return (
    <InfoPage
      eyebrow="Chính sách"
      title="Vận chuyển & đổi trả"
      description="Quy trình giao hàng rõ ràng, cập nhật theo trạng thái đơn và hỗ trợ đổi trả khi sản phẩm đáp ứng điều kiện."
      sections={[
        {
          kicker: 'Vận chuyển',
          title: 'Giao hàng toàn quốc',
          body: 'Sau khi đơn được xác nhận, shop sẽ đóng gói và bàn giao cho đơn vị vận chuyển. Mã vận đơn được cập nhật trong trang chi tiết đơn hàng.',
          items: ['Nội thành: thường nhanh hơn', 'Liên tỉnh: tùy tuyến vận chuyển', 'Miễn phí từ 500.000đ'],
        },
        {
          kicker: 'Theo dõi',
          title: 'Cập nhật trạng thái đơn',
          body: 'Bạn có thể theo dõi đơn từ mục Đơn hàng. Mỗi đơn có timeline riêng cho chờ xử lý, xác nhận, đang giao và hoàn thành.',
        },
        {
          kicker: 'Đổi trả',
          title: 'Điều kiện hỗ trợ',
          body: 'Sản phẩm cần còn tem, chưa giặt, chưa sử dụng và không có dấu hiệu hư hại do người dùng. Vui lòng giữ hóa đơn hoặc mã đơn để đối chiếu.',
          items: ['Đổi size', 'Đổi mẫu tương đương', 'Hỗ trợ lỗi sản xuất'],
        },
        {
          kicker: 'Lưu ý',
          title: 'Thời gian xử lý',
          body: 'Yêu cầu đổi trả sẽ được kiểm tra trước khi xác nhận. Shop sẽ hướng dẫn đóng gói và gửi lại theo từng trường hợp cụ thể.',
        },
      ]}
      cta={{ title: 'Có vấn đề với đơn hàng?', body: 'Gửi mã đơn và hình ảnh sản phẩm để shop kiểm tra nhanh hơn.', href: '/contact', label: 'Gửi yêu cầu hỗ trợ' }}
    />
  );
}
