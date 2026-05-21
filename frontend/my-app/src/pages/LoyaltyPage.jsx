import InfoPage from '../components/InfoPage';

export default function LoyaltyPage() {
  return (
    <InfoPage
      eyebrow="Membership"
      title="Khách hàng thân thiết"
      description="Chương trình dành cho khách mua sắm thường xuyên, giúp bạn nhận ưu đãi, quà sinh nhật và hỗ trợ cá nhân hóa tốt hơn."
      sections={[
        {
          kicker: 'Tích lũy',
          title: 'Ghi nhận lịch sử mua hàng',
          body: 'Mỗi đơn hàng hoàn thành giúp shop hiểu hơn về size, phong cách và nhu cầu của bạn để tư vấn chính xác hơn.',
          items: ['Lịch sử đơn rõ ràng', 'Gợi ý size tốt hơn', 'Ưu đãi theo hạng'],
        },
        {
          kicker: 'Quyền lợi',
          title: 'Ưu đãi định kỳ',
          body: 'Thành viên có thể nhận mã giảm giá, quyền mua trước một số bộ sưu tập hoặc ưu tiên xử lý hỗ trợ.',
        },
        {
          kicker: 'Sinh nhật',
          title: 'Quà tặng cá nhân',
          body: 'Luxe Store có thể gửi mã ưu đãi hoặc quà nhỏ trong tháng sinh nhật tùy chương trình đang áp dụng.',
        },
        {
          kicker: 'Cập nhật',
          title: 'Theo dõi trong tài khoản',
          body: 'Các quyền lợi sẽ được thông báo qua tài khoản, email hoặc kênh liên hệ bạn đã cung cấp.',
        },
      ]}
      cta={{ title: 'Bắt đầu tích lũy ngay', body: 'Đăng nhập tài khoản và hoàn tất đơn hàng để shop ghi nhận quyền lợi của bạn.', href: '/shop', label: 'Mua sắm' }}
    />
  );
}
