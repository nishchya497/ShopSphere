import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AdminSidebar from "./AdminSidebar";
import "./AdminProducts.css";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
      return;
    }

    setProducts(data || []);
    setLoading(false);
  };

  // ADD PRODUCT
  const addProduct = async (e) => {
    e.preventDefault();

    if (!name || !price || !category || !image || stock === "") {
      alert("Please fill all fields");
      return;
    }

    if (Number(stock) < 0) {
      alert("Stock cannot be negative");
      return;
    }

    const newId =
      products.length > 0
        ? Math.max(...products.map((product) => product.id)) + 1
        : 1;

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          id: newId,
          name,
          price: Number(price),
          category,
          image,
          stock: Number(stock),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding product:", error);
      alert(error.message);
      return;
    }

    setProducts([...products, data]);

    clearForm();

    alert("Product added successfully!");
  };

  // EDIT PRODUCT
  const editProduct = async (e) => {
    e.preventDefault();

    if (!name || !price || !category || !image || stock === "") {
      alert("Please fill all fields");
      return;
    }

    if (Number(stock) < 0) {
      alert("Stock cannot be negative");
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({
        name,
        price: Number(price),
        category,
        image,
        stock: Number(stock),
      })
      .eq("id", editingProduct.id);

    if (error) {
      console.error("Error updating product:", error);
      alert(error.message);
      return;
    }

    setProducts(
      products.map((product) =>
        product.id === editingProduct.id
          ? {
              ...product,
              name,
              price: Number(price),
              category,
              image,
              stock: Number(stock),
            }
          : product
      )
    );

    clearForm();

    alert("Product updated successfully!");
  };

  // DELETE PRODUCT
  const deleteProduct = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Error deleting product:", error);
      alert(error.message);
      return;
    }

    setProducts(
      products.filter((product) => product.id !== productId)
    );

    alert("Product deleted successfully!");
  };

  // CLEAR FORM
  const clearForm = () => {
    setEditingProduct(null);
    setName("");
    setPrice("");
    setCategory("");
    setImage("");
    setStock("");
  };

  // START EDITING
  const startEditing = (product) => {
    setEditingProduct(product);

    setName(product.name);
    setPrice(product.price);
    setCategory(product.category);
    setImage(product.image);
    setStock(product.stock);
  };

  // FILTER PRODUCTS
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" ||
      product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // PRODUCT SUMMARY
  const totalProducts = products.length;

  const inStockProducts = products.filter(
    (product) => product.stock > 5
  ).length;

  const lowStockProducts = products.filter(
    (product) => product.stock > 0 && product.stock <= 5
  ).length;

  const outOfStockProducts = products.filter(
    (product) => product.stock === 0
  ).length;

  return (
    <div>
      <AdminSidebar />

      <div className="admin-page">
        <h1>Manage Products</h1>

        {/* PRODUCT SUMMARY */}

        <div className="product-summary">
          <div className="summary-card">
            <span>Total Products</span>
            <strong>{totalProducts}</strong>
          </div>

          <div className="summary-card">
            <span>In Stock</span>
            <strong>{inStockProducts}</strong>
          </div>

          <div className="summary-card">
            <span>Low Stock</span>
            <strong>{lowStockProducts}</strong>
          </div>

          <div className="summary-card">
            <span>Out of Stock</span>
            <strong>{outOfStockProducts}</strong>
          </div>
        </div>

        {/* ADD / EDIT FORM */}

        <div className="admin-form">
          <h2>
            {editingProduct
              ? `Edit Product: ${editingProduct.name}`
              : "Add New Product"}
          </h2>

          <form
            onSubmit={editingProduct ? editProduct : addProduct}
          >
            <div>
              <input
                type="text"
                placeholder="Product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <br />

            <div>
              <input
                type="number"
                min="0"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <br />

            <div>
              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <br />

            <div>
              <input
                type="text"
                placeholder="Image URL"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            <br />

            <div>
              <input
                type="number"
                min="0"
                placeholder="Initial Stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>

            <br />

            <button type="submit">
              {editingProduct
                ? "Update Product"
                : "Add Product"}
            </button>

            {editingProduct && (
              <button
                type="button"
                className="cancel-btn"
                onClick={clearForm}
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* PRODUCTS TABLE */}

        <div className="products-table-container">
          <h2>All Products</h2>

          <div className="product-filters">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
            >
              <option value="All">All Categories</option>

              {[
                ...new Set(
                  products.map((product) => product.category)
                ),
              ]
                .filter(Boolean)
                .map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>
          </div>

          <p className="product-count">
            Showing {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""}
          </p>

          {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p>No products found.</p>
          ) : filteredProducts.length === 0 ? (
            <p>No products match your search or category.</p>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>

                    <td>
                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    </td>

                    <td>{product.name}</td>

                    <td>₹{product.price}</td>

                    <td>{product.category}</td>

                    <td>{product.stock}</td>

                    <td>
                      {product.stock === 0 ? (
                        <span className="product-status out-of-stock">
                          Out of Stock
                        </span>
                      ) : product.stock <= 5 ? (
                        <span className="product-status low-stock">
                          Low Stock
                        </span>
                      ) : (
                        <span className="product-status in-stock">
                          In Stock
                        </span>
                      )}
                    </td>

                    <td>
                      <button
                        className="edit-btn"
                        onClick={() =>
                          startEditing(product)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          deleteProduct(product.id)
                        }
                      >
                        Delete
                      </button>
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

export default AdminProducts;