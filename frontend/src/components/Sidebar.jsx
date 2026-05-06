import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { AI_BOT } from "../constants/ai";
const Sidebar = () => {
  const { selectedUser, setSelectedUser, isUsersLoading ,recentChats, getRecentChats,addRecentChat  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  // 🔹 NEW
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
let baseUsers = query.trim() ? searchResults : recentChats;

// ensure bot always present
let displayUsers = Array.isArray(baseUsers)
  ? [...baseUsers.filter(u => u._id !== AI_BOT._id), AI_BOT]
  : [AI_BOT];

if (showOnlineOnly) {
  displayUsers = displayUsers.filter(
    (user) =>
      user._id === AI_BOT._id ||
      onlineUsers.includes(user._id.toString())
  );
}

useEffect(() => {
  getRecentChats();
}, []);

 

  useEffect(() => {
    const delay = setTimeout(async () => {
      const trimmed = query.trim();

      if (!trimmed) {
        setSearchResults([]);
        return;
      }

      try {
        const res = await axiosInstance.get(
          `/messages/search?query=${trimmed}`,
        );

        console.log("SEARCH RESPONSE:", res.data); // debug

        setSearchResults(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log("search error", err);
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  // 🔹 NEW: decide display list


  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>

        {/* 🔹 NEW: Search input */}
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-3 w-full input input-sm input-bordered"
        />

        {/* existing toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {Array.isArray(displayUsers) &&
          displayUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => {
              setSelectedUser(user);
              addRecentChat(user);
              setQuery("");
            }}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id.toString())&& (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>

              <div className="text-sm text-zinc-400 truncate">
                {user.lastMessage ||
                  (onlineUsers.includes(user._id.toString())
                    ? "Online"
                    : "Offline")}
              </div>

              {user.lastTime && (
                <div className="text-xs text-zinc-500">
                  {new Date(user.lastTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          </button>
        ))}

        {displayUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No users found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
