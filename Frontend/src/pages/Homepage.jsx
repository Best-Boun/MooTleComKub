import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../services/productService";

export default function Homepage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getAllProducts();
        const allProducts = Array.isArray(res?.data) ? res.data : [];
        setProducts(allProducts.slice(0, 4));
      } catch (error) {
        console.error(error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container py-4">
      <section className="mb-5">
        <h1 className="fw-bold mb-2">Welcome to TleComKub</h1>
        <p className="mb-3">Computer Sets & Notebooks</p>
        <button
          type="button"
          className="btn btn-dark"
          onClick={() => navigate("/products")}
        >
          Browse Products
        </button>
      </section>

      <section className="mb-5">
        <h2 className="h4 fw-bold mb-3">Featured Products</h2>

        <div className="row g-3">
          {products.map((product) => (
            <div className="col-md-3" key={product.product_id}>
              <div className="card h-100">
                <img
                  src={product.image || "https://placehold.co/300x200?text=No+Image"}
                  alt={product.product_name}
                  className="card-img-top"
                  style={{ height: "180px", objectFit: "cover" }}
                />

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.product_name}</h5>
                  <p className="card-text mb-3">฿{Number(product.price || 0).toLocaleString()}</p>

                  <button
                    type="button"
                    className="btn btn-outline-dark mt-auto"
                    onClick={() => navigate(`/products/${product.product_id}`)}
                  >
                    View Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="h4 fw-bold mb-3">Why Choose TleComKub</h2>
        <ul className="list-unstyled mb-0">
          <li className="mb-2">✓ Genuine Products</li>
          <li className="mb-2">✓ Official Warranty</li>
          <li className="mb-2">✓ Secure Checkout</li>
          <li>✓ Fast Delivery</li>
        </ul>
      </section>
    </div>
  );
}
