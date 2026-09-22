import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./profile.css";

function Profile({ session, authLoading }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, phone")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
      }

      if (data) {
        setName(data.name || "");
        setPhone(data.phone || "");
      }

      setLoading(false);
    };

    fetchProfile();
  }, [session, authLoading, navigate]);

  const saveProfile = async (e) => {
    e.preventDefault();

    if (!session) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: session.user.id,
        name,
        phone,
      });

    setSaving(false);

    if (error) {
      console.error("Error saving profile:", error);
      alert("Could not update profile.");
      return;
    }

    alert("Profile updated successfully! 🎉");
  };

  if (authLoading || loading) {
    return <h2>Loading profile...</h2>;
  }

  return (
    <div className="profile-page">

      <nav className="profile-navbar">
        <Link to="/" className="profile-logo">
          Shop<span>Sphere</span>
        </Link>

        <div className="profile-nav-links">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/orders">📦 Orders</Link>
          <Link to="/cart">🛒 Cart</Link>
        </div>
      </nav>

      <div className="profile-container">

        <div className="profile-card">

          <div className="profile-icon">
            👤
          </div>

          <h1>My Account</h1>

          <p className="profile-email">
            {session.user.email}
          </p>

          <form onSubmit={saveProfile}>

            <label>Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label>Phone</label>

            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </button>

          </form>

          <div className="profile-actions">
            <Link to="/orders">
              📦 My Orders
            </Link>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Profile;