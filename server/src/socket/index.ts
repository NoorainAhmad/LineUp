import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

interface ServerToClientEvents {
  new_message: (data: any) => void;
  message_updated: (data: any) => void;
  messages_read: (data: any) => void;
  user_status_changed: (data: any) => void;
  chat_updated: (data: any) => void;
  error: (error: { message: string }) => void;
}

interface ClientToServerEvents {
  join_chat: (chatId: string) => void;
  leave_chat: (chatId: string) => void;
  typing_start: (chatId: string) => void;
  typing_end: (chatId: string) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId: string;
  sessionId: string;
  role: string;
}

export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type TypedServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

let io: TypedServer;

export const initSocket = (httpServer: HttpServer): TypedServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://lineup24x7.com",
        "https://lineup24x7.com",
        "https://www.lineup24x7.com",
      ],
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
  });

  // Authentication Middleware
  io.use(async (socket: TypedSocket, next) => {
    try {
      // Allow token from auth header or connection URL query
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      
      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: string;
        sessionId: string;
      };

      // Verify user exists and get role for permissions
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true, isActive: true }
      });

      if (!user || !user.isActive) {
        return next(new Error("Authentication error: User not found or inactive"));
      }

      socket.data.userId = user.id;
      socket.data.sessionId = decoded.sessionId;
      socket.data.role = user.role;
      next();
    } catch (err) {
      console.error("[Socket.io] Auth error:", err);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: TypedSocket) => {
    const userId = socket.data.userId;
    console.log(`[Socket.io] User connected: ${userId} (Socket ID: ${socket.id})`);

    // 1. Automatically join a personal room for direct events
    socket.join(userId);

    // 2. Handle explicit chat room joins (for typing indicators, read receipts)
    socket.on("join_chat", async (chatId) => {
      console.log(`[Socket.io] User ${userId} attempting to join chat room: ${chatId}`);
      // Verify membership before allowing join
      try {
         const membership = await prisma.chatMember.findUnique({
             where: { userId_chatId: { userId, chatId } }
         });
         if (membership) {
             socket.join(`chat:${chatId}`);
             console.log(`[Socket.io] ✅ User ${userId} successfully joined room chat:${chatId}`);
             console.log(`[Socket.io] Room ${chatId} now has: ${io.sockets.adapter.rooms.get(`chat:${chatId}`)?.size || 0} members`);
         } else {
             console.warn(`[Socket.io] ❌ User ${userId} unauthorized to join chat ${chatId}`);
             socket.emit("error", { message: "Unauthorized to join this chat room" });
         }
      } catch (err) {
          console.error(`[Socket.io] Error joining chat room ${chatId}:`, err);
      }
    });

    socket.on("leave_chat", (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    // 3. Handle Typing Indicators
    socket.on("typing_start", (chatId) => {
      // Broadcast to everyone in the chat EXCEPT the sender
      socket.to(`chat:${chatId}`).emit("user_status_changed", {
        userId,
        chatId,
        status: "typing"
      });
    });

    socket.on("typing_end", (chatId) => {
      socket.to(`chat:${chatId}`).emit("user_status_changed", {
        userId,
        chatId,
        status: "idle"
      });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.io] User disconnected: ${userId}`);
      // Note: user is automatically removed from all rooms on disconnect
    });
  });

  return io;
};

export const getIO = (): TypedServer => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
