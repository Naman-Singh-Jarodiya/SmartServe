import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SiteLayout from "./components/SiteLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import BookService from "./pages/BookService";
import Bookings from "./pages/Bookings";
import Addresses from "./pages/Addresses";
import Profile from "./pages/Profile";

import TechnicianBookings from "./pages/TechnicianBookings";
import TechnicianRequests from "./pages/TechnicianRequests";
import TechnicianProfile from "./pages/TechnicianProfile";

import AdminServices from "./pages/AdminServices";
import AdminBookings from "./pages/AdminBookings";

function App() {
  useEffect(() => {
    const decorateButtons = () => {
      document.querySelectorAll("button").forEach((button) => {
        const text = button.textContent.trim().toLowerCase();
        button.classList.remove("btn-accept", "btn-reject", "btn-pay-upi", "btn-pay-cash", "btn-quote", "btn-send", "btn-otp", "btn-success", "btn-danger");
        if (text.includes("accept quote") || text === "accept") button.classList.add("btn-accept");
        else if (text.includes("reject quote") || text === "reject") button.classList.add("btn-reject");
        else if (text.includes("pay via upi") || text.includes("pay now")) button.classList.add("btn-pay-upi");
        else if (text.includes("pay cash" ) || text.includes("cash received") || text.includes("confirm cash")) button.classList.add("btn-pay-cash");
        else if (text.includes("send quote") || text.includes("repair quote")) button.classList.add("btn-quote");
        else if (text.includes("submit request") || text === "send request" || text === "request") button.classList.add("btn-send");
        else if (text.includes("otp") || text.includes("verify & complete")) button.classList.add("btn-otp");
      });
    };
    decorateButtons();
    const observer = new MutationObserver(decorateButtons);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <BrowserRouter>
      <SiteLayout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/services" element={<Services />} />
          <Route path="/book-service/:id" element={<BookService />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/technician/requests" element={<TechnicianRequests />} />
          <Route path="/technician/bookings" element={<TechnicianBookings />} />
          <Route path="/technician/profile" element={<TechnicianProfile />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
        </Routes>
      </SiteLayout>
    </BrowserRouter>
  );
}

export default App;
