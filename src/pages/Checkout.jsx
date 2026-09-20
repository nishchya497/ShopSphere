import "./checkout.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./checkout.css";

function Checkout({ cart, setCart }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const placeOrder = (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    alert("Order placed successfully! 🎉");

    setCart([]);

    navigate("/order-success");
  };

  return (
    <div className="checkout-page">

      <nav className="checkout-navbar">
        <div className="logo">
          Shop<span>Sphere</span>
        </div>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">🛒 Cart ({cart.length})</Link>
        </div>
      </nav>

      <div className="checkout-container">

        <h1>Checkout</h1>

        <div className="checkout-content">

          {/* Customer Details */}

          <form
            className="checkout-form"
            onSubmit={placeOrder}
          >

            <h2>Delivery Details</h2>
            <div className="payment-section">
              <h2>Payment Method</h2>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  defaultChecked
                />
                Cash on Delivery
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                />
                Online Payment
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                />
                Credit/Debit Card
              </label>
            </div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
            />

            <textarea
              name="address"
              placeholder="Full Address"
              value={form.address}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="pincode"
              placeholder="PIN Code"
              value={form.pincode}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="place-order-btn"
            >
              Place Order
            </button>

          </form>


          {/* Order Summary */}

          <div className="checkout-summary">

            <h2>Order Summary</h2>

            {cart.map((item, index) => (
              <div
                className="checkout-item"
                key={`${item.id}-${index}`}
              >

                <img
                  src={item.image}
                  alt={item.name}
                />

                <div>
                  <h3>{item.name}</h3>
                  <p>Qty: {item.quantity}</p>
                  <strong>
                    ₹{item.price * item.quantity}
                  </strong>
                </div>

              </div>
            ))}

            <hr />

            <div className="checkout-total">
              <span>Total</span>
              <strong>₹{total}</strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Checkout;