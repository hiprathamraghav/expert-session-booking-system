import { createApp } from "../server/src/app.js";
import { connectDB } from "../server/src/config/db.js";

const app = createApp();
let dbConnection;

async function ensureDB() {
  if (!dbConnection) {
    dbConnection = connectDB();
  }

  await dbConnection;
}

export default async function handler(req, res) {
  await ensureDB();
  return app(req, res);
}
