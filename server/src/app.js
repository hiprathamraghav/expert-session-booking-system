import cors from "cors";
import express from "express";
import morgan from "morgan";
import { bookingRouter } from "./routes/bookingRoutes.js";
import { expertRouter } from "./routes/expertRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();
  const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ].filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
        ) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin not allowed by CORS: ${origin}`));
      }
    })
  );
  app.use(express.json());

  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/experts", expertRouter);
  app.use("/api/bookings", bookingRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
