import { supabase } from "./supabaseClient";
import OrderSuccess from "./pages/OrderSuccess";
import Wishlist from "./pages/Wishlist";
import ProductDetails from "./pages/ProductDetails";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import { useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import Products from "./pages/products";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";


/* =====================================================
   HOME
===================================================== */

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

  /* ================= CATEGORY COUNTS ================= */

  const categoryCounts = products.reduce(
    (counts, product) => {
      const category = product.category;

      if (category) {
        counts[category] =
          (counts[category] || 0) + 1;
      }

      return counts;
    },
    {}
  );


  /* ================= ADD TO CART ================= */

  const addToCart = async (product) => {
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
      const newQuantity =
        existingProduct.quantity + 1;

      if (newQuantity > stock) {
        alert(
          `Only ${stock} item${
            stock === 1 ? "" : "s"
          } available in stock.`
        );
        return;
      }

      const { error } = await supabase
        .from("cart")
        .update({
          quantity: newQuantity,
        })
        .eq("user_id", session.user.id)
        .eq("product_id", product.id);

      if (error) {
        console.error(
          "Error updating cart:",
          error
        );

        alert("Could not update cart.");
        return;
      }

      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: newQuantity,
              }
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
        console.error(
          "Error adding to cart:",
          error
        );

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


  /* ================= FILTER PRODUCTS ================= */

  const filteredProducts = products.filter((product) =>
  product.name
    .toLowerCase()
    .includes(search.trim().toLowerCase())
);


  return (
    <div className="app">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <div className="logo">
          Shop<span>Sphere</span>
        </div>

        <div className="search">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button>🔍</button>
        </div>

        <div className="nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/products">
            Products
          </Link>

          {session && (
            <Link to="/profile">
              👤 Profile
            </Link>
          )}

          {session ? (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
              }}
            >
              Logout
            </button>
          ) : (
            <Link to="/login">
              Login
            </Link>
          )}

          <Link to="/wishlist">
            ❤️ Wishlist
          </Link>

          <Link to="/orders">
            📦 Orders
          </Link>

          <Link
            to="/cart"
            className="cart"
          >
            🛒 Cart ({cartCount})
          </Link>

        </div>

      </nav>


      {/* ================= HERO ================= */}

      <section className="hero">

        <div className="hero-content">

          <p className="small-title">
            WELCOME TO SHOPSPHERE
          </p>

          <h1>
            Everything you need.
            <br />

            <span>
              All in one place.
            </span>
          </h1>

          <p>
            Discover amazing products at great
            prices.
            <br />
            Shop smarter, faster and easier.
          </p>

          <Link
            to="/products"
            className="shop-btn"
          >
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


      {/* ================= CATEGORIES ================= */}

      <section className="section">

        <div className="section-header">

          <h2>
            Shop by Category
          </h2>

          <Link to="/products">
            View All →
          </Link>

        </div>


        <div className="categories">

          <Link
            to="/products?category=Electronics"
            className="category-card"
          >

            <div>
              📱
            </div>

            <h3>
              Electronics
            </h3>

            <p>
              {categoryCounts.Electronics || 0} Products
            </p>

          </Link>


          <Link
            to="/products?category=Fashion"
            className="category-card"
          >

            <div>
              👕
            </div>

            <h3>
              Fashion
            </h3>

            <p>
              {categoryCounts.Fashion || 0} Products
            </p>

          </Link>


          <Link
            to="/products?category=Accessories"
            className="category-card"
          >

            <div>
              🎒
            </div>

            <h3>
              Accessories
            </h3>

            <p>
              {categoryCounts.Accessories || 0} Products
            </p>

          </Link>


          <Link
            to="/products"
            className="category-card"
          >

            <div>
              🛍️
            </div>

            <h3>
              All Products
            </h3>

            <p>
              {products.length} Products
            </p>

          </Link>

        </div>

      </section>


      {/* ================= PRODUCTS ================= */}

      <section className="section products-section">

        <div className="section-header">

          <h2>
            Popular Products
          </h2>

          <Link to="/products">
            View All →
          </Link>

        </div>


        <div className="products">

          {filteredProducts.length === 0 ? (

            <p>
              No products found.
            </p>

          ) : (

            filteredProducts.map(
              (product) => {

                const stock = Number(
                  product.stock || 0
                );

                return (

                  <div
                    className="product-card"
                    key={product.id}
                  >

                    {/* IMAGE */}

                    <Link
                      to={`/product/${product.id}`}
                    >

                      <div className="product-image">

                        <img
                          src={product.image}
                          alt={product.name}
                        />

                      </div>

                    </Link>


                    {/* WISHLIST */}

                    <button
                      className="wishlist"
                      onClick={() => {

                        const exists =
                          wishlist.find(
                            (item) =>
                              item.id ===
                              product.id
                          );

                        if (exists) {

                          setWishlist(
                            wishlist.filter(
                              (item) =>
                                item.id !==
                                product.id
                            )
                          );

                        } else {

                          setWishlist([
                            ...wishlist,
                            product,
                          ]);

                        }

                      }}
                    >

                      {wishlist.some(
                        (item) =>
                          item.id === product.id
                      )
                        ? "♥"
                        : "♡"}

                    </button>


                    {/* ADD TO CART */}

                    <button
                      className="add-cart-btn"
                      onClick={() =>
                        addToCart(product)
                      }
                      disabled={stock === 0}
                    >

                      {stock === 0
                        ? "Out of Stock"
                        : "Add to Cart"}

                    </button>


                    {/* PRODUCT INFO */}

                    <div className="product-info">

                      <p className="category">
                        {product.category}
                      </p>

                      <h3>
                        {product.name}
                      </h3>

                      <div className="rating">
                        ⭐⭐⭐⭐⭐
                      </div>


                      <div className="product-bottom">

                        <strong>
                          ₹{product.price}
                        </strong>


                        {stock === 0 ? (

                          <span className="stock-status out">
                            Out of Stock
                          </span>

                        ) : stock <= 5 ? (

                          <span className="stock-status low">
                            Only {stock} left
                          </span>

                        ) : (

                          <span className="stock-status available">
                            In Stock
                          </span>

                        )}

                      </div>

                    </div>

                  </div>

                );
              }
            )

          )}

        </div>

      </section>


      {/* ================= OFFER ================= */}

      <section className="offer">

        <div>

          <p>
            LIMITED TIME OFFER
          </p>

          <h2>
            Get 20% OFF on your first order
          </h2>

          <span>
            Use code: WELCOME20
          </span>

        </div>

        <Link to="/products">
          Shop Now →
        </Link>

      </section>


      {/* ================= FOOTER ================= */}

      <footer>

        <div className="footer-logo">

          Shop<span>Sphere</span>

          <p>
            Your everyday shopping destination.
          </p>

        </div>


        <div>

          <h3>
            Shop
          </h3>

          <Link to="/products">
            All Products
          </Link>

          <Link to="/products?category=Electronics">
            Electronics
          </Link>

          <Link to="/products?category=Fashion">
            Fashion
          </Link>

          <Link to="/products?category=Accessories">
            Accessories
          </Link>

        </div>


        <div>

          <h3>
            Account
          </h3>

          <Link to="/login">
            Login
          </Link>

          <Link to="/register">
            Register
          </Link>

          <Link to="/orders">
            Orders
          </Link>

          <Link to="/wishlist">
            Wishlist
          </Link>

        </div>


        <div>

          <h3>
            Support
          </h3>

          <a href="#">
            Contact Us
          </a>

          <a href="#">
            FAQs
          </a>

          <a href="#">
            Privacy Policy
          </a>

          <a href="#">
            Terms
          </a>

        </div>

      </footer>


      <div className="copyright">
        ©️ 2026 ShopSphere. All rights reserved.
      </div>

    </div>
  );
}


/* =====================================================
   APP
===================================================== */

function App() {

  const [session, setSession] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [cart, setCart] =
    useState([]);

  const [wishlist, setWishlist] =
    useState([]);

  const [products, setProducts] =
    useState([]);


  /* ================= AUTH ================= */

  useEffect(() => {

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {

        setSession(session);
        setAuthLoading(false);

      });


    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {

          setSession(session);

        }
      );


    return () =>
      subscription.unsubscribe();

  }, []);


  /* ================= PRODUCTS ================= */

  useEffect(() => {

    const fetchProducts = async () => {

      const {
        data,
        error,
      } = await supabase
        .from("products")
        .select("*")
        .order("id");


      if (error) {

        console.error(
          "Error fetching products:",
          error
        );

        return;
      }


      setProducts(data || []);

    };


    fetchProducts();

  }, []);


  /* ================= CART ================= */

  useEffect(() => {

    const fetchCart = async () => {

      if (
        !session ||
        products.length === 0
      ) {

        setCart([]);

        return;
      }


      const {
        data,
        error,
      } = await supabase
        .from("cart")
        .select(
          "product_id, quantity"
        )
        .eq(
          "user_id",
          session.user.id
        );


      if (error) {

        console.error(
          "Error fetching cart:",
          error
        );

        return;
      }


      const cartItems = data
        .map((cartItem) => {

          const product =
            products.find(
              (item) =>
                item.id ===
                cartItem.product_id
            );


          if (!product) {
            return null;
          }


          return {
            ...product,
            quantity:
              cartItem.quantity,
          };

        })
        .filter(Boolean);


      setCart(cartItems);

    };


    fetchCart();

  }, [session, products]);


  /* ================= WISHLIST ================= */

  useEffect(() => {

    const fetchWishlist = async () => {

      if (
        !session ||
        products.length === 0
      ) {

        setWishlist([]);

        return;
      }


      const {
        data,
        error,
      } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq(
          "user_id",
          session.user.id
        );


      if (error) {

        console.error(
          "Error fetching wishlist:",
          error
        );

        return;
      }


      const wishlistItems = data
        .map((wishlistItem) => {

          const product =
            products.find(
              (item) =>
                item.id ===
                wishlistItem.product_id
            );


          if (!product) {
            return null;
          }


          return product;

        })
        .filter(Boolean);


      setWishlist(wishlistItems);

    };


    fetchWishlist();

  }, [session, products]);


  /* ================= CART COUNT ================= */

  const cartCount =
    cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );


  /* ================= ROUTES ================= */

  return (

    <BrowserRouter>

      <Routes>

        {/* CUSTOMER */}

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


        <Route
          path="/login"
          element={<Login />}
        />


        <Route
          path="/register"
          element={<Register />}
        />


        <Route
          path="/order-success/:orderId"
          element={<OrderSuccess />}
        />


        <Route
          path="/profile"
          element={
            <Profile
              session={session}
              authLoading={authLoading}
            />
          }
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


        <Route
          path="/orders"
          element={
            <Orders
              session={session}
              authLoading={authLoading}
            />
          }
        />


        <Route
          path="/orders/:orderId"
          element={
            <OrderDetails
              session={session}
              authLoading={authLoading}
            />
          }
        />


        {/* ADMIN */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />


        <Route
          path="/admin/orders"
          element={<AdminOrders />}
        />


        <Route
          path="/admin/orders/:orderId"
          element={<AdminOrderDetails />}
        />


        <Route
          path="/admin/products"
          element={<AdminProducts />}
        />


        <Route
          path="/admin/customers"
          element={<AdminCustomers />}
        />


        <Route
          path="/admin/payments"
          element={<AdminPayments />}
        />


        <Route
          path="/admin/inventory"
          element={<AdminInventory />}
        />


        <Route
          path="/admin/categories"
          element={<AdminCategories />}
        />


        <Route
          path="/admin/coupons"
          element={<AdminCoupons />}
        />


        <Route
          path="/admin/settings"
          element={<AdminSettings />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;