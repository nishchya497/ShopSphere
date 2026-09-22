import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AdminSidebar from "./AdminSidebar";

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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

      const uniqueCategories = [
        ...new Set(
          data
            .map((product) => product.category)
            .filter(Boolean)
        ),
      ];

      setCategories(uniqueCategories);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <AdminSidebar />

      <div>
        <h1>Manage Categories</h1>

        {loading ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category, index) => (
                <tr key={category}>
                  <td>{index + 1}</td>
                  <td>{category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminCategories;