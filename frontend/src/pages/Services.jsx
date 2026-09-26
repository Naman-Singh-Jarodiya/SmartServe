import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Services() {
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/services");
        setServices(res.data);
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to load services");
      }
    };
    load();
  }, []);

  const icons = ["❄️", "💻", "🫧", "⚡", "🧊", "🔌"];

  return (
    <div>
      <div className="page-heading split-heading">
        <div>
          <span className="eyebrow">SMARTSERVE CATALOGUE</span>
          <h1>Choose a Service</h1>
          <p>Tell us what needs fixing. The right technician will take it from there.</p>
        </div>
        <button className="secondary-button compact-button" onClick={() => navigate("/addresses")}>📍 Manage Address</button>
      </div>

      {message && <p className="form-message error-message">{message}</p>}

      <div className="service-grid">
        {services.map((service, index) => (
          <article className="service-card-3d" key={service.id}>
            <div className="service-icon-3d">{icons[index % icons.length]}</div>
            <div className="service-card-copy">
              <span className="card-number">0{index + 1}</span>
              <h2>{service.name}</h2>
              <p>{service.description || "Professional home service by a qualified technician."}</p>
            </div>
            <button className="primary-button small-button" onClick={() => navigate(`/book-service/${service.id}`)}>
              Book Service <span>↗</span>
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Services;
