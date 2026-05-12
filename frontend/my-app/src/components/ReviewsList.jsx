// ReviewsList.jsx
import { useEffect, useState } from 'react';

export default function ReviewsList() {
  const [eligibleProducts, setEligibleProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchEligibleProducts();
  }, []);

  const fetchEligibleProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews/eligible/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const { data } = await response.json();
      setEligibleProducts(data.items || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmitReview = async (productId) => {
    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      alert('Rating phải từ 1 đến 5 sao');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reviews/product/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });

      if (!response.ok) throw new Error('Failed to submit review');

      alert('✅ Cảm ơn bạn đã đánh giá!');
      setEligibleProducts(prev => 
        prev.filter(p => p.id !== productId)
      );
      setSelectedProduct(null);
      setReviewForm({ rating: 5, comment: '' });

    } catch (error) {
      console.error('Error submitting review:', error);
      alert('❌ Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (eligibleProducts.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '8px',
        border: '1px solid var(--border)'
      }}>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          ✨ Bạn chưa có sản phẩm để đánh giá
        </p>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <h3>⭐ Đánh giá sản phẩm đã mua ({eligibleProducts.length})</h3>

      <div className="products-grid">
        {eligibleProducts.map(product => (
          <div key={product.id} className="product-review-card">
            <img src={product.image} alt={product.name} />
            <h4>{product.name}</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              📦 {product.orderCode}
            </p>
            <button
              className="btn-secondary"
              onClick={() => setSelectedProduct(product)}
              disabled={loading}
            >
              ⭐ Đánh giá
            </button>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ marginTop: 0 }}>⭐ Đánh giá: {selectedProduct.name}</h3>

            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '16px',
                backgroundColor: 'var(--bg-secondary)'
              }}
            />

            {/* Rating Stars */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600' }}>
                Đánh giá:
              </label>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '8px',
                fontSize: '24px'
              }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '24px',
                      opacity: star <= reviewForm.rating ? 1 : 0.3,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600' }}>
                Nhận xét (tùy chọn):
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={e => setReviewForm(prev => ({
                  ...prev,
                  comment: e.target.value
                }))}
                placeholder="Bạn nghĩ gì về sản phẩm này?"
                style={{
                  width: '100%',
                  minHeight: '100px',
                  marginTop: '8px',
                  padding: '10px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setSelectedProduct(null)}
                disabled={loading}
                style={{
                  padding: '10px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Hủy
              </button>
              <button
                onClick={() => handleSubmitReview(selectedProduct.id)}
                disabled={loading}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: 'var(--secondary)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? '⏳ Đang gửi...' : '✓ Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
