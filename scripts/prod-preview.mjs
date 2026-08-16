import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { pathToFileURL } from "node:url";

const root = "/workspace/.vercel/output/static";
const types = {
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
};

const entry = pathToFileURL("/workspace/.vercel/output/functions/__server.func/index.mjs").href;
const mod = await import(entry);
const fetchHandler = mod.fetch || mod.default?.fetch || mod.default;

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  const file = join(root, decodeURIComponent(url.pathname));
  if (url.pathname !== "/" && existsSync(file) && statSync(file).isFile()) {
    res.setHeader("content-type", types[extname(file)] || "application/octet-stream");
    createReadStream(file).pipe(res);
    return;
  }
  try {
    const request = new Request(url, { method: req.method, headers: req.headers });
    const response = await fetchHandler(request);
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (err) {
    res.statusCode = 500;
    res.end(String(err));
  }
});

server.listen(4173, "127.0.0.1", () => {
  console.log("prod preview 4173");
});
