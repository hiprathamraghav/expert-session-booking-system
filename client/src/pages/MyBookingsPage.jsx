import React from "react";
import { Search } from "lucide-react";
import { useState } from "react";
import { api, getErrorMessage } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

export default function MyBookingsPage() {
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function loadBookings(event) {
    event?.preventDefault();
    setSearched(true);
    setError("");

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      setBookings([]);
      return;
    }

    setLoading(true);

    try {
      const response = await api.get("/bookings", {
        params: { email: email.trim() }
      });
      setBookings(response.data.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Booking lookup</p>
          <h1>My Bookings</h1>
        </div>
      </div>

      <form className="toolbar" onSubmit={loadBookings}>
        <label className="grow">
          <span>Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            type="email"
          />
        </label>
        <button className="button" type="submit">
          <Search size={18} />
          Find bookings
        </button>
      </form>

      {loading ? <LoadingState label="Loading bookings" /> : null}
      {error ? <ErrorState message={error} /> : null}

      {!loading && !error && searched && bookings.length === 0 ? (
        <EmptyState title="No bookings found" message="No sessions are linked to this email." />
      ) : null}

      {!loading && !error && bookings.length > 0 ? (
        <div className="booking-list">
          {bookings.map((booking) => (
            <article className="booking-row" key={booking._id}>
              <div>
                <h2>{booking.expert?.name || "Expert"}</h2>
                <p>
                  {booking.expert?.category || "Session"} · {formatDate(booking.date)} at{" "}
                  {booking.timeSlot}
                </p>
                {booking.notes ? <p className="notes">{booking.notes}</p> : null}
              </div>
              <StatusBadge status={booking.status} />
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00`));
}
