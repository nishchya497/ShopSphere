import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AdminSidebar from "./AdminSidebar";

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumAmount, setMinimumAmount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

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

    setCoupons(data);
    setLoading(false);
  };

  const addCoupon = async (e) => {
    e.preventDefault();

    if (!code || !discountValue) {
      alert("Please fill all required fields");
      return;
    }

    const { data, error } = await supabase
      .from("coupons")
      .insert([
        {
          code: code.toUpperCase(),
          discount_type: discountType,
          discount_value: Number(discountValue),
          minimum_order_amount: Number(minimumAmount) || 0,
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

    setCoupons([data, ...coupons]);

    setCode("");
    setDiscountValue("");
    setMinimumAmount("");
    setExpiresAt("");

    alert("Coupon added successfully!");
  };

  return (
    <div>
      <AdminSidebar />

      <div>
        <h1>Manage Coupons</h1>

        <h2>Add Coupon</h2>

        <form onSubmit={addCoupon}>
          <input
            type="text"
            placeholder="Coupon Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <br />
          <br />

          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>

          <br />
          <br />

          <input
            type="number"
            min="0"
            placeholder="Discount Value"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
          />

          <br />
          <br />

          <input
            type="number"
            min="0"
            placeholder="Minimum Order Amount"
            value={minimumAmount}
            onChange={(e) => setMinimumAmount(e.target.value)}
          />

          <br />
          <br />

          <label>Expiry Date:</label>

          <br />

          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />

          <br />
          <br />

          <button type="submit">Add Coupon</button>
        </form>

        <hr />

        <h2>All Coupons</h2>

        {loading ? (
          <p>Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <p>No coupons found.</p>
        ) : (
          <table border="1" cellPadding="10">
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
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>{coupon.code}</td>

                  <td>{coupon.discount_type}</td>

                  <td>
                    {coupon.discount_type === "percentage"
                      ? `${coupon.discount_value}%`
                      : `₹${coupon.discount_value}`}
                  </td>

                  <td>₹{coupon.minimum_order_amount}</td>

                  <td>
                    {coupon.expires_at
                      ? new Date(
                          coupon.expires_at
                        ).toLocaleString()
                      : "No expiry"}
                  </td>

                  <td>
                    {coupon.is_active
                      ? "Active"
                      : "Inactive"}
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

export default AdminCoupons;