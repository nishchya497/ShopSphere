import { Link } from "react-router-dom";
import "./cart.css";

function Cart({ cart, setCart }) {

  const increaseQuantity = (index) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity += 1;
    setCart(updatedCart);
  };

  const decreaseQuantity = (index) => {
    const updatedCart = [...cart];

    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1;
      setCart(updatedCart);
    } else {
      updatedCart.splice(index, 1);
      setCart(updatedCart);
    }
  };

  const removeFromCart = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="cart-page">

      <nav className="cart-navbar">

        <div className="logo">
          Shop<span>Sphere</span>
        </div>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">
            🛒 Cart ({cart.length})
          </Link>
        </div>

      </nav>


      <section className="cart-container">

        <h1>Shopping Cart</h1>

        {cart.length === 0 ? (

          <div className="empty-cart">

            <h2>Your cart is empty 🛒</h2>

            <p>
              Add some products to your cart.
            </p>

            <Link
              to="/products"
              className="continue-btn"
            >
              Continue Shopping
            </Link>

          </div>

        ) : (

          <>

            <div className="cart-items">

              {cart.map((item, index) => (

                <div
                  className="cart-item"
                  key={`${item.id}-${index}`}
                >

                  <img
                    src={item.image}
                    alt={item.name}
                  />

                  <div className="cart-info">

                    <h3>{item.name}</h3>

                    <p>{item.category}</p>

                    <strong>
                      ₹{item.price}
                    </strong>

                  </div>


                  {/* Quantity */}

                  <div className="quantity">

                    <button
                      onClick={() =>
                        decreaseQuantity(index)
                      }
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        increaseQuantity(index)
                      }
                    >
                      +
                    </button>

                  </div>


                  {/* Remove */}

                  <button
                    className="remove-btn"
                    onClick={() =>
                      removeFromCart(index)
                    }
                  >
                    Remove
                  </button>

                </div>

              ))}

            </div>


            {/* Summary */}

            <div className="cart-summary">

              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Items</span>
                <span>{cart.length}</span>
              </div>

              <div className="summary-row">
                <span>Total</span>

                <strong>
                  ₹{total}
                </strong>

              </div>

              <Link
                to="/checkout"
                className="checkout-btn"
              >
                Proceed to Checkout
              </Link>

            </div>

          </>

        )}

      </section>

    </div>
  );
}

export default Cart;