import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function TechnicianBookings() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState({});

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const getBookings = async () => {
    try {
      const res = await api.get(
        "/bookings/technician",
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

  const confirmCashPayment = async (
    bookingId
  ) => {
    try {
      const res = await api.post(
        `/bookings/${bookingId}/payment/cash/confirm`,
        {},
        authConfig
      );

      setMessage(
        res.data.message ||
          "✅ Cash payment confirmed"
      );

      await getBookings();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to confirm cash payment"
      );
    }
  };

  const startService = async (
    bookingId
  ) => {
    try {
      await api.put(
        `/bookings/${bookingId}/status`,
        {
          status: "IN_PROGRESS",
        },
        authConfig
      );

      setMessage(
        "✅ Service started successfully"
      );

      await getBookings();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Unable to start service"
      );
    }
  };

  const generateOtp = async (
    bookingId
  ) => {
    try {
      const res = await api.post(
        `/bookings/${bookingId}/completion-otp`,
        {},
        authConfig
      );

      setMessage(
        res.data.message ||
          "✅ Completion OTP generated"
      );
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to generate OTP"
      );
    }
  };

  const verifyOtp = async (
    bookingId
  ) => {
    if (!otp[bookingId]) {
      setMessage("Please enter OTP");
      return;
    }

    try {
      await api.post(
        `/bookings/${bookingId}/verify-completion`,
        {
          otp: otp[bookingId],
        },
        authConfig
      );

      setMessage(
        "✅ Service completed successfully"
      );

      setOtp((prev) => ({
        ...prev,
        [bookingId]: "",
      }));

      await getBookings();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Invalid OTP"
      );
    }
  };

  return (
    <div className="page-shell">
      <div className="page-heading booking-page-heading">
        <div>
          <span className="eyebrow">
            TECHNICIAN WORKSPACE
          </span>

          <h1>Assigned Jobs</h1>

          <p>
            Manage accepted jobs, payments,
            service progress and completion.
          </p>
        </div>

        <div className="heading-orb">
          ⚙
        </div>
      </div>

      {message && (
        <div className="floating-message">
          <span>✦</span>
          {message}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="empty-state request-empty">
          <div className="empty-icon">
            ◌
          </div>

          <h2>No assigned jobs</h2>

          <p>
            Accepted technician jobs will
            appear here.
          </p>
        </div>
      ) : (
        <div className="booking-grid">
          {bookings.map((booking) => (
            <div
              className="booking-card-3d technician-job-card"
              key={booking.id}
            >
              <div className="booking-card-glow tech-glow"></div>

              <div className="booking-top">
                <div>
                  <span className="booking-kicker">
                    ASSIGNED JOB #{booking.id}
                  </span>

                  <h2>
                    {booking.service}
                  </h2>
                </div>

                <span
                  className={`booking-status status-${booking.status.toLowerCase()}`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="booking-info-grid">
                <div className="booking-info-box">
                  <span>Customer</span>
                  <strong>
                    {booking.customer}
                  </strong>
                </div>

                <div className="booking-info-box">
                  <span>Service Date</span>
                  <strong>
                    {new Date(
                      booking.booking_date
                    ).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="booking-section">
                <div className="section-heading-small">
                  <span>⌁</span>
                  CUSTOMER PROBLEM
                </div>

                <div className="problem-mini-card">
                  {booking.problem_description ||
                    "No problem description provided."}
                </div>
              </div>

              <div className="booking-section">
                <div className="section-heading-small">
                  <span>₹</span>
                  REPAIR QUOTE
                </div>

                {booking.quote_status ===
                  "QUOTED" && (
                  <div className="job-quote-state quote-awaiting">
                    <div className="quote-state-icon">
                      ₹
                    </div>

                    <div>
                      <strong>
                        ₹
                        {
                          booking.quoted_amount
                        }
                      </strong>

                      <p>
                        ⏳ Waiting for customer
                        approval
                      </p>
                    </div>
                  </div>
                )}

                {booking.quote_status ===
                  "ACCEPTED" && (
                  <div className="job-quote-state quote-approved">
                    <div className="quote-state-icon">
                      ✓
                    </div>

                    <div>
                      <strong>
                        ₹
                        {booking.amount}
                      </strong>

                      <p>
                        ✅ Customer accepted
                        your quote
                      </p>
                    </div>
                  </div>
                )}

                {booking.quote_status ===
                  "REJECTED" && (
                  <div className="job-quote-state quote-rejected">
                    <div className="quote-state-icon">
                      ×
                    </div>

                    <div>
                      <strong>
                        Quote rejected
                      </strong>

                      <p>
                        Customer did not approve
                        the repair price.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {booking.quote_status ===
                "ACCEPTED" && (
                <div className="booking-section">
                  <div className="section-heading-small">
                    <span>◇</span>
                    PAYMENT
                  </div>

                  {booking.payment_status ===
                  "PAID" ? (
                    <div className="payment-complete">
                      <div className="payment-icon">
                        ✓
                      </div>

                      <div>
                        <strong>
                          Payment Received
                        </strong>

                        <p>
                          ₹
                          {booking.amount}
                          {" · "}
                          {
                            booking.payment_method
                          }
                        </p>
                      </div>
                    </div>
                  ) : booking.payment_method ===
                    "CASH" ? (
                    <div className="cash-confirm-card">
                      <div className="cash-icon">
                        ₹
                      </div>

                      <div className="cash-details">
                        <strong>
                          Cash Payment
                        </strong>

                        <p>
                          Amount: ₹
                          {
                            booking.amount
                          }
                        </p>

                        <span>
                          ⏳ Waiting for cash
                          confirmation
                        </span>
                      </div>

                      <button
                        className="action-button cash-confirm-button"
                        onClick={() =>
                          confirmCashPayment(
                            booking.id
                          )
                        }
                      >
                        ✓ Confirm Cash Received
                      </button>
                    </div>
                  ) : (
                    <div className="payment-pending-tech">
                      <span>◷</span>

                      <div>
                        <strong>
                          Payment Pending
                        </strong>

                        <p>
                          Customer can pay
                          anytime before
                          completion.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {booking.status ===
                "ACCEPTED" &&
                booking.quote_status ===
                  "ACCEPTED" && (
                <div className="job-start-panel">
                  <div>
                    <strong>
                      Ready to start?
                    </strong>

                    <p>
                      You can start the service
                      even if payment is still
                      pending.
                    </p>
                  </div>

                  <button
                    className="action-button start-button"
                    onClick={() =>
                      startService(
                        booking.id
                      )
                    }
                  >
                    ⚡ Start Service
                  </button>
                </div>
              )}

              {booking.status ===
                "IN_PROGRESS" && (
                <div className="progress-panel">
                  <div className="progress-head">
                    <div>
                      <span className="section-heading-small">
                        <span>◉</span>
                        SERVICE PROGRESS
                      </span>

                      <h3>
                        Service is in progress
                      </h3>
                    </div>

                    <span className="live-pill">
                      LIVE
                    </span>
                  </div>

                  {booking.payment_status ===
                  "PAID" ? (
                    <div className="otp-action-panel">
                      <div className="otp-ready-icon">
                        ✓
                      </div>

                      <div>
                        <strong>
                          Payment completed
                        </strong>

                        <p>
                          Generate completion
                          OTP when the work is
                          finished.
                        </p>
                      </div>

                      <button
                        className="action-button otp-button"
                        onClick={() =>
                          generateOtp(
                            booking.id
                          )
                        }
                      >
                        🔐 Request OTP
                      </button>
                    </div>
                  ) : (
                    <div className="payment-before-otp">
                      <div className="warning-icon">
                        !
                      </div>

                      <div>
                        <strong>
                          Payment still pending
                        </strong>

                        <p>
                          Completion OTP will
                          unlock after payment.
                        </p>
                      </div>
                    </div>
                  )}

                  {booking.payment_status ===
                    "PAID" && (
                    <div className="otp-entry-panel">
                      <span className="otp-entry-label">
                        CUSTOMER OTP
                      </span>

                      <div className="otp-input-row">
                        <input
                          type="text"
                          maxLength={6}
                          inputMode="numeric"
                          placeholder="Enter 6-digit OTP"
                          value={
                            otp[booking.id] ||
                            ""
                          }
                          onChange={(e) =>
                            setOtp(
                              (prev) => ({
                                ...prev,
                                [booking.id]:
                                  e.target.value.replace(
                                    /\D/g,
                                    ""
                                  ),
                              })
                            )
                          }
                        />

                        <button
                          className="action-button complete-button"
                          onClick={() =>
                            verifyOtp(
                              booking.id
                            )
                          }
                        >
                          ✓ Complete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {booking.status ===
                "COMPLETED" && (
                <div className="completed-job-panel">
                  <div className="completed-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Service Completed
                    </strong>

                    <p>
                      Job #{booking.id} has
                      been successfully closed.
                    </p>
                  </div>

                  <span>
                    ₹{booking.amount}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TechnicianBookings;