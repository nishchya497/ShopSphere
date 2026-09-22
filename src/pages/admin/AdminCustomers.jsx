import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AdminSidebar from "./AdminSidebar";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

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

      setCustomers(data);
      setLoading(false);
    };

    fetchCustomers();
  }, []);

  return (
    <div>
      <AdminSidebar />

      <div>
        <h1>Manage Customers</h1>

        {loading ? (
          <p>Loading customers...</p>
        ) : customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name || "Not provided"}</td>
                  <td>{customer.phone || "Not provided"}</td>
                  <td>{customer.role}</td>
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
  );
}

export default AdminCustomers;