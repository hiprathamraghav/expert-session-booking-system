import mongoose from "mongoose";

const slotGroupSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    },
    times: [
      {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):[0-5]\d$/
      }
    ]
  },
  { _id: false }
);

const expertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    experience: {
      type: Number,
      required: true,
      min: 0
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5
    },
    bio: {
      type: String,
      required: true,
      trim: true
    },
    availableSlots: {
      type: [slotGroupSchema],
      default: []
    }
  },
  { timestamps: true }
);

export const Expert = mongoose.model("Expert", expertSchema);
