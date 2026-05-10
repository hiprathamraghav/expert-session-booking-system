import express from "express";
import {
  createBooking,
  getBookings,
  updateBookingStatus
} from "../controllers/bookingController.js";

export const bookingRouter = express.Router();

bookingRouter.get("/", getBookings);
bookingRouter.post("/", createBooking);
bookingRouter.patch("/:id/status", updateBookingStatus);
