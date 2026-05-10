import React from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../api/client.js";
import { getSocket } from "../api/socket.js";
import ErrorState from "../components/ErrorState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { useExpertStore } from "../store/expertStore.js";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  date: "",
  timeSlot: "",
  notes: ""
};

export default function BookingPage() {
  const { id } = useParams();
  const expert = useExpertStore((state) => state.expertById[id]);
  const loading = useExpertStore((state) => state.expertLoading[id]);
  const pageError = useExpertStore((state) => state.expertErrors[id]);
  const fetchExpert = useExpertStore((state) => state.fetchExpert);
  const markSlotBooked = useExpertStore((state) => state.markSlotBooked);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const loadExpert = useCallback(async () => {
    try {
      const nextExpert = await fetchExpert(id);
      const firstOpenSlot = findFirstOpenSlot(nextExpert.slotGroups);
      setForm((current) => ({
        ...current,
        date: current.date || firstOpenSlot?.date || "",
        timeSlot: current.timeSlot || firstOpenSlot?.time || ""
      }));
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

  const selectedDateSlots = useMemo(() => {
    return expert?.slotGroups.find((group) => group.date === form.date)?.slots || [];
  }, [expert, form.date]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSuccess("");
  }

  function validate() {
    const nextErrors = {};

    if (form.name.trim().length < 2) {
      nextErrors.name = "Enter at least 2 characters.";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email.";
    }

    if (form.phone.trim().length < 7) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (!form.date) {
      nextErrors.date = "Choose a date.";
    }

    if (!form.timeSlot) {
      nextErrors.timeSlot = "Choose a time slot.";
    }

    const selected = selectedDateSlots.find((slot) => slot.time === form.timeSlot);
    if (selected?.booked) {
      nextErrors.timeSlot = "This slot has just been booked. Choose another time.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submitBooking(event) {
    event.preventDefault();
    setSuccess("");

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post("/bookings", {
        expertId: id,
        ...form
      });
      setSuccess(response.data.message || "Booking created successfully.");
      setForm((current) => ({ ...initialForm, email: current.email }));
      await fetchExpert(id, { silent: true });
    } catch (requestError) {
      const responseErrors = requestError.response?.data?.details;
      if (responseErrors) {
        setErrors(responseErrors);
      } else {
        setErrors({ form: getErrorMessage(requestError) });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!expert && !pageError) {
    return <LoadingState label="Loading booking form" />;
  }

  if (pageError) {
    return <ErrorState message={pageError} onRetry={loadExpert} />;
  }

  return expert ? (
    <section className="page">
      <Link className="back-link" to={`/experts/${id}`}>
        <ArrowLeft size={18} />
        Back to details
      </Link>

      <div className="booking-layout">
        <aside className="profile-panel compact">
          <p className="category">{expert.category}</p>
          <h1>{expert.name}</h1>
          <p>{expert.bio}</p>
        </aside>

        <form className="booking-form" onSubmit={submitBooking}>
          <div className="section-title">
            <h2>Book a session</h2>
            <p>All fields except notes are required.</p>
          </div>

          {errors.form ? <div className="inline-error">{errors.form}</div> : null}
          {success ? (
            <div className="success-message" role="status">
              <CheckCircle2 size={18} />
              {success}
            </div>
          ) : null}

          <div className="form-grid">
            <Field label="Name" error={errors.name}>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Your name"
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <input
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="you@example.com"
                type="email"
              />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="+91 98765 43210"
              />
            </Field>
            <Field label="Date" error={errors.date}>
              <select
                value={form.date}
                onChange={(event) => {
                  const date = event.target.value;
                  const firstSlot =
                    expert.slotGroups
                      .find((group) => group.date === date)
                      ?.slots.find((slot) => !slot.booked)?.time || "";
                  setForm((current) => ({ ...current, date, timeSlot: firstSlot }));
                  setErrors((current) => ({
                    ...current,
                    date: undefined,
                    timeSlot: undefined
                  }));
                }}
              >
                <option value="">Choose date</option>
                {expert.slotGroups.map((group) => (
                  <option key={group.date} value={group.date}>
                    {formatDate(group.date)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Time Slot" error={errors.timeSlot}>
            <div className="slot-selector">
              {selectedDateSlots.map((slot) => (
                <button
                  className={`slot-button ${
                    form.timeSlot === slot.time ? "slot-selected" : ""
                  }`}
                  disabled={slot.booked}
                  key={slot.time}
                  type="button"
                  onClick={() => updateField("timeSlot", slot.time)}
                >
                  {slot.time}
                  {slot.booked ? <span>Booked</span> : null}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Notes" error={errors.notes}>
            <textarea
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Share context for the expert"
              rows="4"
            />
          </Field>

          <button className="button button-wide" disabled={submitting} type="submit">
            {submitting ? "Booking..." : "Confirm booking"}
          </button>
        </form>
      </div>
    </section>
  ) : null;
}

function Field({ label, error, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error ? <small>{error}</small> : null}
    </label>
  );
}

function findFirstOpenSlot(groups = []) {
  for (const group of groups) {
    const slot = group.slots.find((item) => !item.booked);
    if (slot) {
      return { date: group.date, time: slot.time };
    }
  }

  return null;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00`));
}
