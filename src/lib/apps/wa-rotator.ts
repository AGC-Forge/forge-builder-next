/**
 * WA Rotator Client Helper
  * Path: src / lib / wa - rotator.ts
    *
 * Resolves the next WhatsApp agent URL from a rotator app.
 * Round - robin counter stored in localStorage per rotator ID.
 * Falls back to random if localStorage is not available.
 */

interface WaRotatorConfig {
  mode: "round-robin" | "random";
  agents: { name: string; number: string; label: string }[];
  defaultMessage: string;
}

// ── Cache config in memory to avoid repeated fetches ─────────
const configCache = new Map<string, WaRotatorConfig>();

async function fetchRotatorConfig(rotatorId: string): Promise<WaRotatorConfig | null> {
  if (configCache.has(rotatorId)) {
    return configCache.get(rotatorId)!;
  }

  try {
    const res = await fetch(`/api/wa-rotator/${rotatorId}`, {
      next: { revalidate: 60 }, // cache for 60s
    });

    if (!res.ok) return null;

    const data = await res.json();
    configCache.set(rotatorId, data);
    return data;
  } catch {
    return null;
  }
}

// ── Round-robin counter via localStorage ──────────────────────
function getNextAgentIndex(rotatorId: string, totalAgents: number, mode: string): number {
  if (mode === "random") {
    return Math.floor(Math.random() * totalAgents);
  }

  // Round-robin: use localStorage counter
  const key = `wa_rotator_idx_${rotatorId}`;
  try {
    const current = parseInt(localStorage.getItem(key) ?? "0", 10);
    const next = isNaN(current) ? 0 : current;
    const nextIdx = next % totalAgents;
    localStorage.setItem(key, String(nextIdx + 1));
    return nextIdx;
  } catch {
    // localStorage not available (SSR, private mode, etc.)
    return Math.floor(Math.random() * totalAgents);
  }
}

// ── Build wa.me URL ───────────────────────────────────────────
function buildWaUrl(number: string, message: string, templateMessage?: string): string {
  // Normalize number: remove spaces, dashes, ensure starts with country code
  const normalized = number
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .replace(/^\+/, "");

  const text = templateMessage || message || "";
  const encoded = text ? `?text=${encodeURIComponent(text)}` : "";

  return `https://wa.me/${normalized}${encoded}`;
}

// ── Main export: resolve WA URL from rotator ──────────────────
export async function resolveWaRotatorUrl(
  rotatorId: string,
  customMessage?: string,
): Promise<string | null> {
  const config = await fetchRotatorConfig(rotatorId);

  if (!config || config.agents.length === 0) {
    console.warn(`[WA Rotator] No config or agents found for rotator ${rotatorId}`);
    return null;
  }

  const idx = getNextAgentIndex(rotatorId, config.agents.length, config.mode);
  const agent = config.agents[idx];

  if (!agent?.number) return null;

  const message = customMessage || config.defaultMessage || "";
  return buildWaUrl(agent.number, message);
}

// ── Sync version for cases where we need the URL immediately ──
// Returns a fallback while async resolves
export function resolveWaRotatorUrlSync(
  rotatorId: string,
  agents: { name: string; number: string; label: string }[],
  mode: string,
  defaultMessage: string,
  customMessage?: string,
): string {
  if (!agents.length) return "#";

  const idx = getNextAgentIndex(rotatorId, agents.length, mode);
  const agent = agents[idx];
  const message = customMessage || defaultMessage || "";

  return buildWaUrl(agent.number, message);
}
