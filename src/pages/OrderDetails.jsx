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
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const handleCancelOrder = async () => {
  const confirmed = window.confirm(
    "Are you sure you want to cancel this order?"
  );

  if (!confirmed) return;

  setCancelling(true);

  const { error } = await supabase.rpc(
    "cancel_order",
    {
      p_order_id: Number(orderId),
    }
  );

  if (error) {
    console.error(
      "Error cancelling order:",
      error
    );

    alert(
      error.message ||
        "Could not cancel the order."
    );

    setCancelling(false);
    return;
  }

  alert("Order cancelled successfully! ✅");

  setOrder({
    ...order,
    status: "Cancelled",
  });

  setCancelling(false);
};

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      alert("Please login to view your order.");
      navigate("/login");
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch order
        const { data: orderData, error: orderError } =
          await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .eq("user_id", session.user.id)
            .single();

        if (orderError) {
          console.error(
            "Error fetching order:",
            orderError
          );

          setError("Order not found.");
          setLoading(false);
          return;
        }

        // Fetch order items
        const { data: itemData, error: itemError } =
          await supabase
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
          console.error(
            "Error fetching order items:",
            itemError
          );

          setError("Unable to load ordered products.");
          setLoading(false);
          return;
        }

        setOrder(orderData);
        setItems(itemData || []);
      } catch (err) {
        console.error(
          "Unexpected error:",
          err
        );

        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [
    session,
    authLoading,
    orderId,
    navigate,
  ]);

  if (authLoading || loading) {
    return (
      <div className="order-details-loading">
        <div className="loading-spinner"></div>
        <h2>Loading order...</h2>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-error">
        <h2>❌ {error || "Order not found"}</h2>

        <Link to="/orders">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const orderDate = new Date(
    order.created_at
  );

  const formattedDate =
    orderDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formattedTime =
    orderDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const subtotal = items.reduce(
    (total, item) =>
      total +
      Number(item.price) *
        Number(item.quantity),
    0
  );

  const statusClass =
    order.status
      ?.toLowerCase()
      .replace(/\s+/g, "-") || "pending";
      const canCancel =
  order.status === "Pending" ||
  order.status === "Processing";

  return (
    <div className="order-details-page">

      {/* Navbar */}
      <nav className="order-details-navbar">

        <Link
          to="/"
          className="order-details-logo"
        >
          Shop<span>Sphere</span>
        </Link>

        <div className="order-details-nav-links">
          <Link to="/">Home</Link>

          <Link to="/products">
            Products
          </Link>

          <Link to="/orders">
            📦 Orders
          </Link>

          <Link to="/cart">
            🛒 Cart
          </Link>
        </div>

      </nav>

      {/* Main Content */}
      <div className="order-details-container">

        {/* Back */}
        <Link
          to="/orders"
          className="back-orders-btn"
        >
          ← Back to Orders
        </Link>

        {/* Header */}
        <div className="order-details-header">

          <div>
            <p className="order-label">
              Order Details
            </p>

            <h1>
              Order #{order.id}
            </h1>

            <p className="order-date">
              Placed on {formattedDate} at{" "}
              {formattedTime}
            </p>
          </div>

          <span
            className={`order-status ${statusClass}`}
          >
            {order.status}
          </span>

        </div>

        {/* Order Progress */}
        <div className="order-progress">

          <div
            className={`progress-step ${
              ["Pending", "Processing", "Shipped", "Delivered"]
                .includes(order.status)
                ? "active"
                : ""
            }`}
          >
            <span>1</span>
            <p>Order Placed</p>
          </div>

          <div
            className={`progress-line ${
              ["Processing", "Shipped", "Delivered"]
                .includes(order.status)
                ? "active"
                : ""
            }`}
          ></div>

          <div
            className={`progress-step ${
              ["Processing", "Shipped", "Delivered"]
                .includes(order.status)
                ? "active"
                : ""
            }`}
          >
            <span>2</span>
            <p>Processing</p>
          </div>

          <div
            className={`progress-line ${
              ["Shipped", "Delivered"]
                .includes(order.status)
                ? "active"
                : ""
            }`}
          ></div>

          <div
            className={`progress-step ${
              ["Shipped", "Delivered"]
                .includes(order.status)
                ? "active"
                : ""
            }`}
          >
            <span>3</span>
            <p>Shipped</p>
          </div>

          <div
            className={`progress-line ${
              order.status === "Delivered"
                ? "active"
                : ""
            }`}
          ></div>

          <div
            className={`progress-step ${
              order.status === "Delivered"
                ? "active"
                : ""
            }`}
          >
            <span>4</span>
            <p>Delivered</p>
          </div>

        </div>

        {/* Order Information */}
        <div className="order-info-grid">

          {/* Payment */}
          <div className="order-info-box">

            <h3>💳 Payment Information</h3>

            <p>
              <strong>Method:</strong>{" "}
              {order.payment_method
                ? order.payment_method.toUpperCase()
                : "N/A"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span className="payment-status">
                {order.payment_method
                  ?.toLowerCase() === "cod"
                  ? "Cash on Delivery"
                  : "Paid"}
              </span>
            </p>

          </div>

          {/* Delivery */}
          <div className="order-info-box">

            <h3>📍 Delivery Address</h3>

            <p>
              <strong>
                {order.customer_name ||
                  "Customer"}
              </strong>
            </p>

            <p>
              {order.address ||
                "Address not available"}
            </p>

            <p>
              {order.city || ""}
              {order.pincode
                ? ` - ${order.pincode}`
                : ""}
            </p>

            {order.phone && (
              <p>
                📞 {order.phone}
              </p>
            )}

          </div>

        </div>

        {/* Products */}
        <div className="ordered-products-section">

          <h2>🛍️ Ordered Products</h2>

          <div className="order-items">

            {items.length === 0 ? (
              <p className="no-items">
                No products found for this order.
              </p>
            ) : (
              items.map((item, index) => {

                const itemSubtotal =
                  Number(item.price) *
                  Number(item.quantity);

                return (
                  <div
                    className="order-item"
                    key={`${item.product_id}-${index}`}
                  >

                    <img
                      src={
                        item.products?.image ||
                        "https://via.placeholder.com/100"
                      }
                      alt={
                        item.products?.name ||
                        "Product"
                      }
                    />

                    <div className="order-item-info">

                      <h3>
                        {item.products?.name ||
                          "Product unavailable"}
                      </h3>

                      <p>
                        Price: ₹
                        {Number(
                          item.price
                        ).toLocaleString("en-IN")}
                      </p>

                      <p>
                        Quantity:{" "}
                        {item.quantity}
                      </p>

                    </div>

                    <div className="order-item-subtotal">

                      <span>
                        Subtotal
                      </span>

                      <strong>
                        ₹
                        {itemSubtotal.toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>

                  </div>
                );
              })
            )}

          </div>

        </div>

        {/* Order Summary */}
        <div className="order-summary">

          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Items Total</span>

            <span>
              ₹
              {subtotal.toLocaleString(
                "en-IN"
              )}
            </span>
          </div>

          <div className="summary-row">
            <span>Delivery</span>

            <span className="free-delivery">
              FREE
            </span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-total">
            <span>Total Amount</span>

            <strong>
              ₹
              {Number(
                order.total_amount
              ).toLocaleString("en-IN")}
            </strong>
          </div>

        </div>

        {/* Bottom Actions */}
        {/* Bottom Actions */}
<div className="order-actions">

  <Link
    to="/orders"
    className="back-orders-btn bottom-btn"
  >
    ← Back to Orders
  </Link>

  <div className="order-action-buttons">

    {canCancel && (
      <button
        className="cancel-order-btn"
        disabled={cancelling}
        onClick={handleCancelOrder}
      >
        {cancelling
          ? "Cancelling..."
          : "Cancel Order"}
      </button>
    )}

    <Link
      to="/products"
      className="continue-shopping-btn"
    >
      Continue Shopping →
    </Link>

  </div>

</div>

      </div>

    </div>
  );
}

export default OrderDetails;