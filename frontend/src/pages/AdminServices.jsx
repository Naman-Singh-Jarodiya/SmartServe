import { useEffect, useState } from "react";
import api from "../services/api";

function AdminServices() {
  const [services, setServices] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const getServices = async () => {
    try {
      const res = await api.get("/services");
      setServices(res.data);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to load services"
      );
    }
  };

  useEffect(() => {
    getServices();
  }, []);

  const createService = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter service name");
      return;
    }

    if (!description.trim()) {
      setMessage(
        "Please enter service description"
      );
      return;
    }

    try {
      await api.post(
        "/services",
        {
          name: name.trim(),
          description: description.trim(),
        },
        authConfig
      );

      setName("");
      setDescription("");

      setMessage(
        "✅ Service created successfully"
      );

      await getServices();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to create service"
      );
    }
  };

  return (
    <div className="admin-page-shell">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">
            SMARTSERVE CONTROL CENTER
          </span>

          <h1>Manage Services</h1>

          <p>
            Create and manage the services
            available to customers and
            technicians.
          </p>
        </div>

        <div className="admin-header-orb">
          ⚙
        </div>
      </div>

      {message && (
        <div className="floating-message">
          <span>✦</span>
          {message}
        </div>
      )}

      <div className="admin-service-create">
        <div className="admin-section-heading">
          <div>
            <span className="eyebrow">
              SERVICE CATALOG
            </span>

            <h2>Create New Service</h2>
          </div>

          <div className="admin-section-icon">
            +
          </div>
        </div>

        <form onSubmit={createService}>
          <div className="admin-form-grid">
            <div>
              <label>Service Name</label>

              <input
                type="text"
                placeholder="e.g. AC Repair"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </div>

            <div>
              <label>Description</label>

              <input
                type="text"
                placeholder="Describe the service..."
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="admin-form-note">
            <span>ⓘ</span>
            Pricing is decided by the
            technician after inspecting the
            customer's problem.
          </div>

          <button
            className="admin-create-button"
            type="submit"
          >
            <span>+</span>
            Create Service
          </button>
        </form>
      </div>

      <div className="admin-services-section">
        <div className="admin-list-heading">
          <div>
            <span className="eyebrow">
              AVAILABLE SERVICES
            </span>

            <h2>Service Catalog</h2>
          </div>

          <span className="admin-count">
            {services.length} Services
          </span>
        </div>

        {services.length === 0 ? (
          <div className="admin-empty">
            <div>◈</div>

            <h3>No services created yet</h3>

            <p>
              Create your first SmartServe
              service above.
            </p>
          </div>
        ) : (
          <div className="admin-service-grid">
            {services.map((service) => (
              <div
                className="admin-service-card"
                key={service.id}
              >
                <div className="admin-service-glow"></div>

                <div className="admin-service-number">
                  #{String(service.id).padStart(
                    2,
                    "0"
                  )}
                </div>

                <div className="admin-service-icon">
                  ⚡
                </div>

                <h3>{service.name}</h3>

                <p>
                  {service.description ||
                    "No description available."}
                </p>

                <div className="admin-service-footer">
                  <span>
                    ◉ ACTIVE SERVICE
                  </span>

                  <strong>
                    SmartServe
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminServices;