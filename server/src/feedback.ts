import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FEEDBACK_DIR = join(__dirname, "../../data");
const FEEDBACK_FILE = join(FEEDBACK_DIR, "feedback.json");

export interface FeedbackEntry {
  id: string;
  message: string;
  page: string;
  createdAt: string;
}

function readAll(): FeedbackEntry[] {
  try {
    return JSON.parse(readFileSync(FEEDBACK_FILE, "utf-8")) as FeedbackEntry[];
  } catch {
    return [];
  }
}

export function submitFeedback(message: string, page: string): FeedbackEntry {
  const entry: FeedbackEntry = { id: randomUUID(), message, page, createdAt: new Date().toISOString() };
  const all = [...readAll(), entry];
  if (!existsSync(FEEDBACK_DIR)) mkdirSync(FEEDBACK_DIR, { recursive: true });
  writeFileSync(FEEDBACK_FILE, JSON.stringify(all, null, 2));
  return entry;
}
