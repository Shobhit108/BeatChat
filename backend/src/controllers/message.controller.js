import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { generateAIReply } from "../lib/openai.js";

const AI_BOT_ID = "69fa1927fc594b73433f7c3c";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chat-app",
        resource_type: "image",
        transformation: [{ quality: "auto" ,fetch_format: "auto" }],
      });
      imageUrl = uploadResponse.secure_url;
    }

    // 🔥 AI BOT CASE
    if (receiverId === AI_BOT_ID) {
      // 1. save user message
      const userMessage = await Message.create({
        senderId,
        receiverId: AI_BOT_ID,
        text,
        image: imageUrl,
      });

      const userSocketId = getReceiverSocketId(senderId);

      if (userSocketId) {
        io.to(userSocketId).emit("newMessage", userMessage);
      }

      // 2. AI reply
      const botReply = await generateAIReply(text || "User sent an image");

      // optional delay
      await new Promise((res) => setTimeout(res, 500));

      // 3. save bot reply
      const botMessage = await Message.create({
        senderId: AI_BOT_ID,
        receiverId: senderId,
        text: botReply,
      });

      if (userSocketId) {
        io.to(userSocketId).emit("newMessage", botMessage);
      }

      return res.status(200).json(botMessage);
    }

    // 🟢 NORMAL MESSAGE
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const myId = req.user._id;

    // empty search handle
    if (!query || query.trim() === "") {
      return res.status(200).json([]);
    }

    const users = await User.find({
      _id: { $ne: myId }, // khud ko exclude
      fullName: { $regex: query, $options: "i" }, // case-insensitive search
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in searchUsers:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRecentChats = async (req, res) => {
  try {
    const myId = req.user._id;

    const chats = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: myId }, { receiverId: myId }],
        },
      },
      { $sort: { createdAt: -1 } },

      {
        $addFields: {
          chatPartner: {
            $cond: [{ $eq: ["$senderId", myId] }, "$receiverId", "$senderId"],
          },
        },
      },

      {
        $group: {
          _id: "$chatPartner",
          lastMessage: { $first: "$text" },
          lastTime: { $first: "$createdAt" },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },

      { $unwind: "$user" },

      {
        $project: {
          _id: "$user._id",
          fullName: "$user.fullName",
          profilePic: "$user.profilePic",
          lastMessage: 1,
          lastTime: 1,
        },
      },

      { $sort: { lastTime: -1 } },
    ]);

    res.status(200).json(chats);
  } catch (error) {
    console.log("Error in getRecentChats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
