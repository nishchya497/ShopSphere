import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./products.css";

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 1999,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 2499,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
  },
  {
    id: 3,
    name: "Running Shoes",
    price: 1799,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
  },
  {
    id: 4,
    name: "Backpack",
    price: 999,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
  },
  {
    id: 5,
    name: "Classic T-Shirt",
    price: 699,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
  },
  {
    id: 6,
    name: "Sunglasses",
    price: 899,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600",
  },
];

function Products({ cart, setCart,wishlist,
  setWishlist, }) {
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();

const [category, setCategory] = useState(
  searchParams.get("category") || "All"
);
  const [sort, setSort] = useState("default");
  const addToCart = (product) => {
  const existingProduct = cart.find(
    (item) => item.id === product.id
  );

  if (existingProduct) {
    setCart(
      cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  } else {
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
  onClick={() => {
    const exists = wishlist.find(
      (item) => item.id === product.id
    );

    if (exists) {
      setWishlist(
        wishlist.filter(
          (item) => item.id !== product.id
        )
      );
    } else {
      setWishlist([...wishlist, product]);
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

                  <strong>
                    ₹{product.price}
                  </strong>

                  <button className="add-cart" onClick={() => addToCart(product)}>
                    + Cart
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