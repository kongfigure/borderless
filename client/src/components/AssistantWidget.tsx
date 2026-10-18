import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Headphones, Mic, MessageCircle, Send, Square, Volume2, VolumeX, X } from "lucide-react";
import type { Product } from "@shared/types";
import { landedCost, trustVerdict } from "@shared/calculations";
import { fetchProducts, askAssistant, type AssistantContext } from "@/lib/api";
import { hasAnyPreference, loadPreferences } from "@/lib/preferences";
import { SPEECH_UNSUPPORTED_MESSAGE, useSpeechToText } from "@/hooks/useSpeechToText";

const MAX_TURNS = 10;
const MAX_VISIBLE_PRODUCTS = 20;

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: "live" | "fallback";
}

export function AssistantWidget() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [products, setProducts] = useState<Product[] | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voiceModeRef = useRef(false);
  voiceModeRef.current = voiceMode;

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts(null));
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const context: AssistantContext = useMemo(() => {
    const visibleProducts = (products ?? []).slice(0, MAX_VISIBLE_PRODUCTS).map((p) => ({
      id: p.id,
      title: p.title,
      marketplace: p.marketplace,
      country: p.country,
      totalUSD: landedCost(p).totalUSD,
      verdict: trustVerdict(p).verdict,
    }));
    const prefs = loadPreferences();
    return {
      route: location.pathname,
      visibleProducts,
      cart: [],
      preferences: hasAnyPreference(prefs)
        ? { budgetUSD: prefs.budgetUSD, categories: prefs.categories, deliveryDeadlineDays: prefs.deliveryDeadlineDays }
        : null,
    };
  }, [products, location.pathname]);

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
  }

  function speak(text: string, onEnd: () => void) {
    if (!speakEnabled || typeof window === "undefined" || !window.speechSynthesis) {
      onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
    window.speechSynthesis.speak(utterance);
  }

  const {
    listening,
    error: speechError,
    start: startListening,
    stop: stopListening,
    toggle: toggleListening,
    supported: speechSupported,
  } = useSpeechToText({
    onTranscript: setInput,
    onFinish: (transcript) => {
      const trimmed = transcript.trim();
      if (trimmed) {
        void sendMessage(trimmed);
      } else if (voiceModeRef.current) {
        setVoiceMode(false);
      }
    },
  });

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setInput("");
    setSendError(null);
    const userTurn: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const history = [...messages, userTurn].slice(-MAX_TURNS);
    setMessages(history);
    setSending(true);

    try {
      const result = await askAssistant({
        message: trimmed,
        history: messages.slice(-MAX_TURNS).map(({ role, content }) => ({ role, content })),
        context,
      });
      const replyTurn: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.reply,
        source: result.source,
      };
      setMessages((prev) => [...prev, replyTurn].slice(-MAX_TURNS));
      speak(result.reply, () => {
        if (voiceModeRef.current) startListening();
      });
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Something went wrong reaching the assistant.");
    } finally {
      setSending(false);
    }
  }

  function toggleVoiceMode() {
    if (voiceMode) {
      setVoiceMode(false);
      stopListening();
      stopSpeaking();
    } else {
      setVoiceMode(true);
      setSpeakEnabled(true);
      startListening();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close shopping assistant" : "Open shopping assistant"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-forest text-ivory shadow-xl transition-transform hover:scale-105 dark:bg-gold dark:text-dark-bg"
      >
        {open ? <X size={24} aria-hidden="true" /> : <MessageCircle size={24} aria-hidden="true" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Shopping assistant"
          className="fixed bottom-24 right-5 z-50 flex max-h-[70vh] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-2xl dark:border-dark-line dark:bg-dark-card"
        >
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3 dark:border-dark-line">
            <p className="font-display text-base text-ink dark:text-ivory">Shopping assistant</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setSpeakEnabled((v) => !v);
                  if (speakEnabled) stopSpeaking();
                }}
                aria-pressed={speakEnabled}
                aria-label={speakEnabled ? "Turn off read-aloud replies" : "Turn on read-aloud replies"}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-line dark:text-ivory/60 dark:hover:bg-dark-line"
              >
                {speakEnabled ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={stopSpeaking}
                aria-label="Stop reading reply aloud"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-line dark:text-ivory/60 dark:hover:bg-dark-line"
              >
                <Square size={14} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <p className="text-sm text-ink/50 dark:text-ivory/50">
                Ask about delivered prices, trust verdicts, or compare two products. Sample data only.
              </p>
            )}
            {messages.map((m) =>
              m.role === "user" ? (
                <div
                  key={m.id}
                  className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-forest px-4 py-2.5 text-sm text-ivory dark:bg-gold dark:text-dark-bg"
                >
                  {m.content}
                </div>
              ) : (
                <div
                  key={m.id}
                  className="mr-auto max-w-[85%] rounded-2xl rounded-tl-sm border border-line bg-ivory px-4 py-2.5 text-sm text-ink dark:border-dark-line dark:bg-dark-bg dark:text-ivory"
                >
                  {m.source === "fallback" && (
                    <span className="mb-1 block rounded-full bg-line px-2 py-0.5 text-[10px] font-medium text-ink/60 dark:bg-dark-line dark:text-ivory/60">
                      Offline
                    </span>
                  )}
                  {m.content}
                </div>
              )
            )}
            {sending && (
              <div className="mr-auto rounded-2xl rounded-tl-sm border border-line bg-ivory px-4 py-2.5 text-sm text-ink/60 dark:border-dark-line dark:bg-dark-bg dark:text-ivory/60">
                Thinking…
              </div>
            )}
            {sendError && <p className="text-xs text-bad">{sendError}</p>}
          </div>

          {(speechError || !speechSupported) && (
            <p className="px-4 text-xs text-ink/50 dark:text-ivory/50">{speechError ?? SPEECH_UNSUPPORTED_MESSAGE}</p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
            className="flex items-center gap-2 border-t border-line p-3 dark:border-dark-line"
          >
            <button
              type="button"
              onClick={toggleVoiceMode}
              aria-pressed={voiceMode}
              aria-label={voiceMode ? "Stop hands-free voice mode" : "Start hands-free voice mode"}
              title="Hands-free voice conversation"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                voiceMode
                  ? "bg-gold/20 text-gold"
                  : "text-ink/50 hover:bg-line dark:text-ivory/50 dark:hover:bg-dark-line"
              }`}
            >
              <Headphones size={16} className={voiceMode && listening ? "animate-pulse" : ""} aria-hidden="true" />
            </button>
            <label htmlFor="assistant-input" className="sr-only">
              Message the shopping assistant
            </label>
            <input
              id="assistant-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening…" : "Ask the assistant…"}
              className="min-w-0 flex-1 rounded-full border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none dark:border-dark-line dark:text-ivory"
            />
            <button
              type="button"
              onClick={toggleListening}
              aria-pressed={listening}
              aria-label={listening ? "Stop voice input" : "Use voice input"}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                listening
                  ? "bg-gold/20 text-gold"
                  : "text-ink/50 hover:bg-line dark:text-ivory/50 dark:hover:bg-dark-line"
              }`}
            >
              <Mic size={16} className={listening ? "animate-pulse" : ""} aria-hidden="true" />
            </button>
            <button
              type="submit"
              disabled={sending}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-ivory transition-transform hover:scale-105 disabled:opacity-50 dark:bg-gold dark:text-dark-bg"
            >
              <Send size={16} aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
