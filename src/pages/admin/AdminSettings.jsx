import AdminSidebar from "./AdminSidebar";
import "./AdminSettings.css";

function AdminSettings() {
  return (
    <div>
      <AdminSidebar />

      <div className="admin-page">
  <h1>Admin Settings</h1>

  <div className="settings-card">

        <h2>Store Settings</h2>

        <label>Store Name</label>
        <br />
        <input type="text" value="ShopSphere" readOnly />

        <br />
        <br />

        <label>Currency</label>
        <br />
        <input type="text" value="INR (₹)" readOnly />

        <br />
        <br />

        <label>Payment Gateway</label>
        <br />
        <input type="text" value="Razorpay" readOnly />

        <br />
        <br />

        <button className="settings-button">
  Save Settings
</button>
      </div>
      </div>
    </div>
  );
}

export default AdminSettings;