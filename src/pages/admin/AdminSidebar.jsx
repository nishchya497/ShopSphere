import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <h2 className="admin-logo">
        Shop<span>Sphere</span>
      </h2>

      <p className="admin-title">ADMIN PANEL</p>

      <nav className="admin-nav">
        <NavLink to="/admin">📊 Dashboard</NavLink>
        <NavLink to="/admin/orders">📦 Orders</NavLink>
        <NavLink to="/admin/products">🛍️ Products</NavLink>
        <NavLink to="/admin/customers">👥 Customers</NavLink>
        <NavLink to="/admin/payments">💳 Payments</NavLink>
        <NavLink to="/admin/inventory">📋 Inventory</NavLink>
        <NavLink to="/admin/categories">🏷️ Categories</NavLink>
        <NavLink to="/admin/coupons">🎟️ Coupons</NavLink>
        <NavLink to="/admin/settings">⚙️ Settings</NavLink>
      </nav>
    </aside>
  );
}

export default AdminSidebar;