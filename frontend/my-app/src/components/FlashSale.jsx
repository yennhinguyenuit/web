import { useEffect, useState } from "react";

export default function FlashSale() {
  const [sale, setSale] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/flash-sale/active")
      .then(res => res.json())
      .then(data => setSale(data.data));
  }, []);

  // COUNTDOWN
  useEffect(() => {
    if (!sale) return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(sale.end_date);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

      setTimeLeft(`${h}:${m}:${s}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [sale]);

  if (!sale) return null;

  return (
    <div className="bg-red-600 text-white p-6 rounded-xl shadow-lg">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          🔥 FLASH SALE
        </h2>

        <span className="bg-black px-3 py-1 rounded text-sm">
          ⏰ {timeLeft}
        </span>
      </div>

      {/* PRODUCTS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sale.flashSaleItems.map(item => {
          const p = item.product;
          const newPrice =
            p.price * (1 - sale.discount_percent / 100);

          return (
            <div
              key={p.id}
              className="bg-white text-black p-3 rounded relative hover:shadow-lg transition"
            >

              {/* BADGE */}
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                -{sale.discount_percent}%
              </div>

              <img
                src={p.image}
                className="h-32 w-full object-cover rounded"
              />

              <p className="text-sm mt-2 font-medium">
                {p.name}
              </p>

              <p className="line-through text-gray-400 text-sm">
                {p.price.toLocaleString()}đ
              </p>

              <p className="text-red-600 font-bold">
                {Math.floor(newPrice).toLocaleString()}đ
              </p>

            </div>
          );
        })}
      </div>

    </div>
  );
}