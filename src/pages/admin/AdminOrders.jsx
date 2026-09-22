import "./AdminOrders.css";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AdminSidebar from "./AdminSidebar";
import { Link } from "react-router-dom";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
      return;
    }

    setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
      })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order status:", error);
      alert(error.message);
      return;
    }

    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      )
    );

    alert("Order status updated successfully!");
  };

  return (
    <div>
      <AdminSidebar />

      <div className="admin-page">
        <h1>Manage Orders</h1>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="admin-table-container">
  <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Total Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
  <Link
    to={`/admin/orders/${order.id}`}
    className="order-link"
  >
    #{order.id}
  </Link>
</td>

                  <td>{order.user_id}</td>

                  <td>
                    ₹{Number(order.total_amount).toFixed(2)}
                  </td>

                  <td>{order.payment_method}</td>

                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(
                          order.id,
                          e.target.value
                        )
                      }
                    >
                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Processing">
                        Processing
                      </option>

                      <option value="Shipped">
                        Shipped
                      </option>

                      <option value="Delivered">
                        Delivered
                      </option>

                      <option value="Cancelled">
                        Cancelled
                      </option>
                    </select>
                  </td>

                  <td>
                    {new Date(
                      order.created_at
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;