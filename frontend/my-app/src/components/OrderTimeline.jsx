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
      <div className="rounded-lg border border-zinc-300 bg-zinc-100 p-4 text-sm font-medium text-zinc-700">
        Đơn hàng đã hủy.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-4">
      {steps.map((step, index) => {
        const isDone = currentIndex >= 0 && index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.key} className="relative flex gap-3 sm:block">
            <div
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-sm font-black ${
                isCurrent
                  ? 'border-zinc-950 bg-zinc-950 text-white'
                  : isDone
                    ? 'border-zinc-950 bg-white text-zinc-950'
                    : 'border-zinc-300 bg-white text-zinc-400'
              }`}
            >
              {index + 1}
            </div>

            <div className="min-w-0 sm:mt-3">
              <p className={`text-sm font-bold ${isCurrent || isDone ? 'text-zinc-950' : 'text-zinc-500'}`}>
                {step.label}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {isCurrent ? 'Đang thực hiện' : isDone ? 'Đã xong' : 'Chờ cập nhật'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
