import { supabase } from "./supabaseClient";
import OrderSuccess from "./pages/OrderSuccess";
import Wishlist from "./pages/Wishlist";
import ProductDetails from "./pages/ProductDetails"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Checkout from "./pages/Checkout"
import Cart from "./pages/Cart"
import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Products from "./pages/products";



function Home({
  products,
  cart,
  setCart,
  wishlist,
  setWishlist,
  cartCount,
  session,
}) {
  const [search, setSearch] = useState("");
  const addToCart = async (product) => {
    if (!session) {
      alert("Please login to add products to cart.");
      return;
    }

    const existingProduct = cart.find(
      (item) => item.id === product.id
    );

    if (existingProduct) {
      const newQuantity = existingProduct.quantity + 1;

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
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          Shop<span>Sphere</span>
        </div>

        <div className="search">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button>🔍</button>
        </div>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          {session ? (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
              }}
            >
              Logout
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
          <Link to="/wishlist">
            ❤️ Wishlist
          </Link>
          <Link to="/cart" className="cart">
            🛒 Cart ({cartCount})
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <p className="small-title">WELCOME TO SHOPSPHERE</p>

          <h1>
            Everything you need.
            <br />
            <span>All in one place.</span>
          </h1>

          <p>
            Discover amazing products at great prices.
            <br />
            Shop smarter, faster and easier.
          </p>

          <Link to="/products" className="shop-btn">
            Shop Now →
          </Link>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1000"
            alt="Shopping"
          />
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <Link to="/products">View All →</Link>
        </div>

        <div className="categories">
          <Link to="/products?category=Electronics" className="category-card">
            <div>📱</div>
            <h3>Electronics</h3>
            <p>120+ Products</p>
          </Link>

          <Link to="/products?category=Fashion" className="category-card">
            <div>👕</div>
            <h3>Fashion</h3>
            <p>250+ Products</p>
          </Link>

          <Link to="/products?category=Accessories" className="category-card">
            <div>🎒</div>
            <h3>Accessories</h3>
            <p>180+ Products</p>
          </Link>

          <div className="category-card">
            <div>🏠</div>
            <h3>Home</h3>
            <p>150+ Products</p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="section products-section">
        <div className="section-header">
          <h2>Popular Products</h2>
          <Link to="/products">View All →</Link>
        </div>

        <div className="products">
          {products
            .filter((product) =>
              product.name
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((product) => (
              <div className="product-card" key={product.id}>
                <Link to={`/product/${product.id}`}>
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                </Link>

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
                <button
                  className="add-cart-btn"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>

                <div className="product-info">
                  <p className="category">{product.category}</p>

                  <h3>{product.name}</h3>

                  <div className="rating">⭐⭐⭐⭐⭐</div>

                  <div className="product-bottom">
                    <strong>₹{product.price}</strong>


                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Offer */}
      <section className="offer">
        <div>
          <p>LIMITED TIME OFFER</p>
          <h2>Get 20% OFF on your first order</h2>
          <span>Use code: WELCOME20</span>
        </div>

        <Link to="/products">Shop Now →</Link>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-logo">
          Shop<span>Sphere</span>
          <p>Your everyday shopping destination.</p>
        </div>

        <div>
          <h3>Shop</h3>
          <Link to="/products">All Products</Link>
          <a href="#">Electronics</a>
          <a href="#">Fashion</a>
          <a href="#">Accessories</a>
        </div>

        <div>
          <h3>Account</h3>
          <a href="#">Login</a>
          <a href="#">Register</a>
          <a href="#">Orders</a>
          <a href="#">Wishlist</a>
        </div>

        <div>
          <h3>Support</h3>
          <a href="#">Contact Us</a>
          <a href="#">FAQs</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms</a>
        </div>
      </footer>

      <div className="copyright">
        ©️ 2026 ShopSphere. All rights reserved.
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id");

      if (error) {
        console.error("Error fetching products:", error);
        return;
      }

      setProducts(data);
    };

    fetchProducts();
  }, []);
  useEffect(() => {
    const fetchCart = async () => {
      if (!session || products.length === 0) {
        setCart([]);
        return;
      }

      const { data, error } = await supabase
        .from("cart")
        .select("product_id, quantity")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching cart:", error);
        return;
      }

      const cartItems = data
        .map((cartItem) => {
          const product = products.find(
            (item) => item.id === cartItem.product_id
          );

          if (!product) return null;

          return {
            ...product,
            quantity: cartItem.quantity,
          };
        })
        .filter(Boolean);

      setCart(cartItems);
    };

    fetchCart();
  }, [session, products]);
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!session || products.length === 0) {
        setWishlist([]);
        return;
      }

      const { data, error } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching wishlist:", error);
        return;
      }

      const wishlistItems = data
        .map((wishlistItem) => {
          const product = products.find(
            (item) => item.id === wishlistItem.product_id
          );

          if (!product) return null;

          return product;
        })
        .filter(Boolean);

      setWishlist(wishlistItems);
    };

    fetchWishlist();
  }, [session, products]);
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              products={products}
              cart={cart}
              setCart={setCart}
              wishlist={wishlist}
              setWishlist={setWishlist}
              cartCount={cartCount}
              session={session}
            />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />
        <Route
          path="/product/:id"
          element={
            <ProductDetails
              products={products}
              cart={cart}
              setCart={setCart}
              session={session}
            />
          }
        />
        <Route
          path="/products"
          element={
            <Products
              products={products}
              cart={cart}
              setCart={setCart}
              wishlist={wishlist}
              setWishlist={setWishlist}
            />
          }
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/wishlist"
          element={
            <Wishlist
              wishlist={wishlist}
              setWishlist={setWishlist}
              session={session}
              authLoading={authLoading}
            />
          }
        />
        <Route
          path="/checkout"
          element={
            <Checkout
              cart={cart}
              setCart={setCart}
              session={session}
            />
          }
        />
        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              setCart={setCart}
              session={session}
              authLoading={authLoading}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;