import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { ThemeSync } from "@/components/app/theme";
import { FontLoader } from "@/components/app/fonts";
import { VaultHydrate } from "@/components/app/hydrate";
import appCss from "../styles.css?url";

const APP_NAME = "Kalam";
const host = import.meta.env.VITE_PUBLIC_HOSTNAME;
const ogImage = host ? `https://${host}/og.jpg` : undefined;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "description", content: "A private Markdown notebook with a pen that can continue, tighten, and suggest." },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "theme-color", content: "#0e1013" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: APP_NAME },
      { property: "og:description", content: "Write. The pen can help when you ask." },
      { property: "og:type", content: "website" },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
          ]
        : []),
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="en" className="dark antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <FontLoader />
        <AuthProvider>
          <VaultHydrate>
            <ThemeSync />
            <Outlet />
          </VaultHydrate>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
