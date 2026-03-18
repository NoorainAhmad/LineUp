import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:5000";

let socket: Socket | null = null;

export const initSocket = (): Socket | null => {
  if (socket) {
    console.log("[Socket.IO] Already initialized, returning existing connection");
    return socket;
  }

  const token = localStorage.getItem("access_token");

  if (!token) {
    console.warn("[Socket.IO] No auth token found. Cannot connect.");
    return null;
  }

  console.log("[Socket.IO] Attempting to connect with token");

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("[Socket.IO] ✅ Connected with ID:", socket?.id);
  });

  socket.on("connect_error", (error) => {
    console.error("[Socket.IO] ❌ Connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket.IO] 🔌 Disconnected. Reason:", reason);
    if (reason === "io server disconnect") {
      console.warn(
        "[Socket.IO] Server-initiated disconnect — clearing socket singleton. " +
        "Re-connect will happen on next initSocket() call with a fresh token."
      );
      // The disconnection was initiated by the server, you need to reconnect manually
      // This happens if the token is invalid
      socket = null; // Clear the socket instance so that next init will create a new connection
    }
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
