import assert from "node:assert/strict";
import test, { after, before, beforeEach } from "node:test";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { createApp } from "../src/app.js";
import { Booking } from "../src/models/Booking.js";
import { Expert } from "../src/models/Expert.js";

let mongoServer;
let app;
let expert;

const slots = [
  {
    date: "2030-01-15",
    times: ["09:00", "10:00"]
  }
];

before(async () => {
  process.env.NODE_ENV = "test";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  app = createApp();
});

beforeEach(async () => {
  await Promise.all([Booking.deleteMany({}), Expert.deleteMany({})]);
  expert = await Expert.create({
    name: "Test Expert",
    category: "Testing",
    experience: 7,
    rating: 4.5,
    bio: "Helps validate booking flows.",
    availableSlots: slots
  });
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test("GET /api/experts supports pagination and filters", async () => {
  await Expert.create({
    name: "Another Expert",
    category: "Product",
    experience: 5,
    rating: 4.1,
    bio: "Product support.",
    availableSlots: slots
  });

  const response = await request(app)
    .get("/api/experts")
    .query({ search: "test", category: "Testing", page: 1, limit: 1 })
    .expect(200);

  assert.equal(response.body.data.length, 1);
  assert.equal(response.body.data[0].name, "Test Expert");
  assert.equal(response.body.meta.total, 1);
});

test("POST /api/bookings prevents duplicate slots under concurrent requests", async () => {
  const payload = {
    expertId: expert._id.toString(),
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "+919876543210",
    date: "2030-01-15",
    timeSlot: "09:00",
    notes: "First consultation."
  };

  const responses = await Promise.all([
    request(app).post("/api/bookings").send(payload),
    request(app).post("/api/bookings").send(payload)
  ]);

  const statuses = responses.map((response) => response.status).sort();
  assert.deepEqual(statuses, [201, 409]);

  const count = await Booking.countDocuments({
    expert: expert._id,
    date: payload.date,
    timeSlot: payload.timeSlot
  });
  assert.equal(count, 1);
});

test("PATCH /api/bookings/:id/status validates status", async () => {
  const booking = await Booking.create({
    expert: expert._id,
    name: "Grace Hopper",
    email: "grace@example.com",
    phone: "+919876543210",
    date: "2030-01-15",
    timeSlot: "10:00"
  });

  await request(app)
    .patch(`/api/bookings/${booking._id}/status`)
    .send({ status: "Cancelled" })
    .expect(400);

  const response = await request(app)
    .patch(`/api/bookings/${booking._id}/status`)
    .send({ status: "Confirmed" })
    .expect(200);

  assert.equal(response.body.data.status, "Confirmed");
});
