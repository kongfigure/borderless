import { useCallback, useEffect, useRef, useState } from "react";

function getSpeechRecognitionCtor(): typeof SpeechRecognition | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

export const SPEECH_RECOGNITION_SUPPORTED = typeof window !== "undefined" && !!getSpeechRecognitionCtor();

export const SPEECH_UNSUPPORTED_MESSAGE =
  "Voice input isn't supported in this browser, try Chrome or Safari.";

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

    setError(null);
    transcriptRef.current = "";

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
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
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone access was denied. Allow microphone access to use voice input.");
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setError("Voice input ran into a problem. Try again or type instead.");
      }
    };

    recognition.onend = () => {
      setListening(false);
      onFinish?.(transcriptRef.current.trim());
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  return { listening, error, start, stop, toggle, supported: SPEECH_RECOGNITION_SUPPORTED };
}
