import { useState } from "react";

export default function Tabs({ tabs }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="flex gap-4 border-b mb-4">
        {tabs.map((t, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`pb-2 ${
              active === i ? "border-b-2 border-red-500 font-bold" : ""
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>{tabs[active].content}</div>
    </div>
  );
}