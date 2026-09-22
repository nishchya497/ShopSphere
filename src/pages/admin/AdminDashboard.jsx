import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import AdminSidebar from "./AdminSidebar";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      // Check login
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      // Check admin role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        alert("Access denied. Admins only.");
        navigate("/");
        return;
      }

      setIsAdmin(true);

      // -----------------------------
      // TOTAL ORDERS
      // -----------------------------
      const { count: ordersCount, error: ordersError } =
        await supabase
          .from("orders")
          .select("*", {
            count: "exact",
            head: true,
          });

      if (!ordersError) {
        setTotalOrders(ordersCount || 0);
      }

      // -----------------------------
      // TOTAL SALES
      // -----------------------------
      const { data: orders, error: salesError } = await supabase
        .from("orders")
        .select("total_amount");

      if (!salesError) {
        const sales = orders.reduce(
          (total, order) => total + Number(order.total_amount),
          0
        );

        setTotalSales(sales);
      }

      // -----------------------------
      // TOTAL CUSTOMERS
      // -----------------------------
      const { count: customersCount, error: customersError } =
        await supabase
          .from("profiles")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("role", "user");

      if (!customersError) {
        setTotalCustomers(customersCount || 0);
      }

      // -----------------------------
      // TOTAL PRODUCTS
      // -----------------------------
      const { count: productsCount, error: productsError } =
        await supabase
          .from("products")
          .select("*", {
            count: "exact",
            head: true,
          });

      if (!productsError) {
        setTotalProducts(productsCount || 0);
      }

      // -----------------------------
      // RECENT 5 ORDERS
      // -----------------------------
      const { data: recentOrdersData, error: recentOrdersError } =
        await supabase
          .from("orders")
          .select(
            "id, total_amount, payment_method, status, created_at"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(5);

      if (!recentOrdersError) {
        setRecentOrders(recentOrdersData || []);
      }

      setLoading(false);
    };

    loadDashboard();
  }, [navigate]);

  // -----------------------------
  // LOADING
  // -----------------------------
  if (loading) {
    return <h2>Loading dashboard...</h2>;
  }

  // -----------------------------
  // ADMIN CHECK
  // -----------------------------
  if (!isAdmin) {
    return null;
  }

  return (
    <div>
      <AdminSidebar />

      <div className="admin-dashboard">
        <h1>ShopSphere Admin Dashboard</h1>

        {/* DASHBOARD CARDS */}
        <div className="dashboard-cards">

          <div className="dashboard-card">
            <h2>📦 Total Orders</h2>
            <p>{totalOrders}</p>
          </div>

          <div className="dashboard-card">
            <h2>💰 Total Sales</h2>
            <p>₹{totalSales.toFixed(2)}</p>
          </div>

          <div className="dashboard-card">
            <h2>👥 Total Customers</h2>
            <p>{totalCustomers}</p>
          </div>

          <div className="dashboard-card">
            <h2>🛍️ Total Products</h2>
            <p>{totalProducts}</p>
          </div>

        </div>

        {/* RECENT ORDERS */}
        <div className="recent-orders">

          <h2>Recent Orders</h2>

          {recentOrders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <table border="1" cellPadding="10">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>

                    <td>
                      ₹{Number(order.total_amount).toFixed(2)}
                    </td>

                    <td>
                      {order.payment_method}
                    </td>

                    <td>
                      {order.status}
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
          )}

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;