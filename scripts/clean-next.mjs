import { rm } from "node:fs/promises";
import path from "node:path";

const nextDir = path.resolve(process.cwd(), ".next");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const maxRetries = 8;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await rm(nextDir, {
        recursive: true,
        force: true,
        maxRetries: 3,
        retryDelay: 120,
      });
      console.log("[clean:next] .next removed");
      return;
    } catch (err) {
      const code = err && typeof err === "object" ? err.code : undefined;
      if (code === "EPERM" || code === "EBUSY") {
        const delay = attempt * 250;
        console.warn(
          `[clean:next] lock detected (${code}), retry ${attempt}/${maxRetries} in ${delay}ms`,
        );
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }

  console.error("[clean:next] failed to remove .next after retries.");
  process.exit(1);
}

main().catch((err) => {
  console.error("[clean:next] unexpected error:", err);
  process.exit(1);
});
