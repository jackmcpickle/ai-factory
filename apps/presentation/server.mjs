import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

const port = Number(process.env.PORT || 4174);
const files = new Map([
  ["/", ["index.html", "text/html"]],
  ["/index.html", ["index.html", "text/html"]],
  ["/styles.css", ["styles.css", "text/css"]],
  ["/slides.js", ["slides.js", "text/javascript"]],
  ["/app.js", ["app.js", "text/javascript"]],
]);
const server = createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  const file = files.get(path);
  if (!file) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end();
    return;
  }
  try {
    const data = await readFile(new URL(file[0], import.meta.url));
    res.writeHead(200, {
      "Content-Type": `${file[1]}; charset=utf-8`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(req.method === "HEAD" ? undefined : data);
  } catch {
    res.writeHead(500);
    res.end("Unable to read presentation asset");
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Presentation: http://localhost:${port}`)
);
