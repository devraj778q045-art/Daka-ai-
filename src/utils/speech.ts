// Speech Recognition & Synthesis for DEKA AI (Hindi & English Support)

export interface SpeechRecognitionHandlers {
  onResult: (transcript: string, isFinal: boolean) => void;
  onWakeWord?: () => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export class DekaSpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentLanguage: string = 'hi-IN'; // Default bilingual Hindi / English
  private wakeWordDetected: boolean = false;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLanguage;
    }
  }

  public setLanguage(lang: 'hi' | 'en' | 'auto') {
    if (lang === 'hi') {
      this.currentLanguage = 'hi-IN';
    } else if (lang === 'en') {
      this.currentLanguage = 'en-US';
    } else {
      this.currentLanguage = 'hi-IN'; // auto starts with Indian regional context
    }

    if (this.recognition) {
      this.recognition.lang = this.currentLanguage;
    }
  }

  public isSupported(): boolean {
    return Boolean(
      typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }

  public startListening(handlers: SpeechRecognitionHandlers) {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        handlers.onError?.('Speech recognition is not supported in this browser. Please use Chrome or Android browser.');
        return;
      }
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.wakeWordDetected = false;

    this.recognition.onstart = () => {
      this.isListening = true;
      handlers.onStart?.();
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      const lower = text.toLowerCase();

      // Wake phrase check: "Hey Deka", "हे डेका", "Deka AI", "डेका"
      if (
        !this.wakeWordDetected &&
        (lower.includes('hey deka') ||
          lower.includes('हे डेका') ||
          lower.includes('deka ai') ||
          lower.includes('डेका') ||
          lower.includes('deka'))
      ) {
        this.wakeWordDetected = true;
        handlers.onWakeWord?.();
      }

      handlers.onResult(text, Boolean(finalTranscript));
    };

    this.recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        handlers.onError?.(`Speech error: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      handlers.onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (e: any) {
      console.warn('Speech start error:', e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

// Text to Speech
export class DekaTTS {
  private static synth: SpeechSynthesis | null =
    typeof window !== 'undefined' ? window.speechSynthesis : null;

  public static speak(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      lang?: 'hi' | 'en' | 'auto';
      onEnd?: () => void;
      onError?: () => void;
    } = {}
  ): boolean {
    if (!this.synth) return false;

    // Clean markdown before speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/#+\s+/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    if (!cleanText) return false;

    // Stop previous utterance
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;

    // Check language
    const hasDevanagari = /[\u0900-\u097F]/.test(cleanText);
    if (options.lang === 'hi' || hasDevanagari) {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-US';
    }

    // Try finding matching voice
    const voices = this.synth.getVoices();
    const matchingVoice = voices.find((v) =>
      hasDevanagari ? v.lang.startsWith('hi') : v.lang.startsWith('en')
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      options.onEnd?.();
    };

    utterance.onerror = () => {
      options.onError?.();
    };

    this.synth.speak(utterance);
    return true;
  }

  public static stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public static isSpeaking(): boolean {
    return Boolean(this.synth?.speaking);
  }
}
