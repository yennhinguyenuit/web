import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const formatPrice = (num) => `${Number(num || 0).toLocaleString('vi-VN')}đ`;
const fallbackProductImage = 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=300&q=80';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeItem, updateQuantity, clearCart } = useCart();

  const items = cart?.items || [];
  const totalQuantity = cart?.totalQuantity || 0;
  const total = items.reduce((sum, item) => (
    sum + (Number(item.price) || 100000) * (Number(item.quantity) || 0)
  ), 0);

  const getCartItemKey = (item) =>
    `${item.productId}:${item.color || ''}:${item.size || ''}`;

  const handleUpdateQty = (item, qty) => {
    if (qty <= 0) {
      removeItem(item);
      return;
    }
    updateQuantity(item, qty);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-zinc-500">Giỏ hàng</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-zinc-950">Sẵn sàng thanh toán</h1>
              <p className="mt-3 text-zinc-600">{totalQuantity} sản phẩm trong giỏ</p>
            </div>
            <Link to="/shop" className="rounded-md border border-zinc-300 px-5 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-100">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-black text-zinc-950">Giỏ hàng đang trống</h2>
            <p className="mt-2 text-zinc-600">Thêm sản phẩm để bắt đầu mua hàng.</p>
            <Link to="/shop" className="mt-6 inline-flex rounded-md bg-zinc-950 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800">
              Đi mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((item) => {
                const price = Number(item.price) || 100000;
                const qty = Number(item.quantity) || 0;
                const subTotal = price * qty;

                return (
                  <article key={getCartItemKey(item)} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="flex gap-4">
                      <img
                        src={item.image || item.thumbnail || fallbackProductImage}
                        onError={(event) => {
                          event.currentTarget.src = fallbackProductImage;
                        }}
                        className="h-24 w-24 rounded-md border border-zinc-200 object-cover"
                        alt={item.name}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-zinc-950">{item.name || `Product ${item.productId}`}</p>
                            {(item.color || item.size) && (
                              <p className="mt-1 text-sm text-zinc-500">
                                {[item.color && `Màu: ${item.color}`, item.size && `Size: ${item.size}`]
                                  .filter(Boolean)
                                  .join(' / ')}
                              </p>
                            )}
                          </div>
                          <p className="font-black text-zinc-950">{formatPrice(subTotal)}</p>
                        </div>

                        <p className="mt-2 text-sm text-zinc-500">Đơn giá: {formatPrice(price)}</p>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="inline-flex items-center overflow-hidden rounded-md border border-zinc-300">
                            <button type="button" onClick={() => handleUpdateQty(item, qty - 1)} className="h-10 w-10 font-black hover:bg-zinc-100">
                              -
                            </button>
                            <span className="grid h-10 min-w-12 place-items-center border-x border-zinc-300 text-sm font-bold">{qty}</span>
                            <button type="button" onClick={() => handleUpdateQty(item, qty + 1)} className="h-10 w-10 font-black hover:bg-zinc-100">
                              +
                            </button>
                          </div>

                          <button type="button" onClick={() => removeItem(item)} className="text-sm font-bold text-zinc-500 hover:text-black">
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="lg:sticky lg:top-32 lg:self-start">
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black text-zinc-950">Tóm tắt đơn hàng</h2>
                <div className="mt-5 space-y-3 text-sm">
                  <Row label="Số lượng" value={totalQuantity} plain />
                  <Row label="Tạm tính" value={formatPrice(total)} plain />
                  <div className="flex justify-between border-t border-zinc-200 pt-4 text-lg font-black">
                    <span>Thành tiền</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button onClick={() => navigate('/checkout')} className="mt-6 w-full rounded-md bg-zinc-950 py-4 text-sm font-black uppercase tracking-wide text-white hover:bg-zinc-800">
                  Thanh toán
                </button>

                <button onClick={clearCart} className="mt-3 w-full rounded-md border border-zinc-300 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-100">
                  Xóa giỏ hàng
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-zinc-600">
      <span>{label}</span>
      <span className="font-bold text-zinc-950">{value}</span>
    </div>
  );
}
