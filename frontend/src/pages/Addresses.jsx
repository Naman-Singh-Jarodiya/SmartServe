import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [label, setLabel] = useState("");
  const [searchText, setSearchText] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [location, setLocation] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const [message, setMessage] = useState("");
  const [locationMessage, setLocationMessage] =
    useState("");

  const [loadingSuggestions, setLoadingSuggestions] =
    useState(false);

  const [findingLocation, setFindingLocation] =
    useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const role = user.role || "CUSTOMER";

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const getAddresses = async () => {
    try {
      const res = await api.get(
        "/addresses",
        authConfig
      );

      setAddresses(res.data);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to load addresses"
      );
    }
  };

  useEffect(() => {
    getAddresses();
  }, []);

  useEffect(() => {
    if (
      !searchText ||
      searchText.trim().length < 3
    ) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);

        const res = await api.get(
          `/addresses/autocomplete?text=${encodeURIComponent(
            searchText
          )}`,
          authConfig
        );

        setSuggestions(res.data);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const getAddressIcon = (labelValue) => {
    const value = labelValue.toLowerCase();

    if (
      value.includes("home") ||
      value.includes("house") ||
      value.includes("hostel")
    ) {
      return "⌂";
    }

    if (
      value.includes("office") ||
      value.includes("work")
    ) {
      return "▣";
    }

    if (
      value.includes("shop") ||
      value.includes("store")
    ) {
      return "⌑";
    }

    if (
      value.includes("workshop") ||
      value.includes("garage")
    ) {
      return "⚙";
    }

    return "◈";
  };

  const selectSuggestion = (item) => {
    setSearchText(item.formatted);

    setAddress(
      item.address_line1 ||
        item.formatted
    );

    setCity(item.city || "");
    setState(item.state || "");
    setPincode(item.postcode || "");

    setLocation({
      latitude: item.latitude,
      longitude: item.longitude,
    });

    setSuggestions([]);

    setLocationMessage(
      "✅ Exact address location selected"
    );
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Geolocation is not supported by this browser"
      );
      return;
    }

    setLocationMessage(
      "Getting your current location..."
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude:
            position.coords.latitude,
          longitude:
            position.coords.longitude,
        });

        setLocationMessage(
          "✅ Current location captured"
        );
      },
      (error) => {
        if (error.code === 1) {
          setLocationMessage(
            "Location permission denied"
          );
        } else {
          setLocationMessage(
            "Unable to get current location"
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const resetForm = () => {
    setLabel("");
    setSearchText("");
    setAddress("");
    setCity("");
    setState("");
    setPincode("");
    setLocation(null);
    setSuggestions([]);
    setLocationMessage("");
    setMessage("");
  };

  const addAddress = async () => {
    if (!label.trim()) {
      setMessage(
        "Please enter an address name"
      );
      return;
    }

    if (!address.trim()) {
      setMessage(
        "Please select an address"
      );
      return;
    }

    if (!city || !state || !pincode) {
      setMessage(
        "Please select a complete address"
      );
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setMessage(
        "Please enter a valid 6-digit PIN code"
      );
      return;
    }

    if (!location) {
      setMessage(
        "Please select an address location or use your current location"
      );
      return;
    }

    try {
      await api.post(
        "/addresses",
        {
          label: label.trim(),
          address: address.trim(),
          city,
          state,
          pincode,
          latitude: location.latitude,
          longitude: location.longitude,
        },
        authConfig
      );

      setMessage(
        "✅ Address added successfully"
      );

      setShowForm(false);
      resetForm();

      await getAddresses();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to add address"
      );
    }
  };

  const selectAddress = async (id) => {
    try {
      await api.put(
        `/addresses/${id}/select`,
        {},
        authConfig
      );

      setMessage(
        "✅ Address selected successfully"
      );

      await getAddresses();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to select address"
      );
    }
  };

  const deleteAddress = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/addresses/${id}`,
        authConfig
      );

      setMessage(
        "Address deleted successfully"
      );

      await getAddresses();
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to delete address"
      );
    }
  };

  return (
    <div className="page-shell address-page">
      <div className="address-hero">
        <div>
          <span className="eyebrow">
            {role === "TECHNICIAN"
              ? "TECHNICIAN LOCATION"
              : "CUSTOMER LOCATION"}
          </span>

          <h1>My Addresses</h1>

          <p>
            Keep your service locations ready
            for faster bookings and accurate
            technician distance.
          </p>
        </div>

        <div className="address-hero-orb">
          ◈
        </div>
      </div>

      {message && (
        <div className="floating-message">
          <span>✦</span>
          {message}
        </div>
      )}

      <div className="address-toolbar">
        <div>
          <span className="address-count">
            {addresses.length}
          </span>

          <span className="address-count-text">
            {addresses.length === 1
              ? " saved address"
              : " saved addresses"}
          </span>
        </div>

        <button
          className="add-address-main-button"
          onClick={() => {
            setShowForm(!showForm);
            setMessage("");
          }}
        >
          {showForm ? "× Close" : "+ Add Address"}
        </button>
      </div>

      {showForm && (
        <div className="address-form-3d">
          <div className="form-header">
            <div>
              <span className="eyebrow">
                NEW LOCATION
              </span>

              <h2>Add New Address</h2>

              <p>
                Choose an exact location for
                accurate service distance.
              </p>
            </div>

            <div className="form-icon">
              +
            </div>
          </div>

          <div className="address-form-grid">
            <div className="field-full">
              <label>
                Address Name
              </label>

              <input
                type="text"
                placeholder="Home, Office, Workshop..."
                value={label}
                onChange={(e) =>
                  setLabel(e.target.value)
                }
              />
            </div>

            <div className="field-full">
              <label>
                Search Address
              </label>

              <div className="search-field">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search your exact address..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(
                      e.target.value
                    );
                    setLocation(null);
                    setLocationMessage("");
                  }}
                />
              </div>

              {loadingSuggestions && (
                <div className="suggestion-loading">
                  Searching locations...
                </div>
              )}

              {suggestions.length > 0 && (
                <div className="address-suggestions">
                  {suggestions.map(
                    (item, index) => (
                      <button
                        type="button"
                        className="address-suggestion"
                        key={`${item.latitude}-${item.longitude}-${index}`}
                        onClick={() =>
                          selectSuggestion(
                            item
                          )
                        }
                      >
                        <span className="suggestion-icon">
                          ◉
                        </span>

                        <span>
                          {item.formatted}
                        </span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <div>
              <label>Address</label>

              <input
                type="text"
                placeholder="Selected address"
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label>City</label>

              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
              />
            </div>

            <div>
              <label>State</label>

              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) =>
                  setState(e.target.value)
                }
              />
            </div>

            <div>
              <label>PIN Code</label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit PIN"
                value={pincode}
                onChange={(e) =>
                  setPincode(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
              />
            </div>
          </div>

          <div className="location-choice-box">
            <div className="location-choice-top">
              <div>
                <span className="section-heading-small">
                  <span>◉</span>
                  LOCATION
                </span>

                <strong>
                  Set your exact service location
                </strong>
              </div>

              <span className="location-secure">
                GPS READY
              </span>
            </div>

            <div className="location-choice-actions">
              <button
                type="button"
                className="location-current-button"
                onClick={
                  getCurrentLocation
                }
              >
                <span>◉</span>
                Use My Current Location
              </button>

              {locationMessage && (
                <div className="location-result">
                  {locationMessage}
                </div>
              )}
            </div>

            {location && (
              <div className="coordinates-chip">
                <span>⌖</span>
                {location.latitude.toFixed(
                  5
                )}
                {" , "}
                {location.longitude.toFixed(
                  5
                )}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              className="save-address-button"
              onClick={addAddress}
            >
              Save Address →
            </button>

            <button
              className="cancel-address-button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="address-empty-state">
          <div className="address-empty-icon">
            ◈
          </div>

          <h2>No saved addresses</h2>

          <p>
            Add Home, Office, Workshop or any
            location where you need SmartServe.
          </p>

          {!showForm && (
            <button
              className="add-address-main-button"
              onClick={() =>
                setShowForm(true)
              }
            >
              + Add Your First Address
            </button>
          )}
        </div>
      ) : (
        <div className="address-grid">
          {addresses.map((item) => (
            <div
              className={`address-card-3d ${
                item.is_selected
                  ? "address-selected"
                  : ""
              }`}
              key={item.id}
            >
              <div className="address-card-light"></div>

              <div className="address-card-header">
                <div className="address-type-icon">
                  {getAddressIcon(
                    item.label
                  )}
                </div>

                <div className="address-title-block">
                  <span className="address-mini-label">
                    SAVED LOCATION
                  </span>

                  <h3>{item.label}</h3>
                </div>

                {item.is_selected && (
                  <span className="selected-badge">
                    ✓ SELECTED
                  </span>
                )}
              </div>

              <div className="address-main">
                <p className="address-line">
                  {item.address}
                </p>

                <p className="address-city">
                  {item.city},{" "}
                  {item.state}
                </p>

                <p className="address-pin">
                  PIN {item.pincode}
                </p>
              </div>

              <div className="address-location-chip">
                <span>⌖</span>

                <span>
                  Location ready for distance
                  calculation
                </span>
              </div>

              <div className="address-divider"></div>

              <div className="address-card-footer">
                {!item.is_selected ? (
                  <button
                    className="select-address-button"
                    onClick={() =>
                      selectAddress(
                        item.id
                      )
                    }
                  >
                    ◉ Use This Address
                  </button>
                ) : (
                  <div className="selected-text">
                    ✓ Active service location
                  </div>
                )}

                <button
                  className="delete-address-button"
                  onClick={() =>
                    deleteAddress(item.id)
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        className="address-back-button"
        onClick={() =>
          navigate("/dashboard")
        }
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}

export default Addresses;