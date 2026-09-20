import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./productDetails.css";

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 1999,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    description:
      "Enjoy high-quality sound with comfortable wireless headphones. Perfect for music, movies and gaming.",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 2499,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    description:
      "A stylish smart watch with fitness tracking, notifications and everyday smart features.",
  },
  {
    id: 3,
    name: "Running Shoes",
    price: 1799,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    description:
      "Lightweight and comfortable running shoes designed for everyday workouts and running.",
  },
  {
    id: 4,
    name: "Backpack",
    price: 999,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
    description:
      "Spacious and durable backpack suitable for college, travel and everyday use.",
  },
];

function ProductDetails({ cart, setCart }) {
  const { id } = useParams();

  const product = products.find(
    (item) => item.id === Number(id)
  );

  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="not-found">
        <h2>Product not found</h2>
        <Link to="/products">Back to Products</Link>
      </div>
    );
  }

  const addToCart = () => {
  const existingProduct = cart.find(
    (item) => item.id === product.id
  );

  if (existingProduct) {
    setCart(
      cart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + quantity,
            }
          : item
      )
    );
  } else {
    setCart([
      ...cart,
      {
        ...product,
        quantity: quantity,
      },
    ]);
  }

  alert("Product added to cart! 🛒");
};

  return (
    <div className="details-page">

      <nav className="details-navbar">
        <Link to="/" className="details-logo">
          Shop<span>Sphere</span>
        </Link>

        <div>
          <Link to="/products">Products</Link>
          <Link to="/cart">
  🛒 Cart ({cart.reduce((total, item) => total + item.quantity, 0)})
</Link>
        </div>
      </nav>

      <div className="details-container">

        <div className="details-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="details-info">

          <p className="details-category">
            {product.category}
          </p>

          <h1>{product.name}</h1>

          <div className="details-rating">
            ⭐⭐⭐⭐⭐
          </div>

          <h2>₹{product.price}</h2>

          <p className="details-description">
            {product.description}
          </p>

          <div className="quantity">
            <span>Quantity:</span>

            <button
              onClick={() =>
                setQuantity(Math.max(1, quantity - 1))
              }
            >
              −
            </button>

            <strong>{quantity}</strong>

            <button
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>

          <button
            className="details-cart-btn"
            onClick={addToCart}
          >
            🛒 Add to Cart
          </button>

          <button
  className="buy-btn"
  onClick={() => {
    addToCart();
    window.location.href = "/checkout";
  }}
>
  Buy Now
</button>

        </div>

      </div>

    </div>
  );
}

export default ProductDetails;