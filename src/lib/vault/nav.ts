import {
  Archive,
  CalendarDays,
  CheckSquare,
  FolderOpen,
  Hash,
  House,
  Search,
  Settings,
  Trash2,
  type LucideIcon,
} from "lucide-react";

export type NavHref =
  | "/"
  | "/browse"
  | "/daily"
  | "/tasks"
  | "/search"
  | "/tags"
  | "/archive"
  | "/trash"
  | "/settings"
  | "/more";

export type NavItem = {
  to: NavHref;
  label: string;
  icon: LucideIcon;
  hint?: string;
};

export const PRIMARY_NAV: NavItem[] = [
  { to: "/", label: "Home", icon: House, hint: "Today and pinned" },
  { to: "/browse", label: "Browse", icon: FolderOpen, hint: "The whole vault" },
  { to: "/daily", label: "Daily", icon: CalendarDays, hint: "One page a day" },
  { to: "/tasks", label: "Tasks", icon: CheckSquare, hint: "Every checkbox" },
  { to: "/search", label: "Search", icon: Search, hint: "Titles and bodies" },
];

export const LIBRARY_NAV: NavItem[] = [
  { to: "/tags", label: "Tags", icon: Hash, hint: "Hash index" },
  { to: "/archive", label: "Archive", icon: Archive, hint: "Parked pages" },
  { to: "/trash", label: "Trash", icon: Trash2, hint: "Recoverable" },
  { to: "/settings", label: "Settings", icon: Settings, hint: "Theme and type" },
];

export function isNavActive(pathname: string, to: NavHref) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}
