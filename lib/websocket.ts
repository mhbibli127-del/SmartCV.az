import type { Server as HTTPServer } from "http";
import type { Server as SocketIOServerType } from "socket.io";

let io: SocketIOServerType | null = null;

export function initializeWebSocket(httpServer: HTTPServer) {
  if (io) return io;

  const { Server } = require("socket.io") as typeof import("socket.io");
  io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_APP_URL
          : ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId as string | undefined;
    if (userId) socket.join(`user:${userId}`);
    socket.join("analytics");

    socket.on("template:view", (data: unknown) => {
      io?.to("analytics").emit("template:viewed", data);
    });
    socket.on("template:download", (data: unknown) => {
      io?.to("analytics").emit("template:downloaded", data);
    });
    socket.on("cv:created", (data: unknown) => {
      io?.to("analytics").emit("cv:created", data);
    });
    socket.on("user:activity", (data: unknown) => {
      io?.to("analytics").emit("user:active", data);
    });
  });

  return io;
}

export function getWebSocket() {
  return io;
}
