export default function OrderTimeline({ status }) {
  const steps = ['pending', 'confirmed', 'shipping', 'completed'];

  const labels = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao',
    completed: 'Hoàn thành'
  };

  const currentIndex = steps.indexOf(status);

  return (
    <div className="flex justify-between items-center mb-6">
      {steps.map((step, index) => (
        <div key={step} className="flex-1 text-center relative">

          {/* line */}
          {index !== 0 && (
            <div className={`absolute top-3 left-0 w-full h-1 
              ${index <= currentIndex ? 'bg-red-500' : 'bg-gray-300'}`} />
          )}

          {/* dot */}
          <div className={`w-6 h-6 mx-auto rounded-full z-10 relative
            ${index <= currentIndex ? 'bg-red-500' : 'bg-gray-300'}`} />

          {/* text */}
          <p className={`mt-2 text-sm 
            ${index <= currentIndex ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
            {labels[step]}
          </p>
        </div>
      ))}
    </div>
  );
}