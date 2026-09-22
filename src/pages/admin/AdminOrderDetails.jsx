import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import AdminSidebar from "./AdminSidebar";

function AdminOrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError) {
      console.error("Error fetching order:", orderError);
      setLoading(false);
      return;
    }

    const { data: itemData, error: itemError } = await supabase
      .from("order_items")
      .select(`
        id,
        quantity,
        price,
        product_id,
        products (
          name,
          image
        )
      `)
      .eq("order_id", orderId);

    if (itemError) {
      console.error("Error fetching order items:", itemError);
      setLoading(false);
      return;
    }

    setOrder(orderData);
    setItems(itemData || []);
    setLoading(false);
  };

  if (loading) {
    return <h2>Loading order details...</h2>;
  }

  if (!order) {
    return <h2>Order not found</h2>;
  }

  return (
    <div>
      <AdminSidebar />

      <div>
        <h1>Order Details</h1>

        <Link to="/admin/orders">
          ← Back to Orders
        </Link>

        <hr />

        <h2>Order #{order.id}</h2>

        <p>
          <strong>Order Date:</strong>{" "}
          {new Date(order.created_at).toLocaleString()}
        </p>

        <p>
          <strong>User ID:</strong> {order.user_id}
        </p>

        <p>
          <strong>Payment Method:</strong>{" "}
          {order.payment_method}
        </p>

        <p>
          <strong>Status:</strong> {order.status}
        </p>

        <hr />

        <h2>Products</h2>

        {items.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img
                      src={item.products?.image}
                      alt={item.products?.name}
                      width="70"
                    />
                  </td>

                  <td>
                    {item.products?.name || "Product"}
                  </td>

                  <td>{item.quantity}</td>

                  <td>
                    ₹{Number(item.price).toFixed(2)}
                  </td>

                  <td>
                    ₹
                    {(
                      Number(item.price) *
                      Number(item.quantity)
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <hr />

        <h2>
          Total Amount: ₹
          {Number(order.total_amount).toFixed(2)}
        </h2>
      </div>
    </div>
  );
}

export default AdminOrderDetails;