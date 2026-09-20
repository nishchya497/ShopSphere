import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    alert("Login successful! 🎉");

    navigate("/");
  };

  return (
    <div className="login-page">

      <div className="login-box">

        <Link to="/" className="login-logo">
          Shop<span>Sphere</span>
        </Link>

        <h1>Welcome Back</h1>

        <p>Login to your ShopSphere account</p>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

        <div className="register-link">
          Don't have an account?
          <Link to="/register">Register</Link>
        </div>

      </div>

    </div>
  );
}

export default Login;