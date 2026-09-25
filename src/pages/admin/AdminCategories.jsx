import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AdminSidebar from "./AdminSidebar";
import "./AdminCategories.css";

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category");

      if (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
        return;
      }

      const categoryMap = {};

      data.forEach((product) => {
        if (product.category) {
          categoryMap[product.category] =
            (categoryMap[product.category] || 0) + 1;
        }
      });

      const categoryList = Object.entries(categoryMap).map(
        ([name, count]) => ({
          name,
          count,
        })
      );

      setCategories(categoryList);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalProducts = categories.reduce(
    (total, category) => total + category.count,
    0
  );

  return (
    <div>
      <AdminSidebar />

      <div className="admin-page">
        <div className="categories-table-container">
          <h1>Manage Categories</h1>

          <div className="category-summary">
            <div className="category-summary-card">
              <span>Total Categories</span>
              <strong>{categories.length}</strong>
            </div>

            <div className="category-summary-card">
              <span>Total Products</span>
              <strong>{totalProducts}</strong>
            </div>
          </div>

          <div className="category-filters">
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <p className="category-count">
            Showing {filteredCategories.length} categor
            {filteredCategories.length !== 1 ? "ies" : "y"}
          </p>

          {loading ? (
            <p>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="no-categories">No categories found.</p>
          ) : filteredCategories.length === 0 ? (
            <p className="no-categories">
              No categories match your search.
            </p>
          ) : (
            <table className="categories-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Products</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category, index) => (
                  <tr key={category.name}>
                    <td className="category-number">
                      {index + 1}
                    </td>

                    <td className="category-name">
                      {category.name}
                    </td>

                    <td>
                      <span className="category-product-count">
                        {category.count}{" "}
                        {category.count === 1
                          ? "Product"
                          : "Products"}
                      </span>
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

export default AdminCategories;