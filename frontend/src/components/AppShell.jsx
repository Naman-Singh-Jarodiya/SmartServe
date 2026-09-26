import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Icon = ({ type }) => {
  const paths = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.4" />
        <rect x="14" y="3" width="7" height="7" rx="1.4" />
        <rect x="3" y="14" width="7" height="7" rx="1.4" />
        <rect x="14" y="14" width="7" height="7" rx="1.4" />
      </>
    ),
    wrench: (
      <>
        <path d="M14.7 6.1a5 5 0 0 0-6.6 6.6l-5.3 5.3a2.1 2.1 0 1 0 3 3l5.3-5.3a5 5 0 0 0 6.6-6.6l-3.1 3.1-2.8-.7-.7-2.8 3.1-3.1Z" />
      </>
    ),
    bag: (
      <>
        <path d="M5 8h14l1.2 12H3.8L5 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s7-6.2 7-11A7 7 0 0 0 5 10c0 4.8 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.4" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),
    request: (
      <>
        <path d="M4 6h16v12H4z" />
        <path d="m7 10 2 2 4-4 4 4" />
      </>
    ),
    briefcase: (
      <>
        <rect x="4" y="7" width="16" height="12" rx="2" />
        <path d="M9 7V5h6v2M4 12h16" />
      </>
    ),
    services: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H5v14h5" />
        <path d="m14 8 4 4-4 4M18 12H9" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 7 3v5c0 4.6-3 8-7 10-4-2-7-5.4-7-10V6l7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    chevron: (
      <>
        <path d="m8 10 4 4 4-4" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[type]}
    </svg>
  );
};

function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role || "CUSTOMER";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const nav =
    role === "CUSTOMER"
      ? [
          ["/dashboard", "Overview", "grid"],
          ["/services", "Book Service", "wrench"],
          ["/bookings", "My Bookings", "bag"],
          ["/addresses", "Addresses", "pin"],
        ]
      : role === "TECHNICIAN"
        ? [
            ["/dashboard", "Overview", "grid"],
            ["/technician/requests", "Requests", "request"],
            ["/technician/bookings", "Assigned Jobs", "briefcase"],
            ["/technician/profile", "My Profile", "user"],
            ["/addresses", "My Addresses", "pin"],
          ]
        : [
            ["/dashboard", "Overview", "grid"],
            ["/admin/services", "Services", "services"],
            ["/admin/bookings", "Bookings", "briefcase"],
          ];

  const profilePath =
    role === "TECHNICIAN" ? "/technician/profile" : "/profile";
  const initials = (user?.name || "S").slice(0, 2).toUpperCase();

  return (
    <div className="ss-app">
      <div className="ss-bg ss-bg-a" />
      <div className="ss-bg ss-bg-b" />
      <div className="ss-grid-glow" />

      <aside className="ss-sidebar">
        <button className="ss-brand" onClick={() => navigate("/dashboard")}>
          <span className="ss-brand-mark">S</span>
          <span className="ss-brand-copy">
            <b>SmartServe</b>
            <small>service intelligence</small>
          </span>
        </button>

        <div className="ss-role-pill">
          <span className="ss-mini-orb">
            <Icon
              type={
                role === "ADMIN"
                  ? "shield"
                  : role === "TECHNICIAN"
                    ? "wrench"
                    : "user"
              }
            />
          </span>
          <span>
            <strong>{role}</strong>
            <small>Signed in</small>
          </span>
        </div>

        <nav className="ss-nav">
          {nav.map(([path, label, icon]) => (
            <button
              key={path}
              className={`ss-nav-item ${location.pathname === path ? "active" : ""}`}
              onClick={() => navigate(path)}
            >
              <span className="ss-nav-icon">
                <Icon type={icon} />
              </span>
              <span>{label}</span>
              {location.pathname === path && <i />}
            </button>
          ))}
        </nav>

        <div className="ss-sidebar-footer">
          <div className="ss-trust-card">
            <span className="ss-mini-orb">
              <Icon type="shield" />
            </span>
            <div>
              <strong>Secure workspace</strong>
              <small>Encrypted session</small>
            </div>
          </div>
        </div>
      </aside>

      <section className="ss-main">
        <header className="ss-topbar">
          <div>
            <span className="ss-eyebrow">SMART HOME SERVICES</span>
            <h2>
              {role === "CUSTOMER"
                ? "Everything you need, one tap away."
                : role === "TECHNICIAN"
                  ? "Power your service business."
                  : "SmartServe control center."}
            </h2>
          </div>

          <div className="ss-top-actions">
            <button
              className="ss-icon-btn"
              onClick={() => navigate("/addresses")}
              title="Addresses"
            >
              <Icon type="pin" />
            </button>

            <div
              className="ss-profile-area"
              onMouseEnter={() => setProfileOpen(true)}
              onMouseLeave={() => setProfileOpen(false)}
            >
              <button
                className="ss-user-chip"
                onClick={() => setProfileOpen((v) => !v)}
              >
                <span className="ss-avatar">{initials}</span>
                <span className="ss-user-meta">
                  <strong>{user?.name || "User"}</strong>
                  <small>{role}</small>
                </span>
                <span className="ss-profile-chevron">
                  <Icon type="chevron" />
                </span>
              </button>

              {profileOpen && (
                <div className="ss-profile-menu">
                  <div className="ss-menu-head">
                    <span className="ss-avatar ss-avatar-lg">{initials}</span>
                    <div>
                      <strong>{user?.name || "User"}</strong>
                      <small>{user?.email || ""}</small>
                    </div>
                  </div>
                  <button onClick={() => navigate(profilePath)}>
                    <span>◈</span> Profile
                  </button>
                  <button onClick={() => navigate("/addresses")}>
                    <span>⌖</span> My Addresses
                  </button>
                  <button className="danger" onClick={logout}>
                    <span>↪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="ss-content">{children}</main>

       
      </section>
    </div>
  );
}

export default AppShell;
