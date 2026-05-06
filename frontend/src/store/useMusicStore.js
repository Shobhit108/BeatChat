import { create } from "zustand";

export const useMusicStore = create((set) => ({
  currentSong: null,
  isPlaying: false,

  setCurrentSong: (song) =>
    set({
      currentSong: song,
      isPlaying: true,
    }),

  setIsPlaying: (value) =>
    set({
      isPlaying: value,
    }),
}));