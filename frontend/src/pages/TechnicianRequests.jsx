import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function TechnicianRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [quoteAmount, setQuoteAmount] = useState({});

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const getRequests = async () => {
    try {
      const res = await api.get(
        "/technicians/requests",
        authConfig
      );

      setRequests(res.data);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to load requests"
      );
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  const respondToRequest = async (
    requestId,
    status
  ) => {
    try {
      await api.put(
        `/technicians/requests/${requestId}/respond`,
        { status },
        authConfig
      );

      setMessage(
        status === "ACCEPTED"
          ? "Request accepted successfully"
          : "Request rejected"
      );

      await getRequests();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to respond to request"
      );
    }
  };

  const sendQuote = async (bookingId) => {
    const amount = Number(
      quoteAmount[bookingId]
    );

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage(
        "Please enter a valid repair price"
      );
      return;
    }

    try {
      await api.post(
        `/bookings/${bookingId}/quote`,
        {
          quoted_amount: amount,
        },
        authConfig
      );

      setMessage(
        "Repair quote sent successfully"
      );

      setQuoteAmount((prev) => ({
        ...prev,
        [bookingId]: "",
      }));

      await getRequests();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to send quote"
      );
    }
  };

  return (
    <div className="page-shell">
      <div className="page-heading request-heading">
        <div>
          <span className="eyebrow">TECHNICIAN WORKSPACE</span>

          <h1>Service Requests</h1>

          <p>
            Review customer problems, accept requests
            and send repair quotes.
          </p>
        </div>

        <div className="heading-orb">⚙</div>
      </div>

      {message && (
        <div className="floating-message">
          <span>✦</span>
          {message}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="empty-state request-empty">
          <div className="empty-icon">◌</div>
          <h2>No service requests</h2>
          <p>
            New customer requests will appear here.
          </p>
        </div>
      ) : (
        <div className="request-grid">
          {requests.map((request) => (
            <div
              className="request-card-3d"
              key={request.request_id}
            >
              <div className="request-card-glow"></div>

              <div className="request-card-top">
                <div>
                  <span className="request-kicker">
                    SERVICE REQUEST
                  </span>

                  <h2>{request.service}</h2>
                </div>

                <div
                  className={`request-status ${
                    request.request_status ===
                    "ACCEPTED"
                      ? "status-accepted"
                      : request.request_status ===
                        "REJECTED"
                      ? "status-rejected"
                      : "status-pending"
                  }`}
                >
                  {request.request_status}
                </div>
              </div>

              <div className="request-meta-grid">
                <div className="meta-box">
                  <span>Customer</span>
                  <strong>
                    {request.customer}
                  </strong>
                </div>

                <div className="meta-box">
                  <span>Service Date</span>
                  <strong>
                    {new Date(
                      request.booking_date
                    ).toLocaleString()}
                  </strong>
                </div>

                <div className="meta-box">
                  <span>Your Experience</span>
                  <strong>
                    {request.experience_years} years
                  </strong>
                </div>

                <div className="meta-box">
                  <span>Quote Status</span>
                  <strong>
                    {request.quote_status ||
                      "NOT_STARTED"}
                  </strong>
                </div>
              </div>

              <div className="problem-box">
                <div className="section-label">
                  <span className="section-icon">⌁</span>
                  CUSTOMER PROBLEM
                </div>

                <p>
                  {request.problem_description ||
                    "No problem description provided."}
                </p>
              </div>

              {request.request_status ===
                "PENDING" && (
                <div className="request-actions">
                  <button
                    className="action-button accept-button"
                    onClick={() =>
                      respondToRequest(
                        request.request_id,
                        "ACCEPTED"
                      )
                    }
                  >
                    <span>✓</span>
                    Accept Request
                  </button>

                  <button
                    className="action-button reject-button"
                    onClick={() =>
                      respondToRequest(
                        request.request_id,
                        "REJECTED"
                      )
                    }
                  >
                    <span>×</span>
                    Reject
                  </button>
                </div>
              )}

              {request.request_status ===
                "ACCEPTED" && (
                <div className="quote-panel">
                  <div className="quote-header">
                    <div>
                      <span className="section-label">
                        REPAIR QUOTE
                      </span>

                      <h3>
                        {request.quote_status ===
                        "QUOTED"
                          ? "Quote sent"
                          : "Set the repair price"}
                      </h3>
                    </div>

                    <div className="quote-symbol">
                      ₹
                    </div>
                  </div>

                  {request.quote_status ===
                  "QUOTED" ? (
                    <div className="quote-waiting">
                      <div className="quote-price">
                        ₹
                        {request.quoted_amount}
                      </div>

                      <div>
                        <strong>
                          Quote sent successfully
                        </strong>

                        <p>
                          ⏳ Waiting for customer
                          approval
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="quote-input-row">
                      <div className="price-input-wrap">
                        <span>₹</span>

                        <input
                          type="number"
                          min="1"
                          placeholder="Enter repair price"
                          value={
                            quoteAmount[
                              request.booking_id
                            ] || ""
                          }
                          onChange={(e) =>
                            setQuoteAmount(
                              (prev) => ({
                                ...prev,
                                [request.booking_id]:
                                  e.target.value,
                              })
                            )
                          }
                        />
                      </div>

                      <button
                        className="action-button quote-button"
                        onClick={() =>
                          sendQuote(
                            request.booking_id
                          )
                        }
                      >
                        Send Quote
                        <span>↗</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {request.quote_status ===
                "ACCEPTED" && (
                <div className="approved-panel">
                  <div className="approved-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Customer accepted the quote
                    </strong>

                    <p>
                      Final Amount:{" "}
                      <b>
                        ₹
                        {
                          request.quoted_amount
                        }
                      </b>
                    </p>
                  </div>

                  <button
                    className="action-button continue-button"
                    onClick={() =>
                      navigate(
                        "/technician/bookings"
                      )
                    }
                  >
                    View Job
                    <span>→</span>
                  </button>
                </div>
              )}

              {request.quote_status ===
                "REJECTED" && (
                <div className="rejected-panel">
                  <span>!</span>
                  Customer rejected the repair quote.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        className="back-dashboard-button"
        onClick={() =>
          navigate("/dashboard")
        }
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}

export default TechnicianRequests;