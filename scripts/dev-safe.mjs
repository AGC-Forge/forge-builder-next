import { spawn, spawnSync } from "node:child_process";

const port = process.env.PORT || process.env.DEV_PORT || "3000";
const prepareOnly = process.argv.includes("--prepare-only");

function run(command, args) {
  return spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
}

function killPortProcess(targetPort) {
  const netstat = spawnSync("netstat", ["-ano", "-p", "tcp"], {
    encoding: "utf8",
    shell: true,
    env: process.env,
  });

  if (netstat.status !== 0 || !netstat.stdout) {
    console.warn("[dev:safe] warning: failed to inspect listening ports.");
    return;
  }

  const lines = netstat.stdout.split(/\r?\n/);
  const pids = new Set();

  for (const line of lines) {
    const normalized = line.trim().replace(/\s+/g, " ");
    if (!normalized.includes(" LISTENING ")) continue;
    if (!normalized.includes(`:${targetPort} `)) continue;
    const parts = normalized.split(" ");
    const pid = parts[parts.length - 1];
    if (pid && /^\d+$/.test(pid)) pids.add(pid);
  }

  if (pids.size === 0) {
    console.log(`[dev:safe] no process listening on port ${targetPort}`);
    return;
  }

  for (const pid of pids) {
    console.log(`[dev:safe] killing PID ${pid} on port ${targetPort}`);
    spawnSync("taskkill", ["/PID", String(pid), "/F"], {
      stdio: "inherit",
      shell: true,
      env: process.env,
    });
  }
}

function cleanNext() {
  const result = run("pnpm", ["clean:next"]);
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function startDev(targetPort) {
  const child = spawn(
    "pnpm",
    ["exec", "next", "dev", "--webpack", "--port", String(targetPort)],
    {
      stdio: "inherit",
      shell: true,
      env: process.env,
    },
  );

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

console.log(`[dev:safe] preparing dev server on port ${port}...`);
killPortProcess(port);
cleanNext();

if (prepareOnly) {
  console.log("[dev:safe] preparation done.");
  process.exit(0);
}

console.log("[dev:safe] starting Next.js dev server...");
startDev(port);
