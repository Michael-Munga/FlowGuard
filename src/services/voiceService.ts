// src/services/voiceService.ts
//
// Wraps the browser Web Speech API (SpeechSynthesis).
// - Queued announcements (no overlap, sequential playback)
// - Mute/unmute state that persists in-session
// - Picks the best available English voice (UK preference)
// - Rate/pitch tuned for "operator console" clarity, not narration drama
//
// When you later swap to a cloud TTS (ElevenLabs / Azure), replace
// the internals of `speak()` with your fetch + audio-element playback.
// The public API stays the same.

type Listener = (muted: boolean) => void;

class VoiceService {
  private muted = false;
  private listeners: Set<Listener> = new Set();
  private queue: string[] = [];
  private speaking = false;
  private preferredVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      const preferences = [
        (v: SpeechSynthesisVoice) => v.lang === "en-GB" && /Daniel|Google UK English Male/i.test(v.name),
        (v: SpeechSynthesisVoice) => v.lang === "en-GB" && /Male/i.test(v.name),
        (v: SpeechSynthesisVoice) => v.lang === "en-GB",
        (v: SpeechSynthesisVoice) => v.lang === "en-US" && /Google US English|Samantha/i.test(v.name),
        (v: SpeechSynthesisVoice) => v.lang === "en-US",
        (v: SpeechSynthesisVoice) => v.lang.startsWith("en"),
      ];
      for (const test of preferences) {
        const found = voices.find(test);
        if (found) {
          this.preferredVoice = found;
          return;
        }
      }
    };

    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }

  get isMuted() {
    return this.muted;
  }

  get isSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.muted);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    this.listeners.forEach((fn) => fn(this.muted));
  }

  setMuted(next: boolean) {
    this.muted = next;
    if (next && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      this.queue = [];
      this.speaking = false;
    }
    this.emit();
  }

  toggleMute() {
    this.setMuted(!this.muted);
  }

  /** Speak a line, queued after any current utterance. */
  speak(text: string, opts?: { rate?: number; pitch?: number; volume?: number }) {
    if (!this.isSupported || this.muted) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    this.queue.push(trimmed);
    if (!this.speaking) this.drain(opts);
  }

  /** Cancel everything immediately. */
  cancel() {
    if (!this.isSupported) return;
    window.speechSynthesis.cancel();
    this.queue = [];
    this.speaking = false;
  }

  private drain(opts?: { rate?: number; pitch?: number; volume?: number }) {
    if (!this.isSupported || this.muted || !this.queue.length) {
      this.speaking = false;
      return;
    }
    const line = this.queue.shift()!;
    const u = new SpeechSynthesisUtterance(line);
    if (this.preferredVoice) u.voice = this.preferredVoice;
    u.rate = opts?.rate ?? 1.02;
    u.pitch = opts?.pitch ?? 0.98;
    u.volume = opts?.volume ?? 1;
    u.onend = () => {
      this.speaking = false;
      this.drain(opts);
    };
    u.onerror = () => {
      this.speaking = false;
      this.drain(opts);
    };
    this.speaking = true;
    window.speechSynthesis.speak(u);
  }
}

export const voiceService = new VoiceService();