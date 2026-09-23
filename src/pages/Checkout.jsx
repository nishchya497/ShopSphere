import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./checkout.css";
import { supabase } from "../supabaseClient";

function Checkout({ cart, setCart, session }) {
  const navigate = useNavigate();

  // Load Razorpay Checkout script
  useEffect(() => {
    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Protect checkout page
  useEffect(() => {
    if (!session) {
      alert("Please login to proceed to checkout.");
      navigate("/login");
    }
  }, [session, navigate]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleChange = (e) => {
  let value = e.target.value;

  if (e.target.name === "phone") {
    value = value.replace(/\D/g, "").slice(0, 10);
  }

  if (e.target.name === "pincode") {
    value = value.replace(/\D/g, "").slice(0, 6);
  }

  setForm({
    ...form,
    [e.target.name]: value,
  });
};

  // -----------------------------------------------------
  // CHECK STOCK BEFORE ORDER
  // -----------------------------------------------------

  const checkStock = async () => {
    for (const item of cart) {
      const { data: product, error } = await supabase
        .from("products")
        .select("id, name, stock")
        .eq("id", item.id)
        .single();

      if (error || !product) {
        alert(`Could not check stock for ${item.name}.`);
        return false;
      }

      if (product.stock < item.quantity) {
        alert(
          `${product.name} has only ${product.stock} item${
            product.stock === 1 ? "" : "s"
          } left in stock.`
        );

        return false;
      }
    }

    return true;
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!session) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    // Check stock before starting payment/order
    const stockAvailable = await checkStock();

    if (!stockAvailable) {
      return;
    }

    const selectedPayment = document.querySelector(
      'input[name="payment"]:checked'
    );

    if (!selectedPayment) {
      alert("Please select a payment method.");
      return;
    }

    const paymentMethod = selectedPayment.value;

    // =====================================================
    // CASH ON DELIVERY
    // =====================================================

    if (paymentMethod === "cod") {
      const { data: order, error: orderError } =
        await supabase
          .from("orders")
          .insert({
  user_id: session.user.id,
  total_amount: total,
  payment_method: "cod",
  status: "Pending",
  customer_name: form.name,
  phone: form.phone,
  address: form.address,
  city: form.city,
  pincode: form.pincode,
})
          .select()
          .single();

      if (orderError) {
        console.error(
          "Error creating order:",
          orderError
        );

        alert("Could not place order.");
        return;
      }

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error(
          "Error creating order items:",
          itemsError
        );

        await supabase
          .from("orders")
          .delete()
          .eq("id", order.id);

        alert("Could not save order items.");
        return;
      }

      // Reduce stock
      const { error: stockError } = await supabase.rpc(
        "decrement_order_stock",
        {
          p_order_id: order.id,
        }
      );

      if (stockError) {
        console.error(
          "Error reducing stock:",
          stockError
        );

        // Remove failed order
        await supabase
          .from("orders")
          .delete()
          .eq("id", order.id);

        alert(
          stockError.message ||
            "Could not update product stock."
        );

        return;
      }

      // Clear Supabase cart
      const { error: cartError } = await supabase
        .from("cart")
        .delete()
        .eq("user_id", session.user.id);

      if (cartError) {
        console.error(
          "Error clearing cart:",
          cartError
        );
      }

      // Clear React cart
      setCart([]);

      alert("Order placed successfully! 🎉");

      navigate(`/order-success/${order.id}`);

      return;
    }

    // =====================================================
    // RAZORPAY ONLINE PAYMENT
    // =====================================================

    try {
      // ---------------------------------------------------
      // STEP 1: Create Razorpay order
      // ---------------------------------------------------

      const response = await fetch(
        "https://axjsoqepxqbhsgqwummh.supabase.co/functions/v1/create-razorpay-order",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            amount: total,
          }),
        }
      );

      const razorpayOrder = await response.json();

      if (!response.ok) {
        console.error(
          "Razorpay order creation failed:",
          razorpayOrder
        );

        alert(
          razorpayOrder.error ||
            "Could not create Razorpay order."
        );

        return;
      }

      console.log(
        "Razorpay order created:",
        razorpayOrder
      );

      // ---------------------------------------------------
      // STEP 2: Razorpay Checkout options
      // ---------------------------------------------------

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: razorpayOrder.amount,

        currency: "INR",

        name: "ShopSphere",

        description: "ShopSphere Test Payment",

        order_id: razorpayOrder.id,

        handler: async function (paymentResponse) {
          // ------------------------------------------------
          // STEP 3: Verify Razorpay payment
          // ------------------------------------------------

          try {
            console.log(
              "Razorpay payment response:",
              paymentResponse
            );

            const verificationResponse = await fetch(
              "https://axjsoqepxqbhsgqwummh.supabase.co/functions/v1/verify-razorpay-payment",
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                  apikey:
                    import.meta.env
                      .VITE_SUPABASE_ANON_KEY,
                  Authorization: `Bearer ${session.access_token}`,
                },

                body: JSON.stringify({
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse.razorpay_signature,
                }),
              }
            );

            const verification =
              await verificationResponse.json();

            console.log(
              "Payment verification response:",
              JSON.stringify(
                verification,
                null,
                2
              )
            );

            if (
              !verificationResponse.ok ||
              !verification.verified
            ) {
              console.error(
                "Payment verification failed:",
                JSON.stringify(
                  verification,
                  null,
                  2
                )
              );

              alert(
                "Payment verification failed."
              );

              return;
            }

            console.log(
              "Payment verified successfully:",
              verification
            );

            alert(
              "Payment verified successfully! 🎉"
            );

            // ------------------------------------------------
            // STEP 4: Create ShopSphere order
            // ------------------------------------------------

            const {
              data: order,
              error: orderError,
            } = await supabase
              .from("orders")
              .insert({
  user_id: session.user.id,
  total_amount: total,
  payment_method: "razorpay",
  status: "Paid",
  customer_name: form.name,
  phone: form.phone,
  address: form.address,
  city: form.city,
  pincode: form.pincode,
})
              .select()
              .single();

            if (orderError) {
              console.error(
                "Error creating order:",
                orderError
              );

              alert(
                "Payment succeeded, but order creation failed. Please contact support."
              );

              return;
            }

            // ------------------------------------------------
            // STEP 5: Create order items
            // ------------------------------------------------

            const orderItems = cart.map((item) => ({
              order_id: order.id,
              product_id: item.id,
              quantity: item.quantity,
              price: item.price,
            }));

            const {
              error: itemsError,
            } = await supabase
              .from("order_items")
              .insert(orderItems);

            if (itemsError) {
              console.error(
                "Error creating order items:",
                itemsError
              );

              alert(
                "Payment succeeded, but order items could not be saved."
              );

              return;
            }

            // ------------------------------------------------
            // STEP 6: Reduce stock
            // ------------------------------------------------

            const { error: stockError } =
              await supabase.rpc(
                "decrement_order_stock",
                {
                  p_order_id: order.id,
                }
              );

            if (stockError) {
              console.error(
                "Error reducing stock:",
                stockError
              );

              alert(
                "Payment succeeded, but stock could not be updated. Please contact support."
              );

              return;
            }

            // ------------------------------------------------
            // STEP 7: Save payment information
            // ------------------------------------------------

            const {
              error: paymentSaveError,
            } = await supabase
              .from("payments")
              .insert({
                user_id: session.user.id,

                order_id: order.id,

                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                amount: total,

                status: "paid",
              });

            if (paymentSaveError) {
              console.error(
                "Error saving payment:",
                paymentSaveError
              );
            }

            // ------------------------------------------------
            // STEP 8: Clear cart
            // ------------------------------------------------

            const {
              error: cartError,
            } = await supabase
              .from("cart")
              .delete()
              .eq("user_id", session.user.id);

            if (cartError) {
              console.error(
                "Error clearing cart:",
                cartError
              );
            }

            setCart([]);

            // ------------------------------------------------
            // STEP 9: Success page
            // ------------------------------------------------

            navigate(
              `/order-success/${order.id}`
            );
          } catch (error) {
            console.error(
              "Verification request failed:",
              error
            );

            alert(
              "Could not verify the payment. Please contact support."
            );
          }
        },

        prefill: {
          name: form.name,
          contact: form.phone,
        },

        theme: {
          color: "#3399cc",
        },
      };

      // -----------------------------------------------------
      // STEP 10: Check Razorpay
      // -----------------------------------------------------

      if (!window.Razorpay) {
        alert(
          "Razorpay is still loading. Please try again."
        );

        return;
      }

      // -----------------------------------------------------
      // STEP 11: Open Razorpay
      // -----------------------------------------------------

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment failed:",
            response.error
          );

          alert(
            "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      alert(
        "Something went wrong while starting payment."
      );
    }
  };

  return (
    <div className="checkout-page">

      <nav className="checkout-navbar">

        <div className="logo">
          Shop<span>Sphere</span>
        </div>

        <div className="nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/products">
            Products
          </Link>

          <Link to="/cart">
  🛒 Cart (
  {cart.reduce(
    (total, item) => total + item.quantity,
    0
  )}
  )
</Link>

        </div>

      </nav>

      <div className="checkout-container">

        <h1>
          Checkout
        </h1>
        <Link to="/cart" className="back-to-cart">
  ← Back to Cart
</Link>

        <div className="checkout-content">

          {/* CUSTOMER DETAILS */}

          <form
            className="checkout-form"
            onSubmit={placeOrder}
          >

            <h2>
              Delivery Details
            </h2>

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
  type="tel"
  name="phone"
  placeholder="Phone Number"
  value={form.phone}
  onChange={handleChange}
  maxLength="10"
  pattern="[0-9]{10}"
  title="Please enter a valid 10-digit phone number"
  required
/>

            <textarea
              name="address"
              placeholder="Full Address"
              value={form.address}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              required
            />

            <input
  type="text"
  name="pincode"
  placeholder="PIN Code"
  value={form.pincode}
  onChange={handleChange}
  maxLength="6"
  pattern="[0-9]{6}"
  title="Please enter a valid 6-digit PIN code"
  required
/>

            {/* PAYMENT METHOD */}

            <div className="payment-section">

              <h2>
                Payment Method
              </h2>

              <label>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  defaultChecked
                />

                Cash on Delivery
              </label>

              <label>
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                />

                Online Payment
              </label>

              <label>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                />

                Credit/Debit Card
              </label>

            </div>

            <button
              type="submit"
              className="place-order-btn"
            >
              Place Order
            </button>

          </form>

          {/* ORDER SUMMARY */}

          <div className="checkout-summary">

            <h2>
              Order Summary
            </h2>

            {cart.map((item, index) => (

              <div
                className="checkout-item"
                key={`${item.id}-${index}`}
              >

                <img
                  src={item.image}
                  alt={item.name}
                />

                <div>

                  <h3>
                    {item.name}
                  </h3>

                  <p>
                    Qty: {item.quantity}
                  </p>

                  <strong>
                    ₹{item.price * item.quantity}
                  </strong>

                </div>

              </div>

            ))}

            <hr />

            <div className="checkout-total">

  <span>
    Total Items
  </span>

  <strong>
    {cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    )}
  </strong>

</div>

<div className="checkout-total">

  <span>
    Total
  </span>

  <strong>
    ₹{total}
  </strong>

</div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Checkout;