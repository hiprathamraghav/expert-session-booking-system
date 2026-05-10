import "dotenv/config";
import mongoose from "mongoose";
import { pathToFileURL } from "node:url";
import { connectDB } from "./config/db.js";
import { Expert } from "./models/Expert.js";

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function makeSlots(offsetStart = 1) {
  const times = ["09:00", "10:00", "11:30", "14:00", "15:30", "17:00"];

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + offsetStart + index);

    return {
      date: toDateKey(date),
      times: index % 2 === 0 ? times : times.slice(1, -1)
    };
  });
}

const experts = [
  {
    name: "Dr. Aisha Mehta",
    category: "Career Coaching",
    experience: 12,
    rating: 4.9,
    bio: "Career strategist helping mid-career professionals move into leadership roles.",
    availableSlots: makeSlots(1)
  },
  {
    name: "Rahul Menon",
    category: "Software Architecture",
    experience: 10,
    rating: 4.8,
    bio: "Principal engineer specializing in scalable Node.js, React, and cloud architecture.",
    availableSlots: makeSlots(2)
  },
  {
    name: "Maya Kapoor",
    category: "Product Strategy",
    experience: 9,
    rating: 4.7,
    bio: "Product mentor for early-stage founders validating markets and shipping MVPs.",
    availableSlots: makeSlots(1)
  },
  {
    name: "Arjun Rao",
    category: "Finance",
    experience: 14,
    rating: 4.8,
    bio: "Financial planning expert focused on personal investing and business cash flow.",
    availableSlots: makeSlots(3)
  },
  {
    name: "Nisha Verma",
    category: "UX Design",
    experience: 8,
    rating: 4.6,
    bio: "Design lead helping teams improve research, information architecture, and usability.",
    availableSlots: makeSlots(2)
  },
  {
    name: "Kabir Sethi",
    category: "Marketing",
    experience: 11,
    rating: 4.7,
    bio: "Growth marketer with deep experience in acquisition funnels and lifecycle campaigns.",
    availableSlots: makeSlots(1)
  }
];

export async function seedExperts() {
  await connectDB();

  const result = await Expert.bulkWrite(
    experts.map((expert) => ({
      updateOne: {
        filter: { name: expert.name },
        update: { $set: expert },
        upsert: true
      }
    }))
  );

  return {
    total: experts.length,
    inserted: result.upsertedCount,
    updated: result.modifiedCount
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await seedExperts();
    console.log(`Seeded ${result.total} experts (${result.inserted} inserted, ${result.updated} updated).`);
  } catch (error) {
    console.error("Expert seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
