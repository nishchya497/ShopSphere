import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./cart.css";

function Cart({ cart, setCart, session, authLoading }) {
  const navigate = useNavigate();

  // Protect cart page
  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      alert("Please login to view your cart.");
      navigate("/login");
    }
  }, [session, authLoading, navigate]);

  // Increase quantity
  const increaseQuantity = async (item) => {
  const stock = Number(item.stock || 0);

  if (item.quantity >= stock) {
    alert(`Only ${stock} item${stock === 1 ? "" : "s"} available in stock.`);
    return;
  }

  const newQuantity = item.quantity + 1;

    const { error } = await supabase
      .from("cart")
      .update({ quantity: newQuantity })
      .eq("user_id", session.user.id)
      .eq("product_id", item.id);

    if (error) {
      console.error("Error updating cart:", error);
      alert("Could not update quantity.");
      return;
    }

    setCart(
      cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );
  };

  // Decrease quantity
  const decreaseQuantity = async (item) => {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;

      const { error } = await supabase
        .from("cart")
        .update({ quantity: newQuantity })
        .eq("user_id", session.user.id)
        .eq("product_id", item.id);

      if (error) {
        console.error("Error updating cart:", error);
        alert("Could not update quantity.");
        return;
      }

      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        )
      );
    } else {
      removeFromCart(item);
    }
  };

  // Remove item
  const removeFromCart = async (item) => {
    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("user_id", session.user.id)
      .eq("product_id", item.id);

    if (error) {
      console.error("Error removing cart item:", error);
      alert("Could not remove item.");
      return;
    }

    setCart(
      cart.filter((cartItem) => cartItem.id !== item.id)
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  return (
    <div className="cart-page">

      <nav className="cart-navbar">

        <div className="logo">
          Shop<span>Sphere</span>
        </div>

        <div className="nav-links">
          <Link to="/">Home</Link>

          <Link to="/products">
            Products
          </Link>

          <Link to="/cart">
            🛒 Cart (
            {cart.reduce(
              (total, item) => total + item.quantity,
              0
            )}
            )
          </Link>
        </div>

      </nav>

      <section className="cart-container">

        <h1>Shopping Cart</h1>

        {cart.length === 0 ? (

          <div className="empty-cart">

            <h2>Your cart is empty 🛒</h2>

            <p>
              Add some products to your cart.
            </p>

            <Link
              to="/products"
              className="continue-btn"
            >
              Continue Shopping
            </Link>

          </div>

        ) : (

          <>

            <div className="cart-items">

              {cart.map((item) => (

                <div
                  className="cart-item"
                  key={item.id}
                >

                  <img
                    src={item.image}
                    alt={item.name}
                  />

                  <div className="cart-info">

                    <h3>{item.name}</h3>

                    <p>{item.category}</p>

                    <strong>
  ₹{item.price}
</strong>

{Number(item.stock || 0) === 0 ? (
  <span className="cart-stock out">
    Out of Stock
  </span>
) : Number(item.stock || 0) <= 5 ? (
  <span className="cart-stock low">
    Only {item.stock} left
  </span>
) : (
  <span className="cart-stock available">
    In Stock
  </span>
)}

                  </div>

                  <div className="quantity">

                    <button
                      onClick={() =>
                        decreaseQuantity(item)
                      }
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
  onClick={() => increaseQuantity(item)}
  disabled={item.quantity >= Number(item.stock || 0)}
>
  +
</button>

                  </div>

                  <button
                    className="remove-btn"
                    onClick={() =>
                      removeFromCart(item)
                    }
                  >
                    Remove
                  </button>

                </div>

              ))}

            </div>

            <div className="cart-summary">

              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Items</span>

                <span>
                  {cart.reduce(
                    (total, item) =>
                      total + item.quantity,
                    0
                  )}
                </span>
              </div>

              <div className="summary-row">

                <span>Total</span>

                <strong>
                  ₹{total}
                </strong>

              </div>

              <Link
                to="/checkout"
                className="checkout-btn"
              >
                Proceed to Checkout
              </Link>

            </div>

          </>

        )}

      </section>

    </div>
  );
}

export default Cart;