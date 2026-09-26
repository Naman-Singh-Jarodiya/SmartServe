import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="page-narrow">
      <div className="page-heading">
        <span className="eyebrow">ACCOUNT CENTER</span>
        <h1>My Profile</h1>
        <p>Your SmartServe account at a glance.</p>
      </div>

      <div className="profile-card-large">
        <div className="avatar-hero">{user.name?.charAt(0)?.toUpperCase() || "U"}</div>
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <span className="status-chip">{user.role}</span>
        </div>
      </div>

      <div className="action-grid">
        {user.role === "CUSTOMER" && (
          <>
            <button className="action-card" onClick={() => navigate("/services")}>
              <span className="action-icon">🛠️</span>
              <strong>View Services</strong>
              <small>Find a trusted technician</small>
            </button>
            <button className="action-card" onClick={() => navigate("/bookings")}>
              <span className="action-icon">📋</span>
              <strong>My Bookings</strong>
              <small>Track quotes and service status</small>
            </button>
            <button className="action-card" onClick={() => navigate("/addresses")}>
              <span className="action-icon">📍</span>
              <strong>My Addresses</strong>
              <small>Manage your selected location</small>
            </button>
          </>
        )}

        {user.role === "TECHNICIAN" && (
          <>
            <button className="action-card" onClick={() => navigate("/technician/profile")}>
              <span className="action-icon">🧰</span>
              <strong>Technician Profile</strong>
              <small>Services, experience and rating</small>
            </button>
            <button className="action-card" onClick={() => navigate("/technician/requests")}>
              <span className="action-icon">📨</span>
              <strong>Service Requests</strong>
              <small>Review customer requests</small>
            </button>
            <button className="action-card" onClick={() => navigate("/technician/bookings")}>
              <span className="action-icon">🔧</span>
              <strong>Assigned Jobs</strong>
              <small>Quotes, payments and completion</small>
            </button>
            <button className="action-card" onClick={() => navigate("/addresses")}>
              <span className="action-icon">📍</span>
              <strong>My Addresses</strong>
              <small>Set your active work location</small>
            </button>
          </>
        )}

        {user.role === "ADMIN" && (
          <>
            <button className="action-card" onClick={() => navigate("/admin/services")}>
              <span className="action-icon">🧩</span>
              <strong>Manage Services</strong>
              <small>Maintain the service catalogue</small>
            </button>
            <button className="action-card" onClick={() => navigate("/admin/bookings")}>
              <span className="action-icon">📊</span>
              <strong>Manage Bookings</strong>
              <small>Monitor booking activity</small>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
