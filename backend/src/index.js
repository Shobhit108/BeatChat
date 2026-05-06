dotenv.config();
import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import musicRoutes from "./routes/music.route.js";
import dotenv from "dotenv";
import { dbConnetion } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import {app, server} from "./lib/socket.js";

import path from "path";


const PORT = process.env.PORT;
const _dirname = path.resolve()
app.use(express.json({limit:"5mb"}))
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}
  
))

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/music", musicRoutes);



if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(_dirname,"../frontend/dist")))

  app.get("*", (req, res) =>{
    res.sendFile(path.json(_dirname, "../frontend","dist","index.html"))
  })
}

server.listen(PORT, (req, res) => {
  console.log(`server is running on port ${PORT} `);
  dbConnetion();
});
