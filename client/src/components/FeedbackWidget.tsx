import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageSquarePlus, X } from "lucide-react";
import { submitFeedback } from "@/lib/api";

const MAX_LENGTH = 2000;

export function FeedbackWidget() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function close() {
    setOpen(false);
    setSent(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);
    try {
      await submitFeedback(trimmed, location.pathname);
      setMessage("");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send feedback. Try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close feedback form" : "Give feedback"}
        aria-expanded={open}
        className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-ivory shadow-xl transition-transform hover:scale-105 dark:bg-ivory dark:text-dark-bg"
      >
        {open ? <X size={24} aria-hidden="true" /> : <MessageSquarePlus size={24} aria-hidden="true" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Feedback form"
          className="fixed bottom-24 left-5 z-50 w-[min(340px,calc(100vw-2.5rem))] overflow-hidden rounded-3xl border border-line bg-card shadow-2xl dark:border-dark-line dark:bg-dark-card"
        >
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3 dark:border-dark-line">
            <p className="font-display text-base text-ink dark:text-ivory">Feedback</p>
            <button
              type="button"
              onClick={close}
              aria-label="Close feedback form"
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink/60 hover:bg-line dark:text-ivory/60 dark:hover:bg-dark-line"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="px-4 py-4">
            {sent ? (
              <p className="text-sm text-ink/70 dark:text-ivory/70">
                Thanks — your feedback was recorded. This is a demo app, so nothing is actioned automatically.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label htmlFor="feedback-message" className="text-sm text-ink/70 dark:text-ivory/70">
                  Found a bug, or have an idea? Let us know.
                </label>
                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MAX_LENGTH))}
                  placeholder="What's on your mind?"
                  rows={4}
                  className="resize-none rounded-2xl border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none dark:border-dark-line dark:text-ivory"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink/40 dark:text-ivory/40">
                    {message.length}/{MAX_LENGTH}
                  </span>
                  <button
                    type="submit"
                    disabled={sending || message.trim().length === 0}
                    className="flex min-h-[40px] items-center justify-center rounded-full bg-forest px-5 text-sm font-semibold text-ivory transition-transform hover:scale-[1.02] disabled:opacity-50 dark:bg-gold dark:text-dark-bg"
                  >
                    {sending ? "Sending…" : "Send"}
                  </button>
                </div>
                {error && <p className="text-xs text-bad">{error}</p>}
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
