import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useSearchParams } from "react-router-dom";
import "./products.css";



function Products({
  products,
  cart,
  setCart,
  wishlist,
  setWishlist,
}) {
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();

  const [category, setCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [sort, setSort] = useState("default");
  const addToCart = async (product) => {
    const session = (
      await supabase.auth.getSession()
    ).data.session;

    if (!session) {
      alert("Please login to add products to cart.");
      return;
    }

    const stock = Number(product.stock || 0);

if (stock <= 0) {
  alert("This product is currently out of stock.");
  return;
}
    const existingProduct = cart.find(
      (item) => item.id === product.id
    );

    if (existingProduct) {
  const newQuantity = existingProduct.quantity + 1;

  if (newQuantity > stock) {
    alert(`Only ${stock} item${stock === 1 ? "" : "s"} available in stock.`);
    return;
  }

      const { error } = await supabase
        .from("cart")
        .update({ quantity: newQuantity })
        .eq("user_id", session.user.id)
        .eq("product_id", product.id);

      if (error) {
        console.error("Error updating cart:", error);
        alert("Could not update cart.");
        return;
      }

      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } else {
      const { error } = await supabase
        .from("cart")
        .insert({
          user_id: session.user.id,
          product_id: product.id,
          quantity: 1,
        });

      if (error) {
        console.error("Error adding to cart:", error);
        alert("Could not add product to cart.");
        return;
      }

      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
        },
      ]);
    }

    alert("Product added to cart! 🛒");
  };
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sort === "low") {
        return a.price - b.price;
      }

      if (sort === "high") {
        return b.price - a.price;
      }

      return 0;
    });

  return (
    <div className="products-page">

      {/* Navbar */}
      <nav className="products-navbar">
        <div className="logo">
          Shop<span>Sphere</span>
        </div>

        <div className="nav-links">
          <Link to="/wishlist">
            ❤️ Wishlist ({wishlist.length})
          </Link>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/login">Login</Link>
          <Link to="/cart">
            🛒 Cart ({cart.reduce((total, item) => total + item.quantity, 0)})
          </Link>
        </div>
      </nav>


      {/* Header */}
      <section className="products-header">
        <p>SHOP OUR COLLECTION</p>

        <h1>All Products</h1>

        <span>
          Find everything you need in one place.
        </span>
      </section>


      {/* Search */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>


      {/* Filters */}
      <div className="filters">

        <button
          onClick={() => setCategory("All")}
          className={category === "All" ? "active" : ""}
        >
          All
        </button>

        <button
          onClick={() => setCategory("Electronics")}
          className={category === "Electronics" ? "active" : ""}
        >
          Electronics
        </button>

        <button
          onClick={() => setCategory("Fashion")}
          className={category === "Fashion" ? "active" : ""}
        >
          Fashion
        </button>

        <button
          onClick={() => setCategory("Accessories")}
          className={category === "Accessories" ? "active" : ""}
        >
          Accessories
        </button>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="default">Sort by</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>

      </div>


      {/* Product Count */}
      <div className="product-count">
        Showing {filteredProducts.length} product
        {filteredProducts.length !== 1 ? "s" : ""}
      </div>


      {/* Products */}
      <section className="product-grid">

        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (

            <div className="product-card" key={product.id}>

              <div className="product-image">

                <img
                  src={product.image}
                  alt={product.name}
                />

                <button
                  className="wishlist"
                  onClick={async () => {
                    const session = (
                      await supabase.auth.getSession()
                    ).data.session;

                    if (!session) {
                      alert("Please login to add products to wishlist.");
                      return;
                    }

                    const exists = wishlist.find(
                      (item) => item.id === product.id
                    );

                    if (exists) {
                      const { error } = await supabase
                        .from("wishlist")
                        .delete()
                        .eq("user_id", session.user.id)
                        .eq("product_id", product.id);

                      if (error) {
                        console.error(
                          "Error removing from wishlist:",
                          error
                        );
                        alert("Could not remove product.");
                        return;
                      }

                      setWishlist(
                        wishlist.filter(
                          (item) => item.id !== product.id
                        )
                      );
                    } else {
                      const { error } = await supabase
                        .from("wishlist")
                        .insert({
                          user_id: session.user.id,
                          product_id: product.id,
                        });

                      if (error) {
                        console.error(
                          "Error adding to wishlist:",
                          error
                        );
                        alert("Could not add product to wishlist.");
                        return;
                      }

                      setWishlist([
                        ...wishlist,
                        product,
                      ]);
                    }
                  }}
                >
                  {wishlist.some(
                    (item) => item.id === product.id
                  )
                    ? "♥"
                    : "♡"}
                </button>

              </div>


              <div className="product-info">

                <p className="category">
                  {product.category}
                </p>

                <Link to={`/product/${product.id}`}>
                  <h3>{product.name}</h3>
                </Link>

                <div className="rating">
                  ⭐⭐⭐⭐⭐
                </div>


                <div className="product-bottom">

  <div>
    <strong>₹{product.price}</strong>

    {Number(product.stock || 0) === 0 ? (
      <span className="product-stock out">
        Out of Stock
      </span>
    ) : Number(product.stock || 0) <= 5 ? (
      <span className="product-stock low">
        Only {product.stock} left
      </span>
    ) : (
      <span className="product-stock available">
        In Stock
      </span>
    )}
  </div>

  <button
    className="add-cart"
    onClick={() => addToCart(product)}
    disabled={Number(product.stock || 0) <= 0}
  >
    {Number(product.stock || 0) <= 0
      ? "Out of Stock"
      : "+ Cart"}
  </button>

</div>

              </div>

            </div>

          ))
        ) : (

          <div className="no-products">
            <h2>No products found 😔</h2>
            <p>Try another search or category.</p>
          </div>

        )}

      </section>


      {/* Footer */}
      <footer className="products-footer">

        <h2>
          Shop<span>Sphere</span>
        </h2>

        <p>
          Your everyday shopping destination.
        </p>

        <Link to="/">
          ← Back to Home
        </Link>

      </footer>

    </div>
  );
}

export default Products;