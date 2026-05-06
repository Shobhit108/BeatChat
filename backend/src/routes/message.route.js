import express from "express";
import { protectRoute  } from "../middleware/auth.middelware.js";
import { getUserForSidebar , getMessages , sendMessage ,searchUsers ,getRecentChats} from "../controllers/message.controller.js";
const router = express.Router();


router.get("/users", protectRoute, getUserForSidebar);
router.get("/search", protectRoute, searchUsers); 
router.get("/recent", protectRoute, getRecentChats); 
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
export default router;