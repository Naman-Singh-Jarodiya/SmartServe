import { useEffect, useState } from "react";
import api from "../services/api";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const getBookings = async () => {
    try {
      const res = await api.get(
        "/bookings",
        authConfig
      );

      setBookings(res.data);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to load bookings"
      );
    }
  };

  useEffect(() => {
    getBookings();
  }, []);

  const getStatusClass = (status) => {
    return status
      ?.toLowerCase()
      .replace("_", "-");
  };

  return (
    <div className="admin-page-shell">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">
            SMARTSERVE CONTROL CENTER
          </span>

          <h1>Manage Bookings</h1>

          <p>
            Monitor customer bookings,
            technicians, quotes and payments.
          </p>
        </div>

        <div className="admin-header-orb">
          ◇
        </div>
      </div>

      {message && (
        <div className="floating-message">
          <span>✦</span>
          {message}
        </div>
      )}

      <div className="admin-booking-stats">
        <div className="admin-stat-card">
          <span>Total Bookings</span>

          <strong>
            {bookings.length}
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>Active</span>

          <strong>
            {
              bookings.filter(
                (b) =>
                  b.status ===
                    "ACCEPTED" ||
                  b.status ===
                    "IN_PROGRESS"
              ).length
            }
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>Completed</span>

          <strong>
            {
              bookings.filter(
                (b) =>
                  b.status ===
                  "COMPLETED"
              ).length
            }
          </strong>
        </div>

        <div className="admin-stat-card">
          <span>Paid</span>

          <strong>
            {
              bookings.filter(
                (b) =>
                  b.payment_status ===
                  "PAID"
              ).length
            }
          </strong>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="admin-empty">
          <div>◌</div>

          <h3>No bookings found</h3>

          <p>
            Customer bookings will appear
            here.
          </p>
        </div>
      ) : (
        <div className="admin-bookings-grid">
          {bookings.map((booking) => (
            <div
              className="admin-booking-card"
              key={booking.id}
            >
              <div className="admin-booking-card-glow"></div>

              <div className="admin-booking-top">
                <div>
                  <span className="admin-booking-id">
                    BOOKING #
                    {booking.id}
                  </span>

                  <h2>
                    {booking.service}
                  </h2>
                </div>

                <span
                  className={`admin-status-chip status-${getStatusClass(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="admin-booking-info">
                <div>
                  <span>Customer</span>

                  <strong>
                    {booking.customer}
                  </strong>
                </div>

                <div>
                  <span>Technician</span>

                  <strong>
                    {booking.technician ||
                      "Not assigned"}
                  </strong>
                </div>

                <div>
                  <span>Service Date</span>

                  <strong>
                    {new Date(
                      booking.booking_date
                    ).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>Booking Amount</span>

                  <strong>
                    {booking.amount
                      ? `₹${booking.amount}`
                      : "Not quoted"}
                  </strong>
                </div>
              </div>

              {booking.problem_description && (
                <div className="admin-booking-section">
                  <div className="admin-section-label">
                    <span>⌁</span>
                    CUSTOMER PROBLEM
                  </div>

                  <p className="admin-problem-text">
                    {
                      booking.problem_description
                    }
                  </p>
                </div>
              )}

              <div className="admin-booking-section">
                <div className="admin-section-label">
                  <span>₹</span>
                  REPAIR QUOTE
                </div>

                {booking.quoted_amount ? (
                  <div className="admin-quote-row">
                    <strong>
                      ₹
                      {
                        booking.quoted_amount
                      }
                    </strong>

                    <span
                      className={`admin-quote-status quote-${booking.quote_status?.toLowerCase()}`}
                    >
                      {booking.quote_status}
                    </span>
                  </div>
                ) : (
                  <p className="admin-muted">
                    Quote not submitted yet
                  </p>
                )}
              </div>

              <div className="admin-booking-section">
                <div className="admin-section-label">
                  <span>◇</span>
                  PAYMENT
                </div>

                <div className="admin-payment-row">
                  <div>
                    <span>Status</span>

                    <strong
                      className={
                        booking.payment_status ===
                        "PAID"
                          ? "payment-paid"
                          : "payment-pending"
                      }
                    >
                      {booking.payment_status ===
                      "PAID"
                        ? "✓ PAID"
                        : "◷ PENDING"}
                    </strong>
                  </div>

                  <div>
                    <span>Method</span>

                    <strong>
                      {booking.payment_method ||
                        "—"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="admin-booking-footer">
                <span>
                  #{booking.id}
                </span>

                <span>
                  {booking.created_at
                    ? new Date(
                        booking.created_at
                      ).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminBookings;