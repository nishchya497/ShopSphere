import AdminSidebar from "./AdminSidebar";

function AdminSettings() {
  return (
    <div>
      <AdminSidebar />

      <div>
        <h1>Admin Settings</h1>

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

        <button>Save Settings</button>
      </div>
    </div>
  );
}

export default AdminSettings;