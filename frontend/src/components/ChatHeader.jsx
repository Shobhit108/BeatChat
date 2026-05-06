import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { AI_BOT } from "../constants/ai";

const ChatHeader = () => {
   const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isAI = selectedUser._id === AI_BOT._id;
const isOnline = onlineUsers.includes(selectedUser._id.toString());

 
  


const isTyping = typingUsers.includes(selectedUser._id);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p
  className={`text-sm ${
    isTyping
      ? "text-primary"
      : isAI
      ? "text-purple-400"
      : isOnline
      ? "text-green-500"
      : "text-red-500"
  }`}
>
  {isTyping
    ? "Typing..."
    : isAI
    ? "AI Assistant"
    : isOnline
    ? "Online"
    : "Offline"}
</p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;