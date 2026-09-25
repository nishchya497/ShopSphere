import AdminSidebar from "./AdminSidebar";
import "./AdminSettings.css";

function AdminSettings() {
  return (
    <div>
      <AdminSidebar />

      <div className="admin-page">
        <h1>Admin Settings</h1>

        <div className="settings-grid">
          {/* Store Settings */}
          <div className="settings-card">
            <h2>🏪 Store Settings</h2>
            <p className="settings-description">
              Basic information about your ShopSphere store.
            </p>

            <div className="settings-field">
              <label>Store Name</label>
              <input
                type="text"
                value="ShopSphere"
                readOnly
              />
            </div>

            <div className="settings-field">
              <label>Currency</label>
              <input
                type="text"
                value="INR (₹)"
                readOnly
              />
            </div>

            <div className="settings-field">
              <label>Payment Gateway</label>
              <input
                type="text"
                value="Razorpay"
                readOnly
              />
            </div>

            <button className="settings-button">
              Save Settings
            </button>
          </div>

          {/* Order Settings */}
          <div className="settings-card">
            <h2>📦 Order Settings</h2>
            <p className="settings-description">
              Current order and delivery configuration.
            </p>

            <div className="settings-info">
              <span>Order Statuses</span>
              <strong>
                Pending, Processing, Shipped, Delivered
              </strong>
            </div>

            <div className="settings-info">
              <span>Payment Methods</span>
              <strong>Cash on Delivery, Razorpay</strong>
            </div>

            <div className="settings-info">
              <span>Stock Management</span>
              <strong>Automatic</strong>
            </div>
          </div>

          {/* Security Settings */}
          <div className="settings-card">
            <h2>🔐 Security</h2>
            <p className="settings-description">
              Security information for the admin panel.
            </p>

            <div className="settings-info">
              <span>Authentication</span>
              <strong>Supabase Auth</strong>
            </div>

            <div className="settings-info">
              <span>Admin Access</span>
              <strong>Role Based</strong>
            </div>

            <div className="settings-info">
              <span>Database Security</span>
              <strong>Row Level Security (RLS)</strong>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="settings-card">
            <h2>💳 Payment Settings</h2>
            <p className="settings-description">
              Payment gateway configuration.
            </p>

            <div className="settings-info">
              <span>Gateway</span>
              <strong>Razorpay</strong>
            </div>

            <div className="settings-info">
              <span>Environment</span>
              <strong>Test Mode</strong>
            </div>

            <div className="settings-info">
              <span>COD</span>
              <strong>Enabled</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;