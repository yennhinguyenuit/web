import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { productAPI } from '../services/api';
import { useWishlist } from '../hooks/useWishlist';
import ProductCard from '../components/ProductCard';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productAPI.getProducts({ limit: 4 });
        setProducts(res.data?.items || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="bg-white">
      <div className="relative h-[500px]">
        <img
          src="https://images.unsplash.com/photo-1521336575822-6da63fb45455"
          className="w-full h-full object-cover"
          alt="Hero"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 flex flex-col justify-center items-start px-10 text-white">
          <h1 className="text-5xl font-bold mb-4">
            Tinh hoa <br /> Thời trang
          </h1>

          <p className="text-lg text-gray-200 mb-6 max-w-lg">
            Khám phá những thiết kế độc quyền, chất lượng cao cấp
          </p>

          <Link to="/shop">
            <button className="bg-red-600 px-6 py-3 rounded hover:bg-red-700">
              Mua sắm ngay
            </button>
          </Link>
        </div>
      </div>

      <div className="py-16 px-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold">Sản phẩm nổi bật</h2>
            <p className="text-gray-500 mt-2">Chọn nhanh món bạn thích rồi thêm vào giỏ hoặc mua ngay.</p>
          </div>
          <Link to="/shop" className="text-red-600 font-medium">Xem toàn bộ sản phẩm</Link>
        </div>

        {loading ? (
          <p className="text-center">Đang tải...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                liked={isWishlisted(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-red-600 py-20 px-10 text-white">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">Khách Hàng Nói Gì Về Chúng Tôi</h2>
          <p className="text-gray-200">Hàng nghìn khách hàng đã tin tưởng và hài lòng với sản phẩm, dịch vụ của Luxe Store</p>
        </div>

        <div className="grid md:grid-cols-3 text-center mb-12 gap-6">
          <div>
            <h3 className="text-5xl font-bold">15,000+</h3>
            <p className="text-gray-200 mt-2">Khách hàng</p>
          </div>

          <div>
            <h3 className="text-5xl font-bold">4.9 ★</h3>
            <p className="text-gray-200 mt-2">Đánh giá trung bình</p>
          </div>

          <div>
            <h3 className="text-5xl font-bold">98%</h3>
            <p className="text-gray-200 mt-2">Khách hàng hài lòng</p>
          </div>
        </div>
      </div>

      <div className="py-16 text-center space-y-4">
        <h2 className="text-3xl font-bold">Bắt đầu mua sắm ngay hôm nay</h2>
        <p className="text-gray-500">Từ trang shop bạn có thể lọc sản phẩm, thêm vào giỏ và thanh toán ngay.</p>

        <Link to="/shop">
          <button className="bg-red-600 text-white px-8 py-3 rounded hover:bg-red-700">
            Đi đến Shop
          </button>
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
