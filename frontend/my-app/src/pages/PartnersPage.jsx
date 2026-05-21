import InfoPage from '../components/InfoPage';

export default function PartnersPage() {
  return (
    <InfoPage
      eyebrow="Hợp tác"
      title="Đối tác"
      description="Luxe Store mở rộng hợp tác với nhà cung cấp, stylist, creator và đơn vị vận hành phù hợp với định hướng thời trang tối giản."
      sections={[
        {
          kicker: 'Nhà cung cấp',
          title: 'Nguồn hàng và sản xuất',
          body: 'Shop ưu tiên đối tác có chất lượng ổn định, thông tin minh bạch và khả năng đáp ứng tiêu chuẩn đóng gói.',
          items: ['Chất liệu rõ nguồn gốc', 'Form dáng ổn định', 'Quy trình kiểm hàng'],
        },
        {
          kicker: 'Creator',
          title: 'Hợp tác nội dung',
          body: 'Các dự án lookbook, styling video hoặc review sản phẩm được triển khai theo tinh thần thực tế, dễ mặc và đúng trải nghiệm.',
        },
        {
          kicker: 'Doanh nghiệp',
          title: 'Đơn hàng nhóm',
          body: 'Luxe Store có thể hỗ trợ quà tặng nhân sự, đồng phục casual hoặc gói mua hàng theo ngân sách.',
        },
        {
          kicker: 'Liên hệ',
          title: 'Gửi đề xuất hợp tác',
          body: 'Vui lòng gửi hồ sơ, danh mục sản phẩm hoặc ý tưởng chiến dịch để shop phản hồi trong thời gian sớm nhất.',
        },
      ]}
      cta={{ title: 'Gửi lời mời hợp tác', body: 'Để lại thông tin liên hệ và nội dung đề xuất, đội ngũ Luxe Store sẽ phản hồi.', href: '/contact', label: 'Liên hệ' }}
    />
  );
}
