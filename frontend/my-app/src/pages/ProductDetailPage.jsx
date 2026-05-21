import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../hooks/useWishlist';

const fallbackImage = 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=85';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      const productRes = await productAPI.getProductById(id);
      const nextProduct = productRes.data;
      setProduct(nextProduct);
      setSelectedColor(nextProduct.colors?.[0] || '');
      setSelectedSize(nextProduct.sizes?.[0] || '');
      setSelectedImage(nextProduct.image || nextProduct.images?.[0] || fallbackImage);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const gallery = useMemo(() => {
    const images = [product?.image, ...(product?.images || [])].filter(Boolean);
    return [...new Set(images.length ? images : [fallbackImage])];
  }, [product]);

  const ensureLoggedIn = () => {
    if (user) return true;
    navigate('/login');
    return false;
  };

  const cartPayload = () => ({
    ...product,
    color: selectedColor,
    size: selectedSize,
  });

  const handleAddToCart = async () => {
    if (!ensureLoggedIn()) return;
    try {
      await addToCart(cartPayload(), quantity);
      alert('Đã thêm vào giỏ hàng');
    } catch {
      alert('Không thể thêm vào giỏ hàng');
    }
  };

  const handleBuyNow = async () => {
    if (!ensureLoggedIn()) return;
    try {
      await addToCart(cartPayload(), quantity);
      navigate('/checkout');
    } catch {
      alert('Không thể mua ngay');
    }
  };

  const handleToggleWishlist = async () => {
    if (!ensureLoggedIn()) return;
    try {
      await toggleWishlist(product.id);
    } catch {
      alert('Không thể cập nhật yêu thích');
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-zinc-600">Đang tải sản phẩm...</div>;
  }

  if (!product) {
    return <div className="p-10 text-center text-zinc-600">Không tìm thấy sản phẩm.</div>;
  }

  const availableStock = Math.max(0, Number(product.stock || 0));
  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || 0);
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-zinc-500 sm:px-6 lg:px-8">
          <Link to="/" className="hover:text-zinc-950">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-zinc-950">Cửa hàng</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-950">{product.name}</span>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[88px_1fr]">
          <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-visible">
            {gallery.map((image) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-white ${selectedImage === image ? 'border-zinc-950' : 'border-zinc-200'}`}
              >
                <img
                  src={image}
                  alt={product.name}
                  onError={(event) => {
                    event.currentTarget.src = fallbackImage;
                  }}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>

          <div className="order-1 overflow-hidden rounded-lg bg-white shadow-sm lg:order-2">
            <img
              src={selectedImage || fallbackImage}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.src = fallbackImage;
              }}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">{product.category?.name || 'Sản phẩm'}</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">{product.name}</h1>
            </div>
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border text-2xl transition ${
                isWishlisted(product.id) ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-950'
              }`}
              aria-label="Yêu thích"
            >
              {isWishlisted(product.id) ? '♥' : '♡'}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <p className="text-3xl font-black text-zinc-950">{price.toLocaleString('vi-VN')}đ</p>
            {originalPrice > price && (
              <>
                <p className="pb-1 text-lg font-semibold text-zinc-400 line-through">{originalPrice.toLocaleString('vi-VN')}đ</p>
                <span className="mb-1 rounded-full bg-zinc-950 px-3 py-1 text-xs font-bold text-white">-{discount}%</span>
              </>
            )}
          </div>

          <p className="mt-5 leading-7 text-zinc-600">
            {product.description || product.shortDescription || 'Thiết kế dễ phối cho tủ đồ hằng ngày, phù hợp đi học, đi làm hoặc dạo phố.'}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 rounded-lg bg-zinc-50 p-4 text-center">
            <div><p className="text-xs font-bold uppercase text-zinc-500">Tồn kho</p><p className="mt-1 font-black">{availableStock}</p></div>
            <div><p className="text-xs font-bold uppercase text-zinc-500">Đánh giá</p><p className="mt-1 font-black">{product.rating || 0}/5</p></div>
            <div><p className="text-xs font-bold uppercase text-zinc-500">Lượt review</p><p className="mt-1 font-black">{product.reviewCount || 0}</p></div>
          </div>

          {product.colors?.length > 0 && (
            <div className="mt-7">
              <p className="mb-3 font-black text-zinc-950">Màu sắc</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedColor === color ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-300 text-zinc-800 hover:border-zinc-950'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="mt-7">
              <p className="mb-3 font-black text-zinc-950">Kích thước</p>
              <div className="grid grid-cols-5 gap-2 sm:max-w-md">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 rounded-md border text-sm font-bold transition ${selectedSize === size ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-300 text-zinc-800 hover:border-zinc-950'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7">
            <p className="mb-3 font-black text-zinc-950">Số lượng</p>
            <div className="inline-flex h-12 items-center overflow-hidden rounded-full border border-zinc-300 bg-white">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-full w-12 text-xl font-bold hover:bg-zinc-100">-</button>
              <span className="w-12 text-center font-black">{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => (availableStock ? Math.min(availableStock, q + 1) : q + 1))} className="h-full w-12 text-xl font-bold hover:bg-zinc-100">+</button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <button onClick={handleAddToCart} className="h-12 rounded-md border border-zinc-950 px-5 text-sm font-black text-zinc-950 transition hover:bg-zinc-100">
              Thêm vào giỏ
            </button>
            <button onClick={handleBuyNow} className="h-12 rounded-md bg-zinc-950 px-5 text-sm font-black text-white transition hover:bg-zinc-800">
              Mua ngay
            </button>
            <Link to="/cart" className="inline-flex h-12 items-center justify-center rounded-md border border-zinc-300 px-5 text-sm font-black text-zinc-800 hover:border-zinc-950">
              Xem giỏ
            </Link>
          </div>

          <div className="mt-8 grid gap-3 border-t border-zinc-200 pt-6 text-sm text-zinc-600 sm:grid-cols-3">
            <p><strong className="block text-zinc-950">Đổi size</strong>Hỗ trợ theo chính sách cửa hàng.</p>
            <p><strong className="block text-zinc-950">Giao nhanh</strong>Theo dõi đơn sau khi thanh toán.</p>
            <p><strong className="block text-zinc-950">Tư vấn</strong>Chat để được chọn size phù hợp.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
