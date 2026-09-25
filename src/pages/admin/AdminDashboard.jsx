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
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // CHECK LOGIN
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          navigate("/login");
          return;
        }

        // CHECK ADMIN ROLE
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
          const sales = (orders || []).reduce(
            (total, order) =>
              total + Number(order.total_amount || 0),
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
        // RECENT ORDERS
        // -----------------------------
        const {
          data: recentOrdersData,
          error: recentOrdersError,
        } = await supabase
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

        // -----------------------------
        // LOW STOCK PRODUCTS
        // -----------------------------
        const {
          data: lowStockData,
          error: lowStockError,
        } = await supabase
          .from("products")
          .select("id, name, category, stock")
          .lte("stock", 5)
          .order("stock", {
            ascending: true,
          })
          .limit(5);

        if (!lowStockError) {
          setLowStockProducts(lowStockData || []);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  // -----------------------------
  // LOADING
  // -----------------------------
  if (loading) {
    return (
      <div className="admin-loading">
        <h2>Loading dashboard...</h2>
      </div>
    );
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
        <div className="dashboard-header">
          <div>
            <h1>ShopSphere Admin Dashboard</h1>
            <p>Overview of your store performance</p>
          </div>
        </div>

        {/* DASHBOARD CARDS */}

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="dashboard-card-icon">📦</div>

            <div>
              <span>Total Orders</span>
              <strong>{totalOrders}</strong>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon">💰</div>

            <div>
              <span>Total Sales</span>
              <strong>₹{totalSales.toFixed(2)}</strong>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon">👥</div>

            <div>
              <span>Total Customers</span>
              <strong>{totalCustomers}</strong>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon">🛍️</div>

            <div>
              <span>Total Products</span>
              <strong>{totalProducts}</strong>
            </div>
          </div>
        </div>

        {/* DASHBOARD SECTIONS */}

        <div className="dashboard-sections">

          {/* RECENT ORDERS */}

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Orders</h2>

              <button
                onClick={() => navigate("/admin/orders")}
                className="view-all-btn"
              >
                View All
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <p className="empty-message">
                No orders found.
              </p>
            ) : (
              <div className="dashboard-table-container">
                <table className="dashboard-table">
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
                        <td>
                          <button
                            className="order-link"
                            onClick={() =>
                              navigate(
                                `/admin/orders/${order.id}`
                              )
                            }
                          >
                            #{order.id}
                          </button>
                        </td>

                        <td>
                          ₹
                          {Number(
                            order.total_amount || 0
                          ).toFixed(2)}
                        </td>

                        <td>
                          {order.payment_method || "-"}
                        </td>

                        <td>
                          <span
                            className={`order-status ${
                              order.status
                                ?.toLowerCase()
                                .replace(/\s+/g, "-") || ""
                            }`}
                          >
                            {order.status || "Pending"}
                          </span>
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

          {/* LOW STOCK */}

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Low Stock Products</h2>

              <button
                onClick={() => navigate("/admin/inventory")}
                className="view-all-btn"
              >
                View Inventory
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="empty-message">
                All products have sufficient stock.
              </p>
            ) : (
              <div className="low-stock-list">
                {lowStockProducts.map((product) => (
                  <div
                    className="low-stock-item"
                    key={product.id}
                  >
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.category}</span>
                    </div>

                    <span
                      className={`stock-badge ${
                        product.stock === 0
                          ? "out-of-stock"
                          : "low-stock"
                      }`}
                    >
                      {product.stock === 0
                        ? "Out of Stock"
                        : `${product.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;