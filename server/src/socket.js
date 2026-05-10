import { Server } from "socket.io";

let io;

export function initSocket(httpServer, clientUrl) {
  const allowedOrigins = [
    clientUrl,
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ].filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PATCH"]
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinExpert", (expertId) => {
      if (expertId) {
        socket.join(`expert:${expertId}`);
      }
    });

    socket.on("leaveExpert", (expertId) => {
      if (expertId) {
        socket.leave(`expert:${expertId}`);
      }
    });
  });

  return io;
}

export function getIO() {
  return io;
}

export function emitSlotBooked(payload) {
  if (!io) {
    return;
  }

  io.to(`expert:${payload.expertId}`).emit("slotBooked", payload);
  io.emit("bookingCreated", payload);
}
