import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function BookService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [service, setService] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingId, setBookingId] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [problemDescription, setProblemDescription] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [message, setMessage] = useState("");

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [serviceRes, addressRes] = await Promise.all([
          api.get("/services"),
          api.get("/addresses", authConfig),
        ]);
        setService(serviceRes.data.find((item) => String(item.id) === String(id)) || null);
        setSelectedAddress(addressRes.data.find((item) => item.is_selected) || null);
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to load booking details");
      }
    };
    load();
  }, [id]);

  const createBooking = async () => {
    if (!bookingDate) {
      setMessage("Please select a service date");
      return;
    }
    if (!bookingTime) {
      setMessage("Please select a service time");
      return;
    }
    if (!selectedAddress) {
      setMessage("Please select an address first");
      return;
    }

    try {
      const res = await api.post(
        "/bookings",
        {
          service_id: Number(id),
          booking_date: `${bookingDate}T${bookingTime}`,
        },
        authConfig
      );

      const newBookingId = res.data.booking.id;
      setBookingId(newBookingId);

      const techRes = await api.get(
        `/technicians/service/${id}?booking_id=${newBookingId}`,
        authConfig
      );

      setTechnicians(techRes.data);
      setMessage("✅ Booking created. Choose a technician.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed");
    }
  };

  const sendRequest = async () => {
    if (!selectedTechnician) return;
    if (!problemDescription.trim()) {
      setMessage("Please describe the repair problem");
      return;
    }

    try {
      await api.post(
        `/bookings/${bookingId}/request-technician`,
        {
          technician_id: selectedTechnician.technician_id,
          problem_description: problemDescription.trim(),
        },
        authConfig
      );

      setMessage(`✅ Request sent to technician ${selectedTechnician.name}. ⏳ Waiting for acceptance and quote.`);
      setSelectedTechnician(null);
      setProblemDescription("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send request");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (!service) {
    return <div className="empty-state"><h2>Loading service...</h2>{message && <p>{message}</p>}</div>;
  }

  return (
    <div className="booking-page">
      <button className="back-link" onClick={() => navigate("/services")}>← Back to Services</button>

      <div className="booking-hero">
        <div>
          <span className="eyebrow">BOOK A SERVICE</span>
          <h1>{service.name}</h1>
          <p>{service.description}</p>
        </div>
        <div className="booking-service-icon">🛠️</div>
      </div>

      {message && <div className="notice-card">{message}</div>}

      {!bookingId ? (
        <div className="booking-layout">
          <section className="glass-card booking-form-card">
            <div className="section-head local-head">
              <div>
                <span className="eyebrow">STEP 01</span>
                <h2>When should we come?</h2>
              </div>
            </div>

            <div className="date-time-grid">
              <label className="picker-card">
                <span>📅 Service Date</span>
                <input type="date" value={bookingDate} min={today} onChange={(e) => setBookingDate(e.target.value)} />
              </label>
              <label className="picker-card">
                <span>🕐 Service Time</span>
                <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
              </label>
            </div>
          </section>

          <section className="glass-card address-preview-card">
            <span className="eyebrow">STEP 02</span>
            <h2>Service Location</h2>
            {selectedAddress ? (
              <div className="selected-address-box">
                <span className="address-badge">🏠 {selectedAddress.label}</span>
                <strong>{selectedAddress.address}</strong>
                <span>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</span>
                <small>📍 {selectedAddress.latitude}, {selectedAddress.longitude}</small>
              </div>
            ) : (
              <div className="empty-inline">No selected address yet.</div>
            )}
            <button className="secondary-button full-button" onClick={() => navigate("/addresses")}>Change Address</button>
          </section>

          <section className="glass-card summary-card">
            <div>
              <span className="eyebrow">READY?</span>
              <h2>{service.name}</h2>
              <p>Final repair price will be quoted by the technician after accepting your request.</p>
            </div>
            <button className="primary-button large-button" onClick={createBooking}>Continue to Technicians <span>→</span></button>
          </section>
        </div>
      ) : (
        <section className="glass-card technician-stage">
          <div className="section-head">
            <div>
              <span className="eyebrow">STEP 03</span>
              <h2>Choose your technician</h2>
              <p>Your chosen address is used to calculate distance.</p>
            </div>
          </div>

          {technicians.length === 0 ? (
            <div className="empty-state"><h3>No qualified technician available.</h3><p>Try another service later.</p></div>
          ) : (
            <div className="technician-grid">
              {technicians.map((tech) => (
                <article className="technician-card-3d" key={tech.technician_id}>
                  <div className="tech-avatar">{tech.name?.charAt(0)?.toUpperCase()}</div>
                  <div className="tech-main">
                    <h3>{tech.name}</h3>
                    <p>{tech.experience_years} years experience</p>
                    <div className="tech-meta">
                      <span>{tech.rating_count > 0 ? `★ ${tech.average_rating} (${tech.rating_count})` : "No ratings yet"}</span>
                      <span>{tech.distance_km != null ? `📍 ${tech.distance_km} km away` : "📍 Distance unavailable"}</span>
                    </div>
                  </div>
                  <button className="primary-button small-button" onClick={() => setSelectedTechnician(tech)}>Request</button>
                </article>
              ))}
            </div>
          )}

          <button className="secondary-button" onClick={() => navigate("/bookings")}>View My Bookings</button>
        </section>
      )}

      {selectedTechnician && (
        <div className="modal-backdrop" onClick={() => setSelectedTechnician(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <span className="eyebrow">TECHNICIAN REQUEST</span>
            <h2>Request {selectedTechnician.name}</h2>
            <p>Describe the problem so the technician can review it and send a quote after accepting your request.</p>
            <textarea value={problemDescription} onChange={(e) => setProblemDescription(e.target.value)} placeholder="Example: Fan makes too much noise while running..." rows={6} />
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setSelectedTechnician(null)}>Cancel</button>
              <button className="primary-button" onClick={sendRequest}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookService;
