import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AdminSidebar from "./AdminSidebar";

function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, stock")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching inventory:", error);
        setLoading(false);
        return;
      }

      setProducts(data);
      setLoading(false);
    };

    fetchInventory();
  }, []);

  const updateStock = async (productId, newStock) => {
    const stockValue = Number(newStock);

    if (stockValue < 0 || Number.isNaN(stockValue)) {
      alert("Stock cannot be negative.");
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({ stock: stockValue })
      .eq("id", productId);

    if (error) {
      console.error("Error updating stock:", error);
      alert(error.message);
      return;
    }

    setProducts(
      products.map((product) =>
        product.id === productId
          ? { ...product, stock: stockValue }
          : product
      )
    );

    alert("Stock updated successfully!");
  };

  return (
    <div>
      <AdminSidebar />

      <div>
        <h1>Manage Inventory</h1>

        {loading ? (
          <p>Loading inventory...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Update Stock</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>

                  <td>{product.name}</td>

                  <td>{product.category}</td>

                  <td>{product.stock}</td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      defaultValue={product.stock}
                      id={`stock-${product.id}`}
                    />

                    <button
                      onClick={() => {
                        const value = document.getElementById(
                          `stock-${product.id}`
                        ).value;

                        updateStock(product.id, value);
                      }}
                    >
                      Update
                    </button>
                  </td>

                  <td>
                    {product.stock === 0
                      ? "Out of Stock"
                      : product.stock <= 5
                      ? "Low Stock"
                      : "In Stock"}
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

export default AdminInventory;