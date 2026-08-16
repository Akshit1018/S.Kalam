export type NoteStatus = "active" | "archived" | "trashed";

export type FolderId = "inbox" | "daily" | "weekly" | "projects" | "quick";

export type EditorMode = "edit" | "preview" | "split";

export type ThemePref = "system" | "light" | "dark";

export type Note = {
  id: string;
  title: string;
  content: string;
  folder: FolderId;
  status: NoteStatus;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Settings = {
  theme: ThemePref;
  editorMode: EditorMode;
  fontSize: number;
  dailyNotes: boolean;
  lastOpenedId: string | null;
  vaultName: string;
};

export type TaskItem = {
  noteId: string;
  noteTitle: string;
  index: number;
  text: string;
  done: boolean;
};

export const FOLDER_META: Record<FolderId, { label: string; description: string }> = {
  inbox: { label: "Inbox", description: "Loose notes" },
  daily: { label: "Daily Notes", description: "One page per day" },
  weekly: { label: "Weekly Notes", description: "ISO weeks" },
  projects: { label: "Projects", description: "Longer work" },
  quick: { label: "Quick", description: "Capture inbox" },
};

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  editorMode: "preview",
  fontSize: 17,
  dailyNotes: true,
  lastOpenedId: null,
  vaultName: "Desk",
};

export const APP_NAME = "Kalam";
