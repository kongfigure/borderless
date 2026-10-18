import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, "..", ".cache");
const RESPONSE_CACHE_FILE = join(CACHE_DIR, "responses.json");
const CALL_COUNT_FILE = join(CACHE_DIR, "call-count.json");

const MODEL = "claude-haiku-4-5-20251001";
/** Hard cap on live API calls for the lifetime of this demo deployment —
 * persisted to disk so it survives restarts, since the point is to bound
 * real spend, not just spend-per-process. */
const MAX_LIVE_CALLS = 200;
/** A hung model call must never hang the chat — callers always get a
 * null (and fall back to a template) within this many milliseconds. */
const REQUEST_TIMEOUT_MS = 8000;

const responseCache = new Map<string, string>();
let cacheLoaded = false;
let callCount = 0;
let callCountLoaded = false;

function ensureCacheDir(): void {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
}

function loadResponseCache(): void {
  if (cacheLoaded) return;
  cacheLoaded = true;
  try {
    const parsed = JSON.parse(readFileSync(RESPONSE_CACHE_FILE, "utf-8")) as Record<string, string>;
    for (const [key, value] of Object.entries(parsed)) responseCache.set(key, value);
  } catch {
    // No cache on disk yet.
  }
}

function persistResponseCache(): void {
  try {
    ensureCacheDir();
    writeFileSync(RESPONSE_CACHE_FILE, JSON.stringify(Object.fromEntries(responseCache)));
  } catch {
    // Best-effort — a failed write just means this response won't be cached.
  }
}

function loadCallCount(): void {
  if (callCountLoaded) return;
  callCountLoaded = true;
  try {
    const parsed = JSON.parse(readFileSync(CALL_COUNT_FILE, "utf-8")) as { count?: number };
    callCount = typeof parsed.count === "number" ? parsed.count : 0;
  } catch {
    callCount = 0;
  }
}

function persistCallCount(): void {
  try {
    ensureCacheDir();
    writeFileSync(CALL_COUNT_FILE, JSON.stringify({ count: callCount }));
  } catch {
    // Best-effort — worst case the cap resets a bit early next run.
  }
}

export interface GenerateMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateOptions {
  /** Shorthand for messages: [{ role: "user", content: prompt }]. */
  prompt?: string;
  messages?: GenerateMessage[];
  system?: string;
  maxTokens: number;
}

export interface GenerateResult {
  text: string;
  source: "live" | "cached";
}

function toMessages(options: GenerateOptions): GenerateMessage[] {
  return options.messages ?? [{ role: "user", content: options.prompt ?? "" }];
}

function cacheKeyFor(options: GenerateOptions, messages: GenerateMessage[]): string {
  const hash = createHash("sha256");
  hash.update(JSON.stringify({ system: options.system ?? null, messages, maxTokens: options.maxTokens }));
  return hash.digest("hex");
}

/**
 * The only place in this app that talks to the Anthropic API. Every caller
 * gets: a memory+disk response cache (identical requests never re-bill),
 * and a hard cap of MAX_LIVE_CALLS live calls for the process's lifetime.
 * Returns null when there's no API key, the cap is reached, or the call
 * fails — callers are expected to fall back to a deterministic template in
 * that case, never to fabricate a "live" response.
 */
export async function generate(options: GenerateOptions): Promise<GenerateResult | null> {
  loadResponseCache();
  loadCallCount();

  const messages = toMessages(options);
  const key = cacheKeyFor(options, messages);

  const cached = responseCache.get(key);
  if (cached !== undefined) {
    return { text: cached, source: "cached" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || callCount >= MAX_LIVE_CALLS) {
    return null;
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create(
      {
        model: MODEL,
        max_tokens: options.maxTokens,
        ...(options.system ? { system: options.system } : {}),
        messages,
      },
      { timeout: REQUEST_TIMEOUT_MS }
    );
    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!text) return null;

    callCount += 1;
    persistCallCount();
    responseCache.set(key, text);
    persistResponseCache();

    return { text, source: "live" };
  } catch {
    return null;
  }
}

/** One-line startup summary of whether live Claude calls are available and
 * how much of the cost cap has been used, for the server's boot log. */
export function llmStatusLine(): string {
  loadCallCount();
  loadResponseCache();

  if (!process.env.ANTHROPIC_API_KEY) {
    return "[llm] No ANTHROPIC_API_KEY set — all AI features running in fallback mode.";
  }
  if (callCount >= MAX_LIVE_CALLS) {
    return `[llm] Claude ${MODEL} — live call cap reached (${callCount}/${MAX_LIVE_CALLS}), now running in fallback mode.`;
  }
  return `[llm] Claude ${MODEL} enabled — ${callCount}/${MAX_LIVE_CALLS} live calls used, ${responseCache.size} responses cached.`;
}
