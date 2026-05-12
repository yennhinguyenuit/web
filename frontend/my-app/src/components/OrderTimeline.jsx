const steps = [
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'completed', label: 'Hoàn thành' },
];

export default function OrderTimeline({ status }) {
  const currentIndex = steps.findIndex((step) => step.key === status);

  if (status === 'cancelled') {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        Đơn hàng đã hủy
      </div>
    );
  }

  return (
    <div className="mb-6 flex w-full items-center justify-between">
      {steps.map((step, index) => {
        const isDone = currentIndex >= 0 && index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all
                  ${isCurrent
                    ? 'scale-110 border-red-500 bg-red-500 text-white shadow-md'
                    : isDone
                      ? 'border-red-500 bg-white text-red-500'
                      : 'border-gray-300 bg-white text-gray-300'}
                `}
              >
                {index + 1}
              </div>

              <p
                className={`mt-2 text-center text-xs ${
                  isCurrent
                    ? 'font-semibold text-red-600'
                    : isDone
                      ? 'text-red-500'
                      : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>
            </div>

            {index < steps.length - 1 && (
              <div className="relative mx-2 h-[2px] flex-1">
                <div className="absolute inset-0 bg-gray-300" />
                <div
                  className={`absolute inset-0 transition-all duration-500 ${
                    index < currentIndex ? 'bg-red-500' : 'bg-transparent'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
