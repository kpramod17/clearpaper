import "dotenv/config";
import express from "express";
import router from "./routes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(router);

if (process.env.NODE_ENV !== "production") {
  // Development: attach Vite dev server as middleware
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: {
      middlewareMode: true,
      watch: {
        ignored: ["**/server/**", "**/shared/**", "**/.env"],
      },
    },
    root: "client",
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  // Production: serve built client files
  const path = await import("path");
  const { fileURLToPath } = await import("url");
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  app.use(express.static(path.join(__dirname, "../client")));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`[ClearPaper] Running on http://localhost:${PORT}`);
});
