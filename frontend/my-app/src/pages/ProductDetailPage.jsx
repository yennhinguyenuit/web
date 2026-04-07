import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => {
        if (res.data.success) {
          setProduct(res.data.data);
        }
      })
      .catch(err => console.log(err));
  }, [id]);

  if (!product) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: 40 }}>
      <h1>{product.name}</h1>
      <p>{product.price}</p>
      <p>{product.description}</p>
    </div>
  );
}

export default ProductDetailPage;