import mongoose from "mongoose";
import validator from "validator";
import { Booking } from "../models/Booking.js";
import { Expert } from "../models/Expert.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { isSlotOffered } from "../utils/slots.js";
import { emitSlotBooked } from "../socket.js";

const allowedStatuses = ["Pending", "Confirmed", "Completed"];

function validateBookingPayload(payload) {
  const errors = {};
  const name = payload.name?.trim();
  const email = payload.email?.trim().toLowerCase();
  const phone = payload.phone?.trim();
  const date = payload.date?.trim();
  const timeSlot = payload.timeSlot?.trim();
  const expertId = payload.expertId?.trim();
  const notes = payload.notes?.trim() || "";

  if (!expertId || !mongoose.isValidObjectId(expertId)) {
    errors.expertId = "A valid expert id is required.";
  }

  if (!name || name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!email || !validator.isEmail(email)) {
    errors.email = "A valid email address is required.";
  }

  if (!phone || !validator.isMobilePhone(phone, "any", { strictMode: false })) {
    errors.phone = "A valid phone number is required.";
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.date = "Date must use YYYY-MM-DD format.";
  }

  if (!timeSlot || !/^([01]\d|2[0-3]):[0-5]\d$/.test(timeSlot)) {
    errors.timeSlot = "Time slot must use HH:mm format.";
  }

  if (notes.length > 1000) {
    errors.notes = "Notes must be 1000 characters or fewer.";
  }

  if (Object.keys(errors).length > 0) {
    throw httpError(400, "Booking validation failed", errors);
  }

  return { expertId, name, email, phone, date, timeSlot, notes };
}

export const createBooking = asyncHandler(async (req, res) => {
  const { expertId, name, email, phone, date, timeSlot, notes } =
    validateBookingPayload(req.body);

  const expert = await Expert.findById(expertId);

  if (!expert) {
    throw httpError(404, "Expert not found");
  }

  if (!isSlotOffered(expert, date, timeSlot)) {
    throw httpError(400, "The selected time slot is not available for this expert.");
  }

  try {
    const booking = await Booking.create({
      expert: expertId,
      name,
      email,
      phone,
      date,
      timeSlot,
      notes
    });

    const populatedBooking = await booking.populate("expert", "name category");

    emitSlotBooked({
      expertId,
      date,
      timeSlot,
      bookingId: booking._id.toString()
    });

    res.status(201).json({
      message: "Booking created successfully.",
      data: populatedBooking
    });
  } catch (error) {
    if (error.code === 11000) {
      throw httpError(409, "This time slot has already been booked.");
    }

    throw error;
  }
});

export const getBookings = asyncHandler(async (req, res) => {
  const email = req.query.email?.trim().toLowerCase();

  if (!email || !validator.isEmail(email)) {
    throw httpError(400, "A valid email query parameter is required.");
  }

  const bookings = await Booking.find({ email })
    .populate("expert", "name category")
    .sort({ date: 1, timeSlot: 1 })
    .lean();

  res.json({ data: bookings });
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw httpError(400, "Invalid booking id");
  }

  if (!allowedStatuses.includes(status)) {
    throw httpError(400, "Status must be Pending, Confirmed, or Completed.");
  }

  const booking = await Booking.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate("expert", "name category");

  if (!booking) {
    throw httpError(404, "Booking not found");
  }

  res.json({
    message: "Booking status updated successfully.",
    data: booking
  });
});
