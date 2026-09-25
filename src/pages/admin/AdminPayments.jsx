import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AdminSidebar from "./AdminSidebar";
import "./AdminPayments.css";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching payments:", error);
      setLoading(false);
      return;
    }

    setPayments(data || []);
    setLoading(false);
  };

  const filteredPayments = payments.filter((payment) => {
  const searchText = search.toLowerCase();

  const matchesSearch =
    String(payment.id).includes(searchText) ||
    String(payment.order_id || "").includes(searchText) ||
    String(payment.user_id || "")
      .toLowerCase()
      .includes(searchText) ||
    String(payment.razorpay_payment_id || "")
      .toLowerCase()
      .includes(searchText);

  const matchesStatus =
    statusFilter === "All" ||
    payment.status === statusFilter;

  return matchesSearch && matchesStatus;
});
  return (
    <div>
      <AdminSidebar />

      <div className="admin-page">
        <h1>Manage Payments</h1>
        <div className="payment-filters">
  <input
    type="text"
    placeholder="Search payment, order, user or Razorpay ID..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
  <select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
>
  <option value="All">All Status</option>
  <option value="created">Created</option>
  <option value="paid">Paid</option>
  <option value="success">Success</option>
  <option value="failed">Failed</option>
</select>
</div>
<p className="payment-count">
  Showing {filteredPayments.length} payment
  {filteredPayments.length !== 1 ? "s" : ""}
</p>

        <div className="payments-table-container">
          {loading ? (
            <p>Loading payments...</p>
          ) : payments.length === 0 ? (
            <p>No payments found.</p>
          ) : (
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Order ID</th>
                  <th>User ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Razorpay Order ID</th>
                  <th>Razorpay Payment ID</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>

                    <td>
                      {payment.order_id || "N/A"}
                    </td>

                    <td>
                      {payment.user_id}
                    </td>

                    <td>
                      ₹{Number(payment.amount).toFixed(2)}
                    </td>

                    <td>
                      <span
                        className={`payment-status ${payment.status}`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td>
                      {payment.razorpay_order_id || "N/A"}
                    </td>

                    <td>
                      {payment.razorpay_payment_id || "N/A"}
                    </td>

                    <td>
                      {new Date(
                        payment.created_at
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPayments;