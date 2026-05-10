import { io } from "socket.io-client";

let socket;

const noopSocket = {
  emit() {},
  on() {},
  off() {}
};

export function getSocket() {
  if (!["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return noopSocket;
  }

  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://127.0.0.1:5000", {
      autoConnect: true,
      transports: ["websocket", "polling"]
    });
  }

  return socket;
}
