import { Link, useParams } from "react-router-dom";
import "./orderSuccess.css";

function OrderSuccess() {
  const { orderId } = useParams();

  return (
    <div className="success-page">
      <div className="success-box">

        <div className="success-icon">✓</div>

        <h1>Order Placed Successfully!</h1>

        <p className="success-message">
          Thank you for shopping with ShopSphere.
        </p>

        <div className="order-info">

          <p>
            <strong>Order ID:</strong> #{orderId}
          </p>

          <p>
            <strong>Status:</strong> Pending
          </p>

          <p>
            <strong>Delivery:</strong>{" "}
            Expected within 3–5 business days
          </p>

        </div>

        <div className="success-buttons">

          <Link
            to="/products"
            className="continue-btn"
          >
            Continue Shopping
          </Link>

          <Link
            to="/"
            className="home-btn"
          >
            Back to Home
          </Link>

        </div>

      </div>
    </div>
  );
}

export default OrderSuccess;