import { useEffect } from "react";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:wght@400;600&family=Outfit:wght@400;500;600&display=swap";

export function FontLoader() {
  useEffect(() => {
    if (document.querySelector("link[data-kalam-fonts]")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    link.setAttribute("data-kalam-fonts", "1");
    document.head.appendChild(link);
  }, []);
  return null;
}
