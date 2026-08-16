import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const base = process.argv[2] || "http://127.0.0.1:8080";
const outDir = "/workspace/screenshots";
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox"] });

async function shot(page, name) {
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: false });
}

async function run(label, viewport, paths) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (e) => errors.push(`${label} ${page.url()}: ${e.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`${label} console: ${msg.text()}`);
  });

  for (const { path, name, after } of paths) {
    await page.goto(`${base}${path}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(500);
    if (after) await after(page);
    await shot(page, name);
  }

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
  );
  const text = await page.locator("body").innerText();
  await page.close();
  return { errors, overflow, label, textLen: text.trim().length };
}

const openFab = async (page) => {
  await page.getByRole("button", { name: "Open actions" }).click();
  await page.waitForTimeout(400);
};

const openDrawer = async (page) => {
  await page.getByRole("button", { name: "Open vault" }).click();
  await page.waitForTimeout(400);
};

const mobile = await run("mobile", { width: 390, height: 844 }, [
  { path: "/", name: "mobile-home" },
  { path: "/", name: "mobile-fab", after: openFab },
  { path: "/", name: "mobile-drawer", after: openDrawer },
  { path: "/browse", name: "mobile-browse" },
  { path: "/daily", name: "mobile-daily" },
  { path: "/tasks", name: "mobile-tasks" },
  { path: "/search", name: "mobile-search" },
  { path: "/more", name: "mobile-more" },
  { path: "/settings", name: "mobile-settings" },
  { path: "/login", name: "mobile-login" },
  { path: "/note/note-markdown", name: "mobile-note" },
  { path: "/note/note-welcome", name: "mobile-welcome" },
]);

const desktop = await run("desktop", { width: 1280, height: 800 }, [
  { path: "/", name: "desktop-home" },
  { path: "/browse", name: "desktop-browse" },
  { path: "/daily", name: "desktop-daily" },
  { path: "/tasks", name: "desktop-tasks" },
  { path: "/note/note-markdown", name: "desktop-note" },
]);

console.log(JSON.stringify({ mobile, desktop }, null, 2));
await browser.close();
if ([...mobile.errors, ...desktop.errors].length || mobile.overflow) process.exit(1);
