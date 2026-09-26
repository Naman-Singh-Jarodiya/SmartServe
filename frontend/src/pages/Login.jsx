import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-ambient ambient-a" />
      <div className="auth-ambient ambient-b" />

      <div className="auth-brand">
        <div className="logo-3d">
          <span>S</span>
          <i />
        </div>
        <div>
          <strong>SmartServe</strong>
          <small>SMART HOME SERVICES</small>
        </div>
      </div>

      <div className="auth-layout">
        <div className="auth-copy">
          <span className="eyebrow">WELCOME BACK</span>
          <h1>Repair less.<br /><span>Live more.</span></h1>
          <p>Book reliable home services, compare technicians, approve quotes and finish jobs with a secure OTP.</p>
          <div className="trust-row">
            <span>✦ Verified technicians</span>
            <span>✦ Transparent quotes</span>
            <span>✦ Secure payments</span>
          </div>
        </div>

        <div className="auth-card">
          <div className="card-kicker">SIGN IN</div>
          <h2>Welcome to SmartServe</h2>
          <p>Enter your account details to continue.</p>

          <form onSubmit={handleLogin} className="form-stack">
            <label>
              Email
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Password
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button className="primary-button" type="submit">Login <span>→</span></button>
          </form>

          {message && <p className="form-message error-message">{message}</p>}

          <div className="auth-divider"><span>NEW TO SMARTSERVE?</span></div>
          <button className="secondary-button" onClick={() => navigate("/register")}>Create Account</button>
        </div>
      </div>

      
    </div>
  );
}

export default Login;
