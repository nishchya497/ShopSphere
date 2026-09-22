import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./orders.css";

function Orders({ session, authLoading }) {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!session) {
            alert("Please login to view your orders.");
            navigate("/login");
            return;
        }

        const fetchOrders = async () => {
            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .eq("user_id", session.user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching orders:", error);
                return;
            }

            setOrders(data);
            setLoading(false);
        };

        fetchOrders();
    }, [session, authLoading, navigate]);

    if (authLoading || loading) {
        return <h2>Loading orders...</h2>;
    }

    return (
        <div className="orders-page">

            <nav className="orders-navbar">
                <Link to="/" className="orders-logo">
                    Shop<span>Sphere</span>
                </Link>

                <div>
                    <Link to="/">Home</Link>
                    <Link to="/products">Products</Link>
                    <Link to="/orders">📦 Orders</Link>
                    <Link to="/cart">🛒 Cart</Link>
                </div>
            </nav>

            <div className="orders-container">

                <h1>📦 My Orders</h1>

                {orders.length === 0 ? (
                    <div className="empty-orders">
                        <h2>No orders yet</h2>
                        <p>Your placed orders will appear here.</p>

                        <Link to="/products">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="orders-list">

                        {orders.map((order) => (
                            <Link
                                to={`/orders/${order.id}`}
                                className="order-card"
                                key={order.id}
                            >

                                <div className="order-header">
                                    <h2>Order #{order.id}</h2>

                                    <span className="order-status">
                                        {order.status}
                                    </span>
                                </div>

                                <p>
                                    <strong>Date:</strong>{" "}
                                    {new Date(
                                        order.created_at
                                    ).toLocaleDateString()}
                                </p>

                                <p>
                                    <strong>Payment:</strong>{" "}
                                    {order.payment_method.toUpperCase()}
                                </p>

                                <p>
                                    <strong>Total:</strong>{" "}
                                    ₹{order.total_amount}
                                </p>

                            </Link>
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}

export default Orders;