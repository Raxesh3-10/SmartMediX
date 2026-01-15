import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io("http://localhost:8173", {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
}