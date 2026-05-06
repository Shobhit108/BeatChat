import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  recentChats:[],
  typingUsers: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  getRecentChats: async () => {
  try {
    const res = await axiosInstance.get("/messages/recent");
    set({ recentChats: res.data });
  } catch (error) {
    console.log("recent chats error", error);
  }
},
addRecentChat: (user) => {
  set((state) => {
    const exists = state.recentChats?.find((u) => u._id === user._id);

    if (exists) return state;

    return {
      recentChats: [user, ...(state.recentChats || [])],
    };
  });
},
  sendMessage: async (messageData) => {
  const { selectedUser, messages } = get();
  const { authUser } = useAuthStore.getState();

  const tempMessage = {
    _id: Date.now(),
    senderId: authUser._id,
    receiverId: selectedUser._id,
    text: messageData.text,
    image: messageData.image,
    createdAt: new Date(),
    pending: true,
  };

  // instant message show
  set({
    messages: [...messages, tempMessage],
  });

  try {
    const res = await axiosInstance.post(
      `/messages/send/${selectedUser._id}`,
      messageData
    );

    // replace temp message
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === tempMessage._id ? res.data : msg
      ),
    }));

  } catch (error) {

    // remove failed message
    set((state) => ({
      messages: state.messages.filter(
        (msg) => msg._id !== tempMessage._id
      ),
    }));

    toast.error(error.response?.data?.message || "Failed to send");
  }
},

 subscribeToMessages: () => {
  const socket = useAuthStore.getState().socket;
  if (!socket) return;

  socket.off("newMessage"); // 👈 duplicate listeners remove

  socket.on("newMessage", (newMessage) => {
      console.log("NEW MESSAGE:", newMessage);
    const { selectedUser, messages, getRecentChats } = get();

    if (
      selectedUser &&
      newMessage.senderId.toString() === selectedUser._id.toString()
    ) {
      set({
        messages: [...messages, newMessage],
      });
    }
socket.on("typing", ({ from }) => {
  set((state) => ({
    typingUsers: [...new Set([...state.typingUsers, from])],
  }));
});

socket.on("stopTyping", ({ from }) => {
  set((state) => ({
    typingUsers: state.typingUsers.filter((id) => id !== from),
  }));
});
    getRecentChats();
  });
},

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

 setSelectedUser: (user) => {
  set({ selectedUser: user, messages: [] });
},}));