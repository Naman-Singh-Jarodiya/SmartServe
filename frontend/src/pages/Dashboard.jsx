import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    navigate("/login");
    return null;
  }

  const customerCards = [
    ["🛠️", "View Services", "Book the right service for your home", "/services"],
    ["📋", "My Bookings", "Quotes, payments and live status", "/bookings"],
    ["📍", "My Addresses", "Keep your service location ready", "/addresses"],
  ];

  const technicianCards = [
    ["📨", "Service Requests", "New customers and repair problems", "/technician/requests"],
    ["🔧", "My Assigned Jobs", "Quotes, payment and completion", "/technician/bookings"],
    ["🧰", "My Profile", "Services, experience and ratings", "/technician/profile"],
    ["📍", "My Addresses", "Set your active service location", "/addresses"],
  ];

  const adminCards = [
    ["🧩", "Manage Services", "Build the SmartServe service catalogue", "/admin/services"],
    ["📊", "Manage Bookings", "Monitor active and completed bookings", "/admin/bookings"],
  ];

  const cards = user.role === "CUSTOMER" ? customerCards : user.role === "TECHNICIAN" ? technicianCards : adminCards;

  return (
    <div className="dashboard-page">
      <div className="hero-panel">
        <span className="eyebrow">SMART HOME SERVICES</span>
        <h1>Power your service business.</h1>
        <p>Welcome back, <strong>{user.name}</strong>. Everything you need is one click away.</p>
        <div className="hero-orbit orbit-1" />
        <div className="hero-orbit orbit-2" />
        <div className="hero-glow" />
      </div>

      <div className="section-head">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h2>{user.role === "CUSTOMER" ? "Manage your home services" : user.role === "TECHNICIAN" ? "Run your technician workspace" : "Operate SmartServe"}</h2>
        </div>
        <span className="status-chip">{user.role}</span>
      </div>

      <div className="action-grid dashboard-grid">
        {cards.map(([icon, title, desc, path]) => (
          <button className="action-card dashboard-card" key={title} onClick={() => navigate(path)}>
            <span className="action-icon">{icon}</span>
            <div>
              <strong>{title}</strong>
              <small>{desc}</small>
            </div>
            <span className="card-arrow">↗</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
