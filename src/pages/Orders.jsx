import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./orders.css";

function Orders({ session, authLoading }) {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      alert("Please login to view your orders.");
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Error fetching orders:", error);
        setError("Unable to load your orders.");
        setLoading(false);
        return;
      }

      setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, [session, authLoading, navigate]);

  // -----------------------------
  // LOADING
  // -----------------------------

  if (authLoading || loading) {
    return (
      <div className="orders-loading">
        <h2>Loading orders...</h2>
      </div>
    );
  }

  // -----------------------------
  // ERROR
  // -----------------------------

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-error">
            <h2>Something went wrong</h2>
            <p>{error}</p>

            <button
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">

      {/* NAVBAR */}

      <nav className="orders-navbar">
        <Link to="/" className="orders-logo">
          Shop<span>Sphere</span>
        </Link>

        <div className="orders-nav-links">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/orders" className="active">
            📦 Orders
          </Link>
          <Link to="/cart">🛒 Cart</Link>
        </div>
      </nav>

      {/* CONTENT */}

      <div className="orders-container">

        <div className="orders-title">
          <div>
            <h1>📦 My Orders</h1>
            <p>
              View and track all your ShopSphere orders.
            </p>
          </div>

          <Link
            to="/products"
            className="continue-shopping"
          >
            Continue Shopping
          </Link>
        </div>

        {/* NO ORDERS */}

        {orders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-orders-icon">
              📦
            </div>

            <h2>No orders yet</h2>

            <p>
              You haven't placed any orders yet.
              Start shopping to see your orders here.
            </p>

            <Link to="/products">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">

            {orders.map((order) => {

              const status =
                order.status || "Pending";

              const payment =
                order.payment_method || "Unknown";

              return (
                <div
                  className="order-card"
                  key={order.id}
                >

                  {/* ORDER HEADER */}

                  <div className="order-header">

                    <div>
                      <h2>
                        Order #{order.id}
                      </h2>

                      <span className="order-date">
                        Placed on{" "}
                        {new Date(
                          order.created_at
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    <span
                      className={`order-status ${status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {status}
                    </span>

                  </div>

                  {/* ORDER INFORMATION */}

                  <div className="order-info">

                    <div className="order-info-item">
                      <span>Payment</span>
                      <strong>
                        {payment.toUpperCase()}
                      </strong>
                    </div>

                    <div className="order-info-item">
                      <span>Total Amount</span>
                      <strong>
                        ₹
                        {Number(
                          order.total_amount || 0
                        ).toFixed(2)}
                      </strong>
                    </div>

                    <div className="order-info-item">
                      <span>Order Status</span>
                      <strong>{status}</strong>
                    </div>

                  </div>

                  {/* FOOTER */}

                  <div className="order-footer">

                    <span>
                      Order #{order.id}
                    </span>

                    <Link
                      to={`/orders/${order.id}`}
                      className="view-order-btn"
                    >
                      View Details →
                    </Link>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default Orders;