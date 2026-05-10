import React from "react";
import { CalendarDays, Search, UserRoundCheck } from "lucide-react";
import { NavLink, Route, Routes } from "react-router-dom";
import BookingPage from "./pages/BookingPage.jsx";
import ExpertDetailPage from "./pages/ExpertDetailPage.jsx";
import ExpertListPage from "./pages/ExpertListPage.jsx";
import MyBookingsPage from "./pages/MyBookingsPage.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand" to="/">
          <UserRoundCheck size={24} />
          <span>Expert Sessions</span>
        </NavLink>
        <nav className="nav-links" aria-label="Primary">
          <NavLink to="/">
            <Search size={18} />
            Experts
          </NavLink>
          <NavLink to="/bookings">
            <CalendarDays size={18} />
            My Bookings
          </NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<ExpertListPage />} />
          <Route path="/experts/:id" element={<ExpertDetailPage />} />
          <Route path="/book/:id" element={<BookingPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
