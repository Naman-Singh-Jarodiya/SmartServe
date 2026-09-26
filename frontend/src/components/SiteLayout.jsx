import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function SiteLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user || location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/") {
    return children;
  }

  const profilePath = user.role === "TECHNICIAN" ? "/technician/profile" : "/profile";

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-button" onClick={() => navigate("/dashboard")}>
          <span className="brand-mark">S</span>
          <span className="brand-copy">
            <strong>SmartServe</strong>
            <small>SMART HOME SERVICES</small>
          </span>
        </button>

        <nav className="topnav">
          {user.role === "CUSTOMER" && (
            <>
              <button className="nav-link" onClick={() => navigate("/services")}>Services</button>
              <button className="nav-link" onClick={() => navigate("/bookings")}>Bookings</button>
              <button className="nav-link" onClick={() => navigate("/addresses")}>Addresses</button>
            </>
          )}
          {user.role === "TECHNICIAN" && (
            <>
              <button className="nav-link" onClick={() => navigate("/technician/requests")}>Requests</button>
              <button className="nav-link" onClick={() => navigate("/technician/bookings")}>Jobs</button>
              <button className="nav-link" onClick={() => navigate("/addresses")}>Addresses</button>
            </>
          )}
          {user.role === "ADMIN" && (
            <>
              <button className="nav-link" onClick={() => navigate("/admin/services")}>Services</button>
              <button className="nav-link" onClick={() => navigate("/admin/bookings")}>Bookings</button>
            </>
          )}
        </nav>

        <div className="profile-wrap" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
          <button className="profile-trigger" onClick={() => setOpen((v) => !v)}>
            <span className="avatar-3d">{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
            <span className="profile-name">{user.name}</span>
            <span className="chevron">⌄</span>
          </button>
          {open && (
            <div className="profile-menu">
              <div className="menu-user">
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </div>
              <button onClick={() => navigate(profilePath)}>Profile</button>
              {user.role === "CUSTOMER" && <button onClick={() => navigate("/addresses")}>My Addresses</button>}
              {user.role === "TECHNICIAN" && <button onClick={() => navigate("/addresses")}>My Addresses</button>}
              <button className="danger-link" onClick={logout}>Logout</button>
            </div>
          )}
        </div>
      </header>
      <main className="page-content">{children}</main>
      
    </div>
  );
}

export default SiteLayout;
