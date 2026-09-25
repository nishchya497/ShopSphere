import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AdminSidebar from "./AdminSidebar";
import "./AdminCustomers.css";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, phone, role, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching customers:", error);
        setLoading(false);
        return;
      }

      setCustomers(data || []);
      setLoading(false);
    };

    fetchCustomers();
  }, []);

  
  const filteredCustomers = customers.filter((customer) => {
  const searchText = search.toLowerCase();

  const adminCount = customers.filter(
  (customer) => customer.role === "admin"
).length;

const userCount = customers.filter(
  (customer) => customer.role === "user"
).length;
  return (
    (customer.name || "").toLowerCase().includes(searchText) ||
    (customer.phone || "").toLowerCase().includes(searchText) ||
    (customer.role || "").toLowerCase().includes(searchText)
  );
});
const adminCount = customers.filter(
  (customer) => customer.role === "admin"
).length;

const userCount = customers.filter(
  (customer) => customer.role === "user"
).length;
return (
    <div>
      <AdminSidebar />

      <div className="admin-page">
        <h1>Manage Customers</h1>
        <div className="customer-summary">
  <div className="customer-summary-card">
    <span>Total Customers</span>
    <strong>{customers.length}</strong>
  </div>

  <div className="customer-summary-card">
    <span>Users</span>
    <strong>{userCount}</strong>
  </div>

  <div className="customer-summary-card">
    <span>Admins</span>
    <strong>{adminCount}</strong>
  </div>
</div>
        <div className="customer-filters">
  <input
    type="text"
    placeholder="Search by name, phone or role..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
</div>
<p className="customer-count">
  Showing {filteredCustomers.length} customer
  {filteredCustomers.length !== 1 ? "s" : ""}
</p>

        <div className="customers-table-container">
          {loading ? (
  <p>Loading customers...</p>
) : customers.length === 0 ? (
  <p>No customers found.</p>
) : filteredCustomers.length === 0 ? (
  <p className="no-customers">
    No customers match your search.
  </p>
) : (
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      {customer.name || "Not provided"}
                    </td>

                    <td>
                      {customer.phone || "Not provided"}
                    </td>

                    <td>
                      <span className="customer-role">
                        {customer.role}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        customer.created_at
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

export default AdminCustomers;