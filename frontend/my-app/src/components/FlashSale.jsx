import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../services/api";

const fallbackProductImage = "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80";

export default function FlashSale() {
  const [sale, setSale] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/flash-sale/active`)
      .then((res) => res.json())
      .then((data) => setSale(data.data))
      .catch(() => setSale(null));
  }, []);

  useEffect(() => {
    if (!sale) return;

    const updateCountdown = () => {
      const diff = new Date(sale.end_date) - new Date();
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTimeLeft(`${h}:${m}:${s}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [sale]);

  if (!sale || !sale.flashSaleItems?.length) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950 px-5 py-4 text-white">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-300">Ưu đãi đang diễn ra</p>
          <h2 className="mt-1 text-2xl font-black">{sale.name || "Flash sale"}</h2>
        </div>
        <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-zinc-950">
          Còn {timeLeft}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
        {sale.flashSaleItems.slice(0, 4).map((item) => {
          const product = item.product;
          const price = Number(product.price || 0);
          const discount = Number(sale.discount_percent || 0);
          const salePrice = Math.floor(price * (1 - discount / 100));

          return (
            <Link key={product.id} to={`/products/${product.id}`} className="group rounded-lg border border-zinc-200 bg-white p-3 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative overflow-hidden rounded-md bg-zinc-100">
                <span className="absolute left-2 top-2 z-10 rounded-full bg-zinc-950 px-2 py-1 text-xs font-black text-white">-{discount}%</span>
                <img
                  src={product.image || fallbackProductImage}
                  alt={product.name}
                  onError={(event) => {
                    event.currentTarget.src = fallbackProductImage;
                  }}
                  className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 line-clamp-2 text-sm font-bold text-zinc-950">{product.name}</p>
              <p className="mt-2 text-sm text-zinc-400 line-through">{price.toLocaleString("vi-VN")}đ</p>
              <p className="text-lg font-black text-zinc-950">{salePrice.toLocaleString("vi-VN")}đ</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
