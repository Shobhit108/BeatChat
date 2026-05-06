import {Server} from "socket.io";

import http from "http";

import express from "express";


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

export function getReceiverSocketId(userId) {
return userScoketMap[userId] 
}

//used to store online users
const userScoketMap = {} //; {userId: socketId}
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  console.log("CONNECTED:", userId, socket.id);

  if (userId) {
    userScoketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userScoketMap));

  // ✅ FIX: move here
  socket.on("typing", ({ to }) => {
    const receiverSocketId = userScoketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { from: userId });
    }
  });

  socket.on("stopTyping", ({ to }) => {
    const receiverSocketId = userScoketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { from: userId });
    }
  });

  socket.on("disconnect", () => {
    console.log("DISCONNECTED:", userId, socket.id);

    if (userScoketMap[userId] === socket.id) {
      delete userScoketMap[userId];
    }

    io.emit("getOnlineUsers", Object.keys(userScoketMap));
  });
});



export   {io, app , server};

