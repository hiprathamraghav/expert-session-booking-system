import mongoose from "mongoose";
import { Booking } from "../models/Booking.js";
import { Expert } from "../models/Expert.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { buildSlotGroups } from "../utils/slots.js";

export const getExperts = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 6, 1), 24);
  const skip = (page - 1) * limit;
  const { search, category } = req.query;

  const filter = {};

  if (search) {
    filter.name = { $regex: search.trim(), $options: "i" };
  }

  if (category) {
    filter.category = category.trim();
  }

  const [experts, total, categories] = await Promise.all([
    Expert.find(filter)
      .sort({ rating: -1, experience: -1, name: 1 })
      .skip(skip)
      .limit(limit)
      .select("name category experience rating bio")
      .lean(),
    Expert.countDocuments(filter),
    Expert.distinct("category")
  ]);

  res.json({
    data: experts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1)
    },
    categories: categories.sort()
  });
});

export const getExpertById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw httpError(400, "Invalid expert id");
  }

  const expert = await Expert.findById(id).lean();

  if (!expert) {
    throw httpError(404, "Expert not found");
  }

  const bookings = await Booking.find({ expert: id }).select("date timeSlot").lean();

  res.json({
    data: {
      ...expert,
      slotGroups: buildSlotGroups(expert, bookings)
    }
  });
});
