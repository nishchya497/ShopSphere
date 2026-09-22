import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AdminSidebar from "./AdminSidebar";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <AdminSidebar />

      <div>
        <h1>Manage Payments</h1>

        {loading ? (
          <p>Loading payments...</p>
        ) : payments.length === 0 ? (
          <p>No payments found.</p>
        ) : (
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Razorpay Order ID</th>
                <th>Razorpay Payment ID</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>

                  <td>
                    {payment.order_id || "N/A"}
                  </td>

                  <td>{payment.user_id}</td>

                  <td>
                    ₹{Number(payment.amount).toFixed(2)}
                  </td>

                  <td>{payment.status}</td>

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
  );
}

export default AdminPayments;