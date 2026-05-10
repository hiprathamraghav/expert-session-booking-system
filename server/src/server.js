import "dotenv/config";
import http from "node:http";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { initSocket } from "./socket.js";

const port = process.env.PORT || 5000;
const app = createApp();
const server = http.createServer(app);

initSocket(server, process.env.CLIENT_URL);

try {
  await connectDB();
  server.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error("Failed to start server:", error.message);
  process.exit(1);
}
