import { useCallback, useEffect, useRef, useState } from "react";

function getSpeechRecognitionCtor(): typeof SpeechRecognition | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

export const SPEECH_RECOGNITION_SUPPORTED = typeof window !== "undefined" && !!getSpeechRecognitionCtor();

export const SPEECH_UNSUPPORTED_MESSAGE = "Voice input works in Chrome or Edge.";

function messageForErrorCode(code: string): string | null {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone is blocked. Click the lock icon in the address bar, allow the microphone, then reload.";
    case "no-speech":
      return "I didn't hear anything. Try again and speak after the Listening label appears.";
    case "audio-capture":
      return "No microphone found or another app is using it.";
    case "network":
      return "Speech recognition needs an internet connection and a browser that supports it. Open this site in Chrome.";
    case "aborted":
      return null;
    default:
      return `Voice input error: ${code}`;
  }
}

interface ActiveRecognition {
  recognition: SpeechRecognition;
  abort: () => void;
}

/** Only one SpeechRecognition instance may run at a time across the app —
 * the hero search box and the assistant's hands-free mode share a single
 * microphone, so starting one here forcibly aborts whichever instance
 * (from either call site) currently owns it. */
let active: ActiveRecognition | null = null;

interface UseSpeechToTextOptions {
  /** Called with the live transcript (interim + final) as the user speaks. */
  onTranscript?: (transcript: string) => void;
  /** Called once recognition stops, with the final transcript. */
  onFinish?: (transcript: string) => void;
  lang?: string;
}

/** Thin wrapper over the browser SpeechRecognition API. Never fabricates a
 * transcript — if the browser doesn't support it, `supported` is false and
 * callers should fall back to a text-only message. */
export function useSpeechToText({ onTranscript, onFinish, lang = "en-US" }: UseSpeechToTextOptions = {}) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const listeningRef = useRef(false);
  const transcriptRef = useRef("");

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError(SPEECH_UNSUPPORTED_MESSAGE);
      return;
    }

    // Guard against InvalidStateError: never call start() on an instance
    // that's already running.
    if (listeningRef.current) return;

    // Hand off the shared mic: forcibly abort whoever else is listening.
    active?.abort();
    active = null;

    setError(null);
    transcriptRef.current = "";

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          transcriptRef.current = `${transcriptRef.current} ${result[0].transcript}`.trim();
        } else {
          interim += result[0].transcript;
        }
      }
      onTranscript?.(`${transcriptRef.current} ${interim}`.trim());
    };

    recognition.onerror = (event) => {
      console.error("[useSpeechToText] SpeechRecognition error:", event.error);
      const message = messageForErrorCode(event.error);
      if (message) setError(message);
    };

    recognition.onend = () => {
      listeningRef.current = false;
      setListening(false);
      if (active?.recognition === recognition) active = null;
      onFinish?.(transcriptRef.current.trim());
    };

    recognitionRef.current = recognition;
    listeningRef.current = true;
    active = {
      recognition,
      abort: () => {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
        listeningRef.current = false;
        setListening(false);
      },
    };

    recognition.start();
    setListening(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const toggle = useCallback(() => {
    if (listeningRef.current) stop();
    else start();
  }, [start, stop]);

  useEffect(() => {
    return () => {
      if (active?.recognition === recognitionRef.current) active = null;
      recognitionRef.current?.stop();
    };
  }, []);

  return { listening, error, start, stop, toggle, supported: SPEECH_RECOGNITION_SUPPORTED };
}
