import { Link } from "react-router-dom";

import { useAuthStore } from "../store/useAuthStore";
import { useMusicStore } from "../store/useMusicStore";
import { useLocation } from "react-router-dom";
import {
  LogOut,

  Settings,
  User,
  Music2,
} from "lucide-react";

import {
  useState,
  useRef,
  useEffect,
} from "react";

import MusicPopup from "./MusicPopup";

const Navbar = ({ setIsSidebarOpen }) => {

  const { logout, authUser } = useAuthStore();

  const { currentSong, isPlaying } = useMusicStore();

  const [openMusic, setOpenMusic] = useState(false);

  const audioRef = useRef(null);
const location = useLocation();
  // GLOBAL AUDIO PLAYER
  useEffect(() => {

    if (!audioRef.current || !currentSong) return;

    audioRef.current.src = currentSong.preview;

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }

  }, [currentSong, isPlaying]);

  return (

    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40
      backdrop-blur-lg bg-base-100/80"
    >

      <div className="container mx-auto px-4 h-16">

        <div className="flex items-center justify-between h-full">

          {/* LEFT */}
{/* LEFT */}
{/* LEFT */}
<div className="flex items-center gap-3">

  {location.pathname === "/" && (
    <button
      className="lg:hidden btn btn-sm btn-circle"
      onClick={() => setIsSidebarOpen(true)}
    >
      ☰
    </button>
  )}

  <Link
    to="/"
    className="hover:opacity-80 transition-all"
  >
    <img
      src="/logo.webp"
      alt="BeatChat"
      className="h-10 w-auto object-contain drop-shadow-md"
    />
  </Link>

</div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">

            {/* MUSIC */}
       
            {/* SETTINGS */}
            <Link
              to={"/settings"}
              className="btn btn-sm gap-2 transition-colors"
            >

              <Settings className="w-4 h-4" />

              <span className="hidden sm:inline">
                Settings
              </span>

            </Link>

            {authUser && (
              <>
 <div className="relative">

  <button
    onClick={() => setOpenMusic(!openMusic)}
    className="btn btn-sm btn-circle"
  >
    <Music2 className="size-5" />
  </button>

  {openMusic && (
    <div
      className="
        absolute top-12 right-0
        w-[320px] max-w-[90vw]
        z-50
      "
    >
      <MusicPopup />
    </div>
  )}

</div>

                {/* PROFILE */}
                <Link
                  to={"/profile"}
                  className="btn btn-sm gap-2"
                >

                  <User className="size-5" />

                  <span className="hidden sm:inline">
                    Profile
                  </span>

                </Link>

                {/* LOGOUT */}
                <button
                  className="flex gap-2 items-center"
                  onClick={logout}
                >

                  <LogOut className="size-5" />

                  <span className="hidden sm:inline">
                    Logout
                  </span>

                </button>

              </>
            )}

          </div>

        </div>

      </div>

      {/* GLOBAL AUDIO */}
   <audio
  id="global-audio"
  ref={audioRef}
  hidden
/>

    </header>
  );
};

export default Navbar;