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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("profiles")
        .select("name, phone")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "Error fetching profile:",
          error
        );

        setError(
          "Could not load your profile."
        );
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

    setMessage("");
    setError("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (
      trimmedPhone &&
      !/^[0-9]{10}$/.test(trimmedPhone)
    ) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: session.user.id,
        name: trimmedName,
        phone: trimmedPhone,
      });

    setSaving(false);

    if (error) {
      console.error(
        "Error saving profile:",
        error
      );

      setError(
        "Could not update your profile. Please try again."
      );

      return;
    }

    setName(trimmedName);
    setPhone(trimmedPhone);
    setMessage(
      "Profile updated successfully! 🎉"
    );
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setPhone(value);
  };

  const handleLogout = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error
      );

      setError("Could not logout.");
      return;
    }

    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <h2>Loading profile...</h2>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* Navbar */}
      <nav className="profile-navbar">

        <Link
          to="/"
          className="profile-logo"
        >
          Shop<span>Sphere</span>
        </Link>

        <div className="profile-nav-links">
          <Link to="/">Home</Link>

          <Link to="/products">
            Products
          </Link>

          <Link to="/orders">
            📦 Orders
          </Link>

          <Link to="/cart">
            🛒 Cart
          </Link>
        </div>

      </nav>

      {/* Profile */}
      <div className="profile-container">

        <div className="profile-card">

          <div className="profile-icon">
            👤
          </div>

          <h1>My Account</h1>

          <p className="profile-email">
            {session.user.email}
          </p>

          <div className="profile-divider"></div>

          {message && (
            <div className="profile-success">
              {message}
            </div>
          )}

          {error && (
            <div className="profile-error">
              {error}
            </div>
          )}

          <form onSubmit={saveProfile}>

            <label htmlFor="profile-name">
              Full Name
            </label>

            <input
              id="profile-name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <label htmlFor="profile-phone">
              Phone Number
            </label>

            <input
              id="profile-phone"
              type="tel"
              inputMode="numeric"
              placeholder="Enter 10-digit phone number"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={10}
            />

            <button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </form>

          {/* Account Actions */}
          <div className="profile-actions">

            <Link to="/orders">
              📦 My Orders
            </Link>

            <button
              type="button"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;