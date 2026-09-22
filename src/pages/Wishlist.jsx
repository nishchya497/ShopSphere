import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./wishlist.css";

function Wishlist({ wishlist, setWishlist, session, authLoading }) {
  const navigate = useNavigate();

  useEffect(() => {
  if (authLoading) return;

  if (!session) {
    alert("Please login to view your wishlist.");
    navigate("/login");
  }
}, [session, authLoading, navigate]);

  const removeFromWishlist = async (id) => {
  if (!session) {
    return;
  }

  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", session.user.id)
    .eq("product_id", id);

  if (error) {
    console.error("Error removing from wishlist:", error);
    alert("Could not remove product from wishlist.");
    return;
  }

  setWishlist(
    wishlist.filter((item) => item.id !== id)
  );
};

  return (
    <div className="wishlist-page">

      <nav className="wishlist-navbar">
        <Link to="/" className="wishlist-logo">
          Shop<span>Sphere</span>
        </Link>

        <div>
          <Link to="/products">Products</Link>
          <Link to="/cart">
            🛒 Cart
          </Link>
        </div>
      </nav>

      <div className="wishlist-container">

        <h1>❤️ My Wishlist</h1>

        {wishlist.length === 0 ? (
          <div className="empty-wishlist">
            <h2>Your wishlist is empty</h2>
            <p>Add products you love to your wishlist.</p>

            <Link to="/products">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">

            {wishlist.map((product) => (
              <div
                className="wishlist-card"
                key={product.id}
              >

                <img
                  src={product.image}
                  alt={product.name}
                />

                <div>
                  <p>{product.category}</p>

                  <h2>{product.name}</h2>

                  <h3>₹{product.price}</h3>

                  <Link
                    to={`/product/${product.id}`}
                  >
                    View Product
                  </Link>

                  <button
                    onClick={() =>
                      removeFromWishlist(product.id)
                    }
                  >
                    Remove
                  </button>
                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default Wishlist;