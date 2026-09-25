import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AdminSidebar from "./AdminSidebar";
import "./AdminInventory.css";

function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("All");

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

  const filteredProducts = products.filter((product) => {
  const matchesSearch = product.name
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesStock =
    stockFilter === "All" ||
    (stockFilter === "In Stock" && product.stock > 5) ||
    (stockFilter === "Low Stock" &&
      product.stock > 0 &&
      product.stock <= 5) ||
    (stockFilter === "Out of Stock" &&
      product.stock === 0);

  return matchesSearch && matchesStock;
});
  return (
    <div>
      <AdminSidebar />

      <div className="admin-page">
        <h1>Manage Inventory</h1>
        <div className="inventory-filters">
  <input
    type="text"
    placeholder="Search products..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
  <select
  value={stockFilter}
  onChange={(e) => setStockFilter(e.target.value)}
>
  <option value="All">All Stock</option>
  <option value="In Stock">In Stock</option>
  <option value="Low Stock">Low Stock</option>
  <option value="Out of Stock">Out of Stock</option>
</select>
</div>
<p className="inventory-count">
  Showing {filteredProducts.length} product
  {filteredProducts.length !== 1 ? "s" : ""}
</p>

        {loading ? (
          <p>Loading inventory...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
         <div className="inventory-table-container">
         <table className="inventory-table">
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
              {filteredProducts.map((product) => (
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
  {product.stock === 0 ? (
    <span className="inventory-status out-of-stock">
      Out of Stock
    </span>
  ) : product.stock <= 5 ? (
    <span className="inventory-status low-stock">
      Low Stock
    </span>
  ) : (
    <span className="inventory-status in-stock">
      In Stock
    </span>
  )}
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

export default AdminInventory;