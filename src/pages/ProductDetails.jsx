import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./productDetails.css";

function ProductDetails({ products, cart, setCart, session }) {
  const { id } = useParams();
  const navigate = useNavigate();

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

  // Stock value
  const stock = Number(product.stock || 0);

  const addToCart = async () => {
    if (!session) {
      alert("Please login to add products to cart.");
      navigate("/login");
      return false;
    }

    // Product completely out of stock
    if (stock <= 0) {
      alert("This product is currently out of stock.");
      return false;
    }

    const existingProduct = cart.find(
      (item) => item.id === product.id
    );

    // Calculate total quantity after adding
    const currentQuantity = existingProduct
      ? existingProduct.quantity
      : 0;

    const newQuantity = currentQuantity + quantity;

    // Prevent buying more than available stock
    if (newQuantity > stock) {
      alert(
        `Only ${stock} item${
          stock === 1 ? "" : "s"
        } available in stock.`
      );
      return false;
    }

    if (existingProduct) {
      const { error } = await supabase
        .from("cart")
        .update({
          quantity: newQuantity,
        })
        .eq("user_id", session.user.id)
        .eq("product_id", product.id);

      if (error) {
        console.error(
          "Error updating cart:",
          error
        );
        alert("Could not update cart.");
        return false;
      }

      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: newQuantity,
              }
            : item
        )
      );
    } else {
      const { error } = await supabase
        .from("cart")
        .insert({
          user_id: session.user.id,
          product_id: product.id,
          quantity: quantity,
        });

      if (error) {
        console.error(
          "Error adding to cart:",
          error
        );
        alert("Could not add product to cart.");
        return false;
      }

      setCart([
        ...cart,
        {
          ...product,
          quantity: quantity,
        },
      ]);
    }

    alert("Product added to cart! 🛒");
    return true;
  };

  return (
    <div className="details-page">

      <nav className="details-navbar">
        <Link to="/" className="details-logo">
          Shop<span>Sphere</span>
        </Link>

        <div>
          <Link to="/products">
            Products
          </Link>

          <Link to="/cart">
            🛒 Cart (
            {cart.reduce(
              (total, item) =>
                total + item.quantity,
              0
            )}
            )
          </Link>
        </div>
      </nav>

      <div className="details-container">

        <div className="details-image">
          <img
            src={product.image}
            alt={product.name}
          />
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
            {product.description ||
              "High-quality product designed for everyday use."}
          </p>

          {/* STOCK STATUS */}
          <p>
            <strong>Stock: </strong>

            {stock === 0 ? (
              <span>Out of Stock</span>
            ) : stock <= 5 ? (
              <span>
                Only {stock} left in stock
              </span>
            ) : (
              <span>In Stock</span>
            )}
          </p>

          <div className="quantity">

            <span>Quantity:</span>

            <button
              disabled={stock === 0}
              onClick={() =>
                setQuantity(
                  Math.max(1, quantity - 1)
                )
              }
            >
              −
            </button>

            <strong>{quantity}</strong>

            <button
              disabled={
                stock === 0 ||
                quantity >= stock
              }
              onClick={() =>
                setQuantity(
                  Math.min(
                    stock,
                    quantity + 1
                  )
                )
              }
            >
              +
            </button>

          </div>

          <button
            className="details-cart-btn"
            onClick={addToCart}
            disabled={stock === 0}
          >
            {stock === 0
              ? "Out of Stock"
              : "🛒 Add to Cart"}
          </button>

          <button
            className="buy-btn"
            disabled={stock === 0}
            onClick={async () => {
              const success =
                await addToCart();

              if (success) {
                navigate("/checkout");
              }
            }}
          >
            {stock === 0
              ? "Out of Stock"
              : "Buy Now"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ProductDetails;