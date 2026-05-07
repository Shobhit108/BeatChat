import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { getOptimizedImage } from "../lib/cloudinary";
const ChatBox = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);
  }, [selectedUser._id]);

  useEffect(() => {
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, []);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto px-2 py-3 sm:p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar self-end">
              <div className="size-8 sm:size-10 rounded-full ring-1 ring-base-300/20">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            {message.image && (
              <div className="mb-1">
                <img
                  src={getOptimizedImage(message.image)}
                  alt="Attachment"
                  loading="lazy"
                  decoding="async"
                  onClick={() => setSelectedImage(message.image)}
                  className="max-w-[220px] sm:max-w-[260px] w-full h-auto rounded-2xl cursor-pointer hover:scale-[1.01] transition-all duration-200"
                  onLoad={(e) => (e.target.style.opacity = 1)}
                  style={{ opacity: 0, transition: "0.2s" }}
                />
              </div>
            )}

            {message.text && (
              <div
                className={`chat-bubble break-words max-w-[75vw] sm:max-w-xs md:max-w-md ${
                  message.senderId === authUser._id
                    ? "bg-primary text-primary-content"
                    : ""
                }`}
              >
                {message.text}
              </div>
            )}
            {message.pending && (
              <div className="text-[10px] opacity-60 mt-1">Sending...</div>
            )}
          </div>
        ))}
      </div>
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full Preview"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}
      <MessageInput />
    </div>
  );
};
export default ChatBox;