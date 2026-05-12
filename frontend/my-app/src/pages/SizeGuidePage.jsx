import InfoPage from '../components/InfoPage';

export default function SizeGuidePage() {
  return (
    <InfoPage
      eyebrow="Hướng dẫn"
      title="Bảng size"
      description="Gợi ý chọn size theo form mặc phổ biến. Nếu bạn ở giữa hai size, hãy ưu tiên size lớn hơn để thoải mái khi vận động."
      stats={[
        { value: 'S-XXL', label: 'Dải size phổ biến' },
        { value: '24h', label: 'Hỗ trợ tư vấn size' },
        { value: '1 đổi 1', label: 'Hỗ trợ đổi size theo chính sách' },
      ]}
      sections={[
        {
          kicker: 'Áo',
          title: 'Chọn theo vai và vòng ngực',
          body: 'Áo regular fit phù hợp mặc hằng ngày. Slim fit ôm hơn ở vai và thân, oversize có độ rũ rộng hơn bình thường.',
          items: ['S: 45-55kg', 'M: 55-65kg', 'L: 65-75kg', 'XL: 75-85kg'],
        },
        {
          kicker: 'Quần',
          title: 'Chọn theo eo và chiều dài',
          body: 'Đo vòng eo tại vị trí mặc quần thoải mái nhất. Với quần form suông, nên ưu tiên chiều dài vừa giày.',
          items: ['28-29: eo nhỏ', '30-31: trung bình', '32-34: rộng', '36+: big size'],
        },
        {
          kicker: 'Giày',
          title: 'Đo chân vào cuối ngày',
          body: 'Bàn chân thường giãn nhẹ vào cuối ngày. Hãy đo chiều dài chân và cộng thêm khoảng thoải mái nhỏ khi chọn sneaker.',
          items: ['39: 24.5cm', '40: 25cm', '41: 26cm', '42: 26.5cm', '43: 27.5cm'],
        },
        {
          kicker: 'Tư vấn',
          title: 'Gửi số đo để shop hỗ trợ',
          body: 'Bạn có thể gửi chiều cao, cân nặng, số đo vai/ngực/eo và phong cách mặc mong muốn để shop đề xuất size gần nhất.',
        },
      ]}
    />
  );
}
