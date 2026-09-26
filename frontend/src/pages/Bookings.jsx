import { useEffect, useState } from "react";
import api from "../services/api";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [otps, setOtps] = useState({});
  const [rating, setRating] = useState({});
  const [comment, setComment] = useState({});
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
        "/bookings/my",
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

  const getOtp = async (bookingId) => {
    try {
      const res = await api.get(
        `/bookings/${bookingId}/completion-otp`,
        authConfig
      );

      setOtps((prev) => ({
        ...prev,
        [bookingId]: res.data,
      }));
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Completion OTP is not available yet"
      );
    }
  };

  useEffect(() => {
    getBookings();
  }, []);

  useEffect(() => {
    bookings.forEach((booking) => {
      if (
        booking.status === "IN_PROGRESS" &&
        booking.payment_status === "PAID" &&
        !otps[booking.id]
      ) {
        getOtp(booking.id);
      }
    });
  }, [bookings]);

  const acceptQuote = async (bookingId) => {
    try {
      const res = await api.post(
        `/bookings/${bookingId}/quote/accept`,
        {},
        authConfig
      );

      setMessage(
        res.data.message ||
          "✅ Repair quote accepted"
      );

      await getBookings();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to accept quote"
      );
    }
  };

  const rejectQuote = async (bookingId) => {
    try {
      const res = await api.post(
        `/bookings/${bookingId}/quote/reject`,
        {},
        authConfig
      );

      setMessage(
        res.data.message ||
          "Repair quote rejected"
      );

      await getBookings();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to reject quote"
      );
    }
  };

  const payNow = async (bookingId) => {
    try {
      setMessage(
        "Creating payment order..."
      );

      const res = await api.post(
        `/bookings/${bookingId}/payment/order`,
        {},
        authConfig
      );

      const {
        order_id,
        amount,
        currency,
        key_id,
      } = res.data;

      if (!window.Razorpay) {
        setMessage(
          "Razorpay Checkout failed to load"
        );
        return;
      }

      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const options = {
        key: key_id,
        amount,
        currency,
        name: "SmartServe",
        description:
          "SmartServe Service Booking",
        order_id,

        handler: async function (response) {
          try {
            setMessage(
              "Verifying payment..."
            );

            await api.post(
              `/bookings/${bookingId}/payment/verify`,
              {
                razorpay_order_id:
                  response.razorpay_order_id,
                razorpay_payment_id:
                  response.razorpay_payment_id,
                razorpay_signature:
                  response.razorpay_signature,
              },
              authConfig
            );

            setMessage(
              "✅ Payment successful"
            );

            await getBookings();
          } catch (err) {
            setMessage(
              err.response?.data?.message ||
                "Payment verification failed"
            );
          }
        },

        prefill: {
          name: user.name || "",
          email: user.email || "",
        },

        theme: {
          color: "#6f52ff",
        },

        modal: {
          ondismiss: function () {
            setMessage(
              "Payment cancelled"
            );
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          setMessage(
            response.error?.description ||
              "Payment failed"
          );
        }
      );

      razorpay.open();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Unable to start payment"
      );
    }
  };

  const selectCashPayment = async (
    bookingId
  ) => {
    try {
      await api.post(
        `/bookings/${bookingId}/payment/cash`,
        {},
        authConfig
      );

      setMessage(
        "💵 Cash payment selected. Please pay the technician."
      );

      await getBookings();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to select cash payment"
      );
    }
  };

  const submitReview = async (
    bookingId
  ) => {
    try {
      const selectedRating =
        rating[bookingId];

      const selectedComment =
        comment[bookingId];

      if (!selectedRating) {
        setMessage(
          "Please select a rating"
        );
        return;
      }

      await api.post(
        "/reviews",
        {
          booking_id: bookingId,
          rating: Number(
            selectedRating
          ),
          comment:
            selectedComment || "",
        },
        authConfig
      );

      setMessage(
        "✅ Review submitted successfully"
      );

      await getBookings();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to submit review"
      );
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: "Waiting for Technician",
      ACCEPTED: "Technician Accepted",
      IN_PROGRESS: "Service In Progress",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };

    return labels[status] || status;
  };

  return (
    <div className="page-shell">
      <div className="page-heading booking-page-heading">
        <div>
          <span className="eyebrow">
            CUSTOMER WORKSPACE
          </span>

          <h1>My Bookings</h1>

          <p>
            Track your service, quote,
            payment and completion status.
          </p>
        </div>

        <div className="heading-orb">
          ✦
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

          <h2>No bookings yet</h2>

          <p>
            Your service bookings will
            appear here.
          </p>
        </div>
      ) : (
        <div className="booking-grid">
          {bookings.map((booking) => (
            <div
              className="booking-card-3d"
              key={booking.id}
            >
              <div className="booking-card-glow"></div>

              <div className="booking-top">
                <div>
                  <span className="booking-kicker">
                    BOOKING #{booking.id}
                  </span>

                  <h2>
                    {booking.service}
                  </h2>
                </div>

                <span
                  className={`booking-status status-${booking.status.toLowerCase()}`}
                >
                  {getStatusLabel(
                    booking.status
                  )}
                </span>
              </div>

              <div className="booking-info-grid">
                <div className="booking-info-box">
                  <span>Service Date</span>
                  <strong>
                    {new Date(
                      booking.booking_date
                    ).toLocaleString()}
                  </strong>
                </div>

                <div className="booking-info-box">
                  <span>Amount</span>
                  <strong>
                    {booking.amount
                      ? `₹${booking.amount}`
                      : "Quote Pending"}
                  </strong>
                </div>
              </div>

              {booking.status ===
                "PENDING" && (
                <div className="booking-notice waiting-notice">
                  <span>◷</span>
                  <div>
                    <strong>
                      Waiting for technician
                    </strong>

                    {booking.pending_technician ? (
                      <p>
                        Request pending with{" "}
                        <b>
                          {
                            booking.pending_technician
                          }
                        </b>
                      </p>
                    ) : (
                      <p>
                        Your technician request
                        is being processed.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {booking.technician && (
                <div className="booking-section">
                  <div className="section-heading-small">
                    <span>◈</span>
                    TECHNICIAN
                  </div>

                  <div className="technician-mini-card">
                    <div className="tech-avatar-large">
                      {booking.technician
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {booking.technician}
                      </strong>

                      <p>
                        {
                          booking.experience_years
                        }{" "}
                        years experience
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {booking.problem_description && (
                <div className="booking-section">
                  <div className="section-heading-small">
                    <span>⌁</span>
                    YOUR PROBLEM
                  </div>

                  <div className="problem-mini-card">
                    {
                      booking.problem_description
                    }
                  </div>
                </div>
              )}

              {booking.quote_status ===
                "WAITING_TECHNICIAN" && (
                <div className="booking-notice quote-waiting-notice">
                  <span>₹</span>

                  <div>
                    <strong>
                      Waiting for repair quote
                    </strong>

                    <p>
                      Technician will review
                      your problem and send
                      the repair price.
                    </p>
                  </div>
                </div>
              )}

              {booking.quote_status ===
                "QUOTED" && (
                <div className="quote-customer-card">
                  <div>
                    <span className="section-heading-small">
                      <span>₹</span>
                      REPAIR QUOTE
                    </span>

                    <h3>
                      ₹
                      {
                        booking.quoted_amount
                      }
                    </h3>

                    <p>
                      Technician has submitted
                      a repair quote.
                    </p>
                  </div>

                  <div className="quote-customer-actions">
                    <button
                      className="action-button accept-button"
                      onClick={() =>
                        acceptQuote(
                          booking.id
                        )
                      }
                    >
                      ✓ Accept Quote
                    </button>

                    <button
                      className="action-button reject-button"
                      onClick={() =>
                        rejectQuote(
                          booking.id
                        )
                      }
                    >
                      × Reject
                    </button>
                  </div>
                </div>
              )}

              {booking.quote_status ===
                "ACCEPTED" && (
                <div className="booking-notice accepted-notice">
                  <span>✓</span>

                  <div>
                    <strong>
                      Repair quote accepted
                    </strong>

                    <p>
                      Final Amount:{" "}
                      <b>
                        ₹{booking.amount}
                      </b>
                    </p>
                  </div>
                </div>
              )}

              {booking.quote_status ===
                "REJECTED" && (
                <div className="booking-notice rejected-notice">
                  <span>×</span>

                  <div>
                    <strong>
                      Repair quote rejected
                    </strong>

                    <p>
                      This booking has been
                      cancelled.
                    </p>
                  </div>
                </div>
              )}

              {booking.quote_status ===
                "ACCEPTED" && (
                <div className="booking-section">
                  <div className="section-heading-small">
                    <span>◇</span>
                    PAYMENT
                  </div>

                  <div className="payment-panel">
                    {booking.payment_status ===
                    "PAID" ? (
                      <div className="payment-complete">
                        <div className="payment-icon">
                          ✓
                        </div>

                        <div>
                          <strong>
                            Payment completed
                          </strong>

                          <p>
                            Via{" "}
                            {
                              booking.payment_method
                            }
                          </p>
                        </div>
                      </div>
                    ) : booking.payment_method ===
                      "CASH" ? (
                      <div>
                        <div className="payment-pending-row">
                          <span>◷</span>

                          <div>
                            <strong>
                              Cash payment selected
                            </strong>

                            <p>
                              Pay ₹
                              {
                                booking.amount
                              }{" "}
                              to the technician.
                            </p>
                          </div>
                        </div>

                        <div className="waiting-text">
                          ⏳ Waiting for technician
                          to confirm cash received
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="payment-pending-row">
                          <span>₹</span>

                          <div>
                            <strong>
                              Payment required
                            </strong>

                            <p>
                              Final amount ₹
                              {
                                booking.amount
                              }
                            </p>
                          </div>
                        </div>

                        <div className="payment-actions">
                          <button
                            className="action-button upi-button"
                            onClick={() =>
                              payNow(
                                booking.id
                              )
                            }
                          >
                            ◈ Pay via UPI
                          </button>

                          <button
                            className="action-button cash-button"
                            onClick={() =>
                              selectCashPayment(
                                booking.id
                              )
                            }
                          >
                            ₹ Pay Cash
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {booking.status ===
                "IN_PROGRESS" &&
                booking.payment_status ===
                  "PAID" &&
                otps[booking.id] && (
                  <div className="otp-card-3d">
                    <div className="otp-label">
                      COMPLETION OTP
                    </div>

                    <div className="otp-number">
                      {
                        otps[booking.id]
                          .otp
                      }
                    </div>

                    <p>
                      Share this OTP with the
                      technician only after the
                      service is ready to close.
                    </p>
                  </div>
                )}

              {booking.status ===
                "IN_PROGRESS" &&
                booking.payment_status !==
                  "PAID" && (
                <div className="booking-notice warning-notice">
                  <span>!</span>

                  <p>
                    Payment is still pending.
                    Completion OTP will be
                    available after payment.
                  </p>
                </div>
              )}

              {booking.status ===
                "COMPLETED" && (
                <div className="review-section">
                  {booking.review_rating ? (
                    <div className="review-submitted-card">
                      <div>
                        <span className="section-heading-small">
                          <span>★</span>
                          YOUR REVIEW
                        </span>

                        <div className="review-stars">
                          {"★".repeat(
                            booking.review_rating
                          )}
                          {"☆".repeat(
                            5 -
                              booking.review_rating
                          )}
                        </div>

                        <strong>
                          {
                            booking.review_rating
                          }
                          /5
                        </strong>

                        <p>
                          {
                            booking.review_comment
                          }
                        </p>
                      </div>

                      <span className="review-done">
                        ✓ Submitted
                      </span>
                    </div>
                  ) : (
                    <div className="review-form-card">
                      <span className="section-heading-small">
                        <span>★</span>
                        RATE YOUR TECHNICIAN
                      </span>

                      <div className="rating-buttons">
                        {[1, 2, 3, 4, 5].map(
                          (star) => (
                            <button
                              key={star}
                              className={
                                star <=
                                (rating[
                                  booking.id
                                ] || 0)
                                  ? "star-active"
                                  : ""
                              }
                              onClick={() =>
                                setRating(
                                  (prev) => ({
                                    ...prev,
                                    [booking.id]:
                                      star,
                                  })
                                )
                              }
                            >
                              ★
                            </button>
                          )
                        )}
                      </div>

                      <textarea
                        value={
                          comment[
                            booking.id
                          ] || ""
                        }
                        onChange={(e) =>
                          setComment(
                            (prev) => ({
                              ...prev,
                              [booking.id]:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="Tell us about your experience..."
                      />

                      <button
                        className="action-button review-button"
                        onClick={() =>
                          submitReview(
                            booking.id
                          )
                        }
                      >
                        Submit Review →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookings;