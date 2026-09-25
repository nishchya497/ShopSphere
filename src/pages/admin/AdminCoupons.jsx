import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AdminSidebar from "./AdminSidebar";
import "./AdminCoupons.css";

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumAmount, setMinimumAmount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching coupons:", error);
      setLoading(false);
      return;
    }

    setCoupons(data || []);
    setLoading(false);
  };

  const addCoupon = async (e) => {
    e.preventDefault();

    if (!code.trim() || !discountValue) {
      alert("Please fill all required fields");
      return;
    }

    const discount = Number(discountValue);
    const minimum = Number(minimumAmount) || 0;

    if (discount <= 0) {
      alert("Discount value must be greater than 0.");
      return;
    }

    if (discountType === "percentage" && discount > 100) {
      alert("Percentage discount cannot be more than 100%.");
      return;
    }

    const { data, error } = await supabase
      .from("coupons")
      .insert([
        {
          code: code.trim().toUpperCase(),
          discount_type: discountType,
          discount_value: discount,
          minimum_order_amount: minimum,
          expires_at: expiresAt || null,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding coupon:", error);
      alert(error.message);
      return;
    }

    setCoupons((prevCoupons) => [data, ...prevCoupons]);

    setCode("");
    setDiscountValue("");
    setMinimumAmount("");
    setExpiresAt("");

    alert("Coupon added successfully!");
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      coupon.code.toLowerCase().includes(searchText) ||
      coupon.discount_type.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && coupon.is_active) ||
      (statusFilter === "Inactive" && !coupon.is_active);

    return matchesSearch && matchesStatus;
  });

  const activeCoupons = coupons.filter(
    (coupon) => coupon.is_active
  ).length;

  const inactiveCoupons = coupons.filter(
    (coupon) => !coupon.is_active
  ).length;

  return (
    <div>
      <AdminSidebar />

      <div className="admin-page">
        <h1>Manage Coupons</h1>

        <div className="coupon-summary">
          <div className="coupon-summary-card">
            <span>Total Coupons</span>
            <strong>{coupons.length}</strong>
          </div>

          <div className="coupon-summary-card">
            <span>Active</span>
            <strong>{activeCoupons}</strong>
          </div>

          <div className="coupon-summary-card">
            <span>Inactive</span>
            <strong>{inactiveCoupons}</strong>
          </div>
        </div>

        <div className="coupon-form-container">
          <h2>Add Coupon</h2>

          <form onSubmit={addCoupon} className="admin-form">
            <input
              type="text"
              placeholder="Coupon Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>

            <input
              type="number"
              min="0"
              placeholder="Discount Value"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />

            <input
              type="number"
              min="0"
              placeholder="Minimum Order Amount"
              value={minimumAmount}
              onChange={(e) => setMinimumAmount(e.target.value)}
            />

            <label>Expiry Date:</label>

            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />

            <button type="submit">Add Coupon</button>
          </form>
        </div>

        <div className="coupon-list-header">
          <h2>All Coupons</h2>

          <div className="coupon-filters">
            <input
              type="text"
              placeholder="Search coupon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <p className="coupon-count">
          Showing {filteredCoupons.length} coupon
          {filteredCoupons.length !== 1 ? "s" : ""}
        </p>

        {loading ? (
          <p>Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <p>No coupons found.</p>
        ) : filteredCoupons.length === 0 ? (
          <p className="no-coupons">
            No coupons match your search or filter.
          </p>
        ) : (
          <div className="coupons-table-container">
            <table className="coupons-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Discount</th>
                  <th>Minimum Order</th>
                  <th>Expires</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="coupon-code">
                      {coupon.code}
                    </td>

                    <td>
                      {coupon.discount_type === "percentage"
                        ? "Percentage"
                        : "Fixed Amount"}
                    </td>

                    <td>
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : `₹${coupon.discount_value}`}
                    </td>

                    <td>
                      ₹{coupon.minimum_order_amount}
                    </td>

                    <td>
                      {coupon.expires_at
                        ? new Date(
                            coupon.expires_at
                          ).toLocaleString()
                        : "No expiry"}
                    </td>

                    <td>
                      <span
                        className={`coupon-status ${
                          coupon.is_active
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {coupon.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCoupons;