import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useMusicStore } from "../store/useMusicStore";
const MusicPopup = () => {

  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState([]);


  const [progress, setProgress] = useState(0);

  const [duration, setDuration] = useState(30);

const {
  currentSong,
  setCurrentSong,
  isPlaying,
  setIsPlaying,
} = useMusicStore();
  // SEARCH SONGS
  useEffect(() => {

    const delay = setTimeout(async () => {

      if (!query.trim()) {
        setSongs([]);
        return;
      }

      try {

        const res = await axiosInstance.get(
          `/music/search?q=${query}`
        );

        setSongs(res.data);

      } catch (error) {
        console.log(error);
      }

    }, 400);

    return () => clearTimeout(delay);

  }, [query]);

  // UPDATE PROGRESS
  useEffect(() => {

  const audio = document.getElementById("global-audio");

  if (!audio) return;

  const updateProgress = () => {
    setProgress(audio.currentTime);
  };

  const loadedMetadata = () => {
    setDuration(audio.duration || 30);
  };

  audio.addEventListener(
    "timeupdate",
    updateProgress
  );

  audio.addEventListener(
    "loadedmetadata",
    loadedMetadata
  );

  return () => {

    audio.removeEventListener(
      "timeupdate",
      updateProgress
    );

    audio.removeEventListener(
      "loadedmetadata",
      loadedMetadata
    );
  };

}, [currentSong]);

  // PLAY / PAUSE
  const togglePlay = () => {
  setIsPlaying(!isPlaying);
};

  // +10 SEC
 const skipForward = () => {

  const audio = document.getElementById("global-audio");

  if (audio) {
    audio.currentTime += 10;
  }
};
  // -10 SEC
const skipBackward = () => {

  const audio = document.getElementById("global-audio");

  if (audio) {
    audio.currentTime -= 10;
  }
};

  // SEEK BAR
 const handleSeek = (e) => {

  const value = e.target.value;

  setProgress(value);

  const audio = document.getElementById("global-audio");

  if (audio) {
    audio.currentTime = value;
  }
};

  return (

<div
  className="
    fixed sm:absolute
    top-20 sm:top-14
    right-2 sm:right-0
    w-[92vw] sm:w-80
    max-w-[320px]
    rounded-2xl
    border border-white/10
    bg-black/40
    backdrop-blur-xl
    p-4
    shadow-2xl
    z-[999]
  "
>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search songs..."
        className="input input-bordered w-full mb-4 bg-white/10"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* SONG RESULTS */}
      <div className="max-h-64 overflow-y-auto space-y-2">

        {songs?.map((song) => (

          <div
            key={song.id}
            onClick={() => {

              setCurrentSong(song);

              setSongs([]);

              setProgress(0);

              setIsPlaying(true);
            }}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition"
          >

            <img
              src={song.album.cover_small}
              alt=""
              className="w-12 h-12 rounded-lg"
            />

            <div className="overflow-hidden">

              <p className="text-sm font-medium truncate">
                {song.title}
              </p>

              <p className="text-xs opacity-70 truncate">
                {song.artist.name}
              </p>

            </div>

          </div>

        ))}

      </div>

      {/* PLAYER */}
      {currentSong && (

        <div className="mt-4 border-t border-white/10 pt-4">

          {/* SONG INFO */}
          <div className="flex items-center gap-3 mb-4">

            <img
              src={currentSong.album.cover_small}
              alt=""
              className="w-14 h-14 rounded-xl"
            />

            <div>

              <p className="text-sm font-semibold">
                {currentSong.title}
              </p>

              <p className="text-xs opacity-70">
                {currentSong.artist.name}
              </p>

            </div>

          </div>

          {/* HIDDEN AUDIO */}
        

          {/* SEEK BAR */}
         <input
  type="range"
  min="0"
  max={duration}
  value={progress}
  onChange={handleSeek}
  className="music-range w-full"
  style={{
    "--progress": `${(progress / duration) * 100}%`,
  }}
/>

          {/* CONTROLS */}
          <div className="flex items-center justify-center gap-4 mt-4">

            <button
              onClick={skipBackward}
              className="btn btn-circle btn-sm"
            >
              <SkipBack className="size-4" />
            </button>

            <button
              onClick={togglePlay}
              className="btn btn-circle btn-primary"
            >
              {isPlaying ? (
                <Pause className="size-5" />
              ) : (
                <Play className="size-5" />
              )}
            </button>

            <button
              onClick={skipForward}
              className="btn btn-circle btn-sm"
            >
              <SkipForward className="size-4" />
            </button>

          </div>

        </div>

      )}

    </div>
  );
};

export default MusicPopup;