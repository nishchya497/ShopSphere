import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./orderDetails.css";

function OrderDetails({ session, authLoading }) {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      alert("Please login to view your order.");
      navigate("/login");
      return;
    }

    const fetchOrderDetails = async () => {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", session.user.id)
        .single();

      if (orderError) {
        console.error("Error fetching order:", orderError);
        alert("Order not found.");
        navigate("/orders");
        return;
      }

      const { data: itemData, error: itemError } = await supabase
        .from("order_items")
        .select(`
          quantity,
          price,
          product_id,
          products (
            name,
            image
          )
        `)
        .eq("order_id", orderId);

      if (itemError) {
        console.error("Error fetching order items:", itemError);
        return;
      }

      setOrder(orderData);
      setItems(itemData);
      setLoading(false);
    };

    fetchOrderDetails();
  }, [session, authLoading, orderId, navigate]);

  if (authLoading || loading) {
    return <h2>Loading order...</h2>;
  }

  return (
    <div className="order-details-page">

      <nav className="order-details-navbar">
        <Link to="/" className="order-details-logo">
          Shop<span>Sphere</span>
        </Link>

        <div>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/orders">📦 Orders</Link>
          <Link to="/cart">🛒 Cart</Link>
        </div>
      </nav>

      <div className="order-details-container">

        <div className="order-details-header">
          <div>
            <h1>Order #{order.id}</h1>

            <p>
              Date:{" "}
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>

          <span className="order-status">
            {order.status}
          </span>
        </div>

        <div className="order-info-box">
          <p>
            <strong>Payment:</strong>{" "}
            {order.payment_method.toUpperCase()}
          </p>

          <p>
            <strong>Total:</strong> ₹{order.total_amount}
          </p>
        </div>

        <h2>Ordered Products</h2>

        <div className="order-items">

          {items.map((item) => (
            <div
              className="order-item"
              key={item.product_id}
            >
              <img
                src={item.products?.image}
                alt={item.products?.name}
              />

              <div className="order-item-info">
                <h3>
                  {item.products?.name}
                </h3>

                <p>
                  Price: ₹{item.price}
                </p>

                <p>
                  Quantity: {item.quantity}
                </p>

                <strong>
                  Subtotal: ₹
                  {item.price * item.quantity}
                </strong>
              </div>
            </div>
          ))}

        </div>

        <div className="order-total">
          <strong>
            Order Total: ₹{order.total_amount}
          </strong>
        </div>

        <Link
          to="/orders"
          className="back-orders-btn"
        >
          ← Back to Orders
        </Link>

      </div>
    </div>
  );
}

export default OrderDetails;