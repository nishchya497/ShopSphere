import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./checkout.css";
import { supabase } from "../supabaseClient";

function Checkout({ cart, setCart, session }) {
  const navigate = useNavigate();
    useEffect(() => {
    if (!session) {
      alert("Please login to proceed to checkout.");
      navigate("/login");
    }
  }, [session, navigate]);

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

  const placeOrder = async (e) => {
  e.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  if (!session) {
    alert("Please login first.");
    navigate("/login");
    return;
  }

  const paymentMethod = document.querySelector(
    'input[name="payment"]:checked'
  ).value;

  // 1. Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: session.user.id,
      total_amount: total,
      payment_method: paymentMethod,
      status: "Pending",
    })
    .select()
    .single();

  if (orderError) {
    console.error("Error creating order:", orderError);
    alert("Could not place order.");
    return;
  }

  // 2. Create order items
  const orderItems = cart.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error(
      "Error creating order items:",
      itemsError
    );

    // Remove the order if items could not be created
    await supabase
      .from("orders")
      .delete()
      .eq("id", order.id);

    alert("Could not save order items.");
    return;
  }

  // 3. Clear cart from Supabase
  const { error: cartError } = await supabase
    .from("cart")
    .delete()
    .eq("user_id", session.user.id);

  if (cartError) {
    console.error(
      "Error clearing cart:",
      cartError
    );
  }

  // 4. Clear React cart
  setCart([]);

  alert("Order placed successfully! 🎉");

  // 5. Go to success page
  navigate(`/order-success/${order.id}`);
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