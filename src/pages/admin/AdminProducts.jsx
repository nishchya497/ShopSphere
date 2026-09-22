import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AdminSidebar from "./AdminSidebar";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <AdminSidebar />

      <div>
        <h1>Manage Products</h1>

        <h2>
          {editingProduct
            ? "Edit Product"
            : "Add New Product"}
        </h2>

        <form
          onSubmit={
            editingProduct
              ? editProduct
              : addProduct
          }
        >
          <div>
            <input
              type="text"
              placeholder="Product name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </div>

          <br />

          <div>
            <input
              type="number"
              min="0"
              placeholder="Price"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value)
              }
            />
          </div>

          <br />

          <div>
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            />
          </div>

          <br />

          <div>
            <input
              type="text"
              placeholder="Image URL"
              value={image}
              onChange={(e) =>
                setImage(e.target.value)
              }
            />
          </div>

          <br />

          <div>
            <input
              type="number"
              min="0"
              placeholder="Initial Stock"
              value={stock}
              onChange={(e) =>
                setStock(e.target.value)
              }
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
              onClick={clearForm}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          )}
        </form>

        <hr />

        <h2>All Products</h2>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <table border="1" cellPadding="10">
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
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>

                  <td>
                    <img
                      src={product.image}
                      alt={product.name}
                      width="80"
                    />
                  </td>

                  <td>{product.name}</td>

                  <td>
                    ₹{product.price}
                  </td>

                  <td>
                    {product.category}
                  </td>

                  <td>{product.stock}</td>

                  <td>
                    {product.stock === 0
                      ? "Out of Stock"
                      : product.stock <= 5
                      ? "Low Stock"
                      : "In Stock"}
                  </td>

                  <td>
                    <button
                      onClick={() =>
                        startEditing(product)
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteProduct(product.id)
                      }
                      style={{
                        marginLeft: "10px",
                      }}
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
  );
}

export default AdminProducts;