export default function OrderTimeline({ status }) {
  const steps = [
    { key: 'pending', label: 'Chờ xử lý', icon: '📄' },
    { key: 'confirmed', label: 'Đã xác nhận', icon: '💳' },
    { key: 'shipping', label: 'Đang giao', icon: '🚚' },
    { key: 'completed', label: 'Hoàn thành', icon: '⭐' }
  ];

  const currentIndex = steps.findIndex(s => s.key === status);

  return (
    <div className="flex items-center justify-between w-full mb-6">

      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.key} className="flex-1 flex items-center">

            {/* STEP */}
            <div className="flex flex-col items-center">

              {/* CIRCLE */}
              <div
                className={`
                  w-10 h-10 flex items-center justify-center 
                  rounded-full border-2 text-lg transition-all

                  ${isCurrent
                    ? "bg-red-500 border-red-500 text-white shadow-md scale-110"
                    : isDone
                    ? "border-red-500 text-red-500 bg-white"
                    : "border-gray-300 text-gray-300 bg-white"}
                `}
              >
                {step.icon}
              </div>

              {/* TEXT */}
              <p
                className={`mt-2 text-xs ${
                  isCurrent
                    ? "text-red-600 font-semibold"
                    : isDone
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </p>

            </div>

            {/* LINE */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-2 relative">

                {/* base */}
                <div className="absolute inset-0 bg-gray-300" />

                {/* active */}
                <div
                  className={`absolute inset-0 transition-all duration-500 ${
                    index < currentIndex ? "bg-red-500" : "bg-transparent"
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