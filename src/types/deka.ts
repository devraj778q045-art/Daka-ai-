export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type LanguageMode = 'auto' | 'hi' | 'en';

export type ThemeMode = 'futuristic-dark' | 'deep-navy' | 'amoled-black' | 'light';

export interface AppPreferences {
  language: LanguageMode;
  theme: ThemeMode;
  ttsEnabled: boolean;
  speechRate: number;
  batterySaver: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: {
    data: string; // base64 string
    mimeType: string;
  };
  timestamp: number;
  detectedIntent?: string;
  actionPayload?: any;
  groundingSources?: Array<{
    title?: string;
    url?: string;
  }>;
  brainStats?: {
    engine?: string;
    model?: string;
    cognitiveMode?: string;
    latencyMs?: number;
    thoughtProcess?: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AppShortcut {
  id: string;
  name: string;
  nameHi: string;
  packageName: string;
  description: string;
  descriptionHi: string;
  iconName: string;
  color: string;
  intentUrl: string;
  fallbackUrl: string;
  category: 'social' | 'media' | 'utility' | 'system';
}

export interface DocumentAnalysis {
  name: string;
  size: number;
  type: string;
  content: string;
  summary?: string;
  keyPoints?: string[];
  analyzedAt?: number;
}

export interface UserProfileData {
  name: string;
  phoneNumber: string;
  email: string;
}

export interface DeviceTelemetry {
  currentTime: string;
  currentDate: string;
  timezone: string;
  batteryLevel: number;
  isCharging: boolean;
  isBatterySupported: boolean;
}
