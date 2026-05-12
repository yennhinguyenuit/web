import InfoPage from '../components/InfoPage';

export default function StoreLocatorPage() {
  return (
    <InfoPage
      eyebrow="Hệ thống"
      title="Cửa hàng"
      description="Ghé Luxe Store để thử size, xem chất liệu trực tiếp hoặc nhận tư vấn phối đồ từ đội ngũ bán hàng."
      sections={[
        {
          kicker: 'TP. Hồ Chí Minh',
          title: 'Luxe Store Quận 1',
          body: 'Không gian trưng bày các dòng sản phẩm chủ lực, hỗ trợ thử size và nhận hàng tại cửa hàng.',
          items: ['123 Nguyễn Huệ, Quận 1', '08:00 - 22:00', 'Hotline: 1900 1234'],
        },
        {
          kicker: 'Online',
          title: 'Tư vấn từ xa',
          body: 'Nếu bạn chưa tiện ghé cửa hàng, shop vẫn hỗ trợ chọn size, kiểm tra tồn kho và xử lý đơn qua kênh online.',
          items: ['Email: support@luxestore.vn', 'Hỗ trợ mỗi ngày', 'Kiểm tra đơn nhanh'],
        },
      ]}
      cta={{ title: 'Cần giữ hàng trước khi đến?', body: 'Liên hệ shop với sản phẩm, size và màu mong muốn để được kiểm tra tồn kho.', href: '/contact', label: 'Liên hệ cửa hàng' }}
    />
  );
}
