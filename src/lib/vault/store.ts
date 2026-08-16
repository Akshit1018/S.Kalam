import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { uid } from "@/lib/utils";
import {
  buildDailyNote,
  buildWeeklyNote,
  dailyTitle,
  seedNotes,
  weeklyTitle,
} from "./seed";
import { extractTasks, findByTitle, toggleNthTask } from "./text";
import {
  DEFAULT_SETTINGS,
  type FolderId,
  type Note,
  type NoteStatus,
  type Settings,
} from "./types";

export const VAULT_KEY = "kalam-vault-v1";

function loadPersisted(): { notes: Note[]; settings: Settings } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { notes?: Note[]; settings?: Partial<Settings> } };
    const slice = parsed.state ?? (parsed as { notes?: Note[]; settings?: Partial<Settings> });
    if (!Array.isArray(slice.notes) || slice.notes.length === 0) return null;
    return {
      notes: slice.notes,
      settings: { ...DEFAULT_SETTINGS, ...slice.settings },
    };
  } catch {
    return null;
  }
}

const persisted = loadPersisted();
const clientReady = typeof window !== "undefined";

type VaultState = {
  notes: Note[];
  settings: Settings;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  seedIfEmpty: () => void;
  resetDemo: () => void;
  ensureDateNotes: () => void;
  upsert: (partial: Partial<Note> & { id?: string; title?: string; content?: string }) => string;
  updateNote: (id: string, patch: Partial<Note>) => void;
  setStatus: (id: string, status: NoteStatus) => void;
  togglePin: (id: string) => void;
  toggleTask: (id: string, index: number) => void;
  removeForever: (id: string) => void;
  emptyTrash: () => void;
  openOrCreateByTitle: (title: string, folder?: FolderId) => string;
  openDaily: (date?: Date) => string;
  openWeekly: (date?: Date) => string;
  patchSettings: (patch: Partial<Settings>) => void;
};

function touch(note: Note, patch: Partial<Note>): Note {
  return { ...note, ...patch, updatedAt: Date.now() };
}

export const useVault = create<VaultState>()(
  persist(
    (set, get) => ({
      notes: persisted?.notes ?? seedNotes(),
      settings: persisted?.settings ?? DEFAULT_SETTINGS,
      hydrated: true,
      setHydrated: (value) => set({ hydrated: value }),
      seedIfEmpty: () => {
        if (get().notes.length === 0) {
          set({ notes: seedNotes() });
        }
        get().ensureDateNotes();
      },
      resetDemo: () => {
        set({
          notes: seedNotes(),
          settings: { ...DEFAULT_SETTINGS, theme: get().settings.theme, vaultName: get().settings.vaultName },
        });
      },
      ensureDateNotes: () => {
        if (!get().settings.dailyNotes) return;
        const now = new Date();
        const dTitle = dailyTitle(now);
        const wTitle = weeklyTitle(now);
        const notes = get().notes;
        const next = [...notes];
        if (!findByTitle(notes, dTitle)) next.push(buildDailyNote(now));
        if (!findByTitle(notes, wTitle)) next.push(buildWeeklyNote(now));
        if (next.length !== notes.length) set({ notes: next });
      },
      upsert: (partial) => {
        const id = partial.id ?? uid("note");
        const existing = get().notes.find((n) => n.id === id);
        if (existing) {
          set({
            notes: get().notes.map((n) => (n.id === id ? touch(n, partial) : n)),
            settings: { ...get().settings, lastOpenedId: id },
          });
          return id;
        }
        const created: Note = {
          id,
          title: partial.title?.trim() || "Untitled",
          content: partial.content ?? "",
          folder: partial.folder ?? "inbox",
          status: partial.status ?? "active",
          pinned: partial.pinned ?? false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set({
          notes: [created, ...get().notes],
          settings: { ...get().settings, lastOpenedId: id },
        });
        return id;
      },
      updateNote: (id, patch) => {
        set({
          notes: get().notes.map((n) => (n.id === id ? touch(n, patch) : n)),
        });
      },
      setStatus: (id, status) => {
        set({
          notes: get().notes.map((n) => (n.id === id ? touch(n, { status, pinned: status === "active" ? n.pinned : false }) : n)),
        });
      },
      togglePin: (id) => {
        set({
          notes: get().notes.map((n) => (n.id === id ? touch(n, { pinned: !n.pinned }) : n)),
        });
      },
      toggleTask: (id, index) => {
        const note = get().notes.find((n) => n.id === id);
        if (!note) return;
        get().updateNote(id, { content: toggleNthTask(note.content, index) });
      },
      removeForever: (id) => {
        set({ notes: get().notes.filter((n) => n.id !== id) });
      },
      emptyTrash: () => {
        set({ notes: get().notes.filter((n) => n.status !== "trashed") });
      },
      openOrCreateByTitle: (title, folder = "inbox") => {
        const existing = findByTitle(get().notes, title);
        if (existing) {
          if (existing.status !== "active") get().setStatus(existing.id, "active");
          set({ settings: { ...get().settings, lastOpenedId: existing.id } });
          return existing.id;
        }
        return get().upsert({ title, folder, content: `# ${title}\n\n` });
      },
      openDaily: (date = new Date()) => get().openOrCreateByTitle(dailyTitle(date), "daily"),
      openWeekly: (date = new Date()) => get().openOrCreateByTitle(weeklyTitle(date), "weekly"),
      patchSettings: (patch) => {
        set({ settings: { ...get().settings, ...patch } });
      },
    }),
    {
      name: VAULT_KEY,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ notes: state.notes, settings: state.settings }),
      merge: (persistedState, current) => {
        const p = (persistedState ?? {}) as Partial<VaultState>;
        return {
          ...current,
          notes: p.notes ?? current.notes,
          settings: { ...DEFAULT_SETTINGS, ...p.settings },
        };
      },
    },
  ),
);

export function useNotes(): Note[] {
  return useVault((s) => s.notes);
}

export function useActiveNotes(): Note[] {
  const notes = useNotes();
  return useMemo(() => notes.filter((n) => n.status === "active"), [notes]);
}

export function useNote(id: string | undefined): Note | undefined {
  const notes = useNotes();
  return useMemo(() => notes.find((n) => n.id === id), [notes, id]);
}

export function useTasks() {
  const notes = useNotes();
  return useMemo(
    () => extractTasks(notes.filter((n) => n.status === "active")),
    [notes],
  );
}
