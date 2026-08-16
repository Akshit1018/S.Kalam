import { create } from "zustand";

type UiState = {
  paletteOpen: boolean;
  captureOpen: boolean;
  drawerOpen: boolean;
  fabOpen: boolean;
  askOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  setCaptureOpen: (open: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  setFabOpen: (open: boolean) => void;
  setAskOpen: (open: boolean) => void;
};

export const useUi = create<UiState>((set) => ({
  paletteOpen: false,
  captureOpen: false,
  drawerOpen: false,
  fabOpen: false,
  askOpen: false,
  setPaletteOpen: (paletteOpen) => set((s) => ({ paletteOpen, fabOpen: paletteOpen ? false : s.fabOpen })),
  setCaptureOpen: (captureOpen) => set((s) => ({ captureOpen, fabOpen: captureOpen ? false : s.fabOpen })),
  setDrawerOpen: (drawerOpen) => set((s) => ({ drawerOpen, fabOpen: drawerOpen ? false : s.fabOpen })),
  setFabOpen: (fabOpen) => set({ fabOpen }),
  setAskOpen: (askOpen) => set((s) => ({ askOpen, fabOpen: askOpen ? false : s.fabOpen })),
}));
