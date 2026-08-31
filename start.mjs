// Railway startup script.
// 1. Best-effort Prisma schema sync (db push) in the background so the
//    server is never blocked on the database.
// 2. Start the Next.js standalone server immediately.
//
// We invoke the bundled Prisma CLI directly via node instead of `npx`
// because the runtime image only ships node_modules/@prisma + prisma
// (the os-level .bin symlinks are not copied over).
import { execFile, spawn } from "node:child_process";

const PRISMA_CLI = "./node_modules/prisma/build/index.js";

console.log("[start] syncing Prisma schema (async)...");
execFile(
  process.execPath,
  [PRISMA_CLI, "db", "push", "--skip-generate", "--accept-data-loss"],
  { timeout: 120_000 },
  (err, _stdout, stderr) => {
    if (err) {
      console.error("[start] schema sync failed (server continues):", stderr || err.message);
    } else {
      console.log("[start] schema sync complete.");
    }
  },
);

const server = spawn(process.execPath, ["server.js"], { stdio: "inherit" });

server.on("exit", (code) => {
  process.exit(code ?? 1);
});