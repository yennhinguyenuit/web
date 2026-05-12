import InfoPage from '../components/InfoPage';

export default function GiftCardsPage() {
  return (
    <InfoPage
      eyebrow="Quà tặng"
      title="Thẻ quà tặng Luxe Store"
      description="Một lựa chọn gọn gàng cho sinh nhật, dịp lễ hoặc khi bạn muốn tặng người nhận quyền tự chọn món họ thích."
      stats={[
        { value: '3 mức', label: 'Mệnh giá gợi ý' },
        { value: 'Online', label: 'Gửi mã nhanh' },
        { value: 'Linh hoạt', label: 'Dùng cho nhiều sản phẩm' },
      ]}
      sections={[
        {
          kicker: 'Mệnh giá',
          title: 'Chọn ngân sách phù hợp',
          body: 'Thẻ quà tặng có thể dùng cho một phần hoặc toàn bộ đơn hàng tùy giá trị còn lại của mã.',
          items: ['300.000đ', '500.000đ', '1.000.000đ'],
        },
        {
          kicker: 'Cách dùng',
          title: 'Nhập mã khi thanh toán',
          body: 'Người nhận nhập mã tại bước checkout. Giá trị thẻ sẽ được trừ vào tổng đơn nếu mã còn hiệu lực.',
        },
        {
          kicker: 'Thiết kế',
          title: 'Gửi lời nhắn cá nhân',
          body: 'Bạn có thể chuẩn bị lời chúc riêng để gửi cùng mã quà tặng, phù hợp cho nhiều dịp khác nhau.',
        },
        {
          kicker: 'Hỗ trợ',
          title: 'Kiểm tra số dư',
          body: 'Nếu cần kiểm tra giá trị còn lại, hãy liên hệ shop với mã thẻ để được hỗ trợ.',
        },
      ]}
      cta={{ title: 'Muốn mua thẻ quà tặng?', body: 'Liên hệ shop để chọn mệnh giá và cách gửi phù hợp.', href: '/contact', label: 'Liên hệ ngay' }}
    />
  );
}
