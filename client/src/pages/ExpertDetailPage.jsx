import React from "react";
import { ArrowLeft, BriefcaseBusiness, CalendarCheck, Star } from "lucide-react";
import { useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getSocket } from "../api/socket.js";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { useExpertStore } from "../store/expertStore.js";

export default function ExpertDetailPage() {
  const { id } = useParams();
  const expert = useExpertStore((state) => state.expertById[id]);
  const loading = useExpertStore((state) => state.expertLoading[id]);
  const error = useExpertStore((state) => state.expertErrors[id]);
  const fetchExpert = useExpertStore((state) => state.fetchExpert);
  const markSlotBooked = useExpertStore((state) => state.markSlotBooked);

  const loadExpert = useCallback(async () => {
    try {
      await fetchExpert(id);
    } catch {
      // The store owns the user-facing error message.
    }
  }, [fetchExpert, id]);

  useEffect(() => {
    if (!expert?.slotGroups) {
      loadExpert();
    }
  }, [expert, loadExpert]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("joinExpert", id);

    function handleSlotBooked(payload) {
      if (payload.expertId !== id) {
        return;
      }

      markSlotBooked(payload);
    }

    socket.on("slotBooked", handleSlotBooked);

    return () => {
      socket.emit("leaveExpert", id);
      socket.off("slotBooked", handleSlotBooked);
    };
  }, [id, markSlotBooked]);

  if (!expert && !error) {
    return <LoadingState label="Loading expert details" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadExpert} />;
  }

  return expert ? (
    <section className="page">
      <Link className="back-link" to="/">
        <ArrowLeft size={18} />
        Back to experts
      </Link>

      <div className="detail-layout">
        <aside className="profile-panel">
          <p className="category">{expert.category}</p>
          <h1>{expert.name}</h1>
          <p>{expert.bio}</p>
          <div className="profile-stats">
            <span>
              <BriefcaseBusiness size={18} />
              {expert.experience} years
            </span>
            <span>
              <Star size={18} />
              {expert.rating.toFixed(1)} rating
            </span>
          </div>
          <Link className="button" to={`/book/${expert._id}`}>
            <CalendarCheck size={18} />
            Book session
          </Link>
        </aside>

        <section className="slots-panel">
          <div className="section-title">
            <h2>Available slots</h2>
            <p>Booked slots update live when another user reserves them.</p>
          </div>

          <div className="slot-groups">
            {expert.slotGroups.map((group) => (
              <article className="slot-group" key={group.date}>
                <h3>{formatDate(group.date)}</h3>
                <div className="slot-list">
                  {group.slots.map((slot) => (
                    <span
                      className={`slot-chip ${slot.booked ? "slot-booked" : ""}`}
                      key={`${group.date}-${slot.time}`}
                    >
                      {slot.time}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  ) : null;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00`));
}
