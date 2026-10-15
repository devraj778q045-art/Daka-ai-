import React, { useState } from 'react';
import {
  Mic,
  Send,
  MessageSquare,
  Sparkles,
  Smartphone,
  FolderOpen,
  History,
  Languages,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { DekaOrb } from './DekaOrb';
import { OrbState, LanguageMode } from '../types/deka';
import { UNIVERSAL_APPS, executeAppLaunch } from '../utils/appLauncher';
import { Play, Search, ExternalLink } from 'lucide-react';

interface HomeScreenProps {
  orbState: OrbState;
  isListening: boolean;
  onOrbClick: () => void;
  onMicClick: () => void;
  onSendPrompt: (prompt: string) => void;
  onNavigateTab: (tab: 'home' | 'chat' | 'voice' | 'apps' | 'project' | 'settings') => void;
  language: LanguageMode;
  onToggleLanguage: () => void;
  batterySaver?: boolean;
  onOpenInstallModal?: () => void;
  onOpenMathLab?: () => void;
  onOpenPublishModal?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  orbState,
  isListening,
  onOrbClick,
  onMicClick,
  onSendPrompt,
  onNavigateTab,
  language,
  onToggleLanguage,
  batterySaver = false,
  onOpenInstallModal,
  onOpenMathLab,
  onOpenPublishModal,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const q = inputText.trim();
    setInputText('');
    onSendPrompt(q);
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 bg-futuristic-radial flex flex-col items-center justify-between max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pt-1 gap-2">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.5)] border border-cyan-300/40">
            <span className="font-mono text-black font-black text-xl tracking-tighter">Δ</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-wider glow-text-cyan">
                DEKA AI
              </h1>
              <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-400/30">
                v1.0 ANDROID
              </span>
              {batterySaver && (
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40 flex items-center gap-1">
                  🔋 ECO
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Futuristic Neural Assistant for Android
            </p>
          </div>
        </div>

        {/* Right Header Controls: Install on Phone & Language Toggle */}
        <div className="flex items-center gap-1.5">
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25 transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)]"
              title={language === 'hi' ? 'मोबाइल में इंस्टॉल करें (Install App)' : 'Install on Mobile'}
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">
                {language === 'hi' ? 'मोबाइल में इंस्टॉल' : 'Install App'}
              </span>
            </button>
          )}

          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#0b1528] border border-cyan-500/30 text-xs font-semibold text-cyan-300 hover:bg-cyan-950/40 transition-all shadow-sm"
            title="Switch Language (Hindi / English / Auto)"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'hi' ? 'हिंदी' : language === 'en' ? 'EN' : 'Auto'}</span>
          </button>
        </div>
      </div>

      {/* Central Large Glowing Orb Area */}
      <div className="flex flex-col items-center justify-center my-auto py-2">
        {/* Gemini Brain Neural Status Tag */}
        <div className={`mb-3 flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
          batterySaver
            ? 'bg-amber-950/30 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
            : 'bg-cyan-950/40 border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
        }`}>
          <span className={`w-2 h-2 rounded-full ${batterySaver ? 'bg-amber-400' : 'bg-cyan-400 animate-ping'}`} />
          <span className={`text-[11px] font-bold tracking-wide flex items-center gap-1.5 ${
            batterySaver ? 'text-amber-300' : 'text-cyan-300'
          }`}>
            🧠 {language === 'hi' ? 'जेमिनाई का दिमाग सक्रिय (Gemini Brain Active)' : 'Google Gemini 3.1 Brain Active'}
            {batterySaver && (
              <span className="text-[10px] text-amber-400/90 font-mono">
                [Eco Mode]
              </span>
            )}
          </span>
        </div>

        <DekaOrb state={orbState} size={250} onClick={onOrbClick} batterySaver={batterySaver} />

        <div className="mt-4 flex flex-col items-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0b1528] border border-cyan-500/25 text-xs text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isListening
                  ? 'bg-cyan-400 animate-ping'
                  : orbState === 'speaking'
                  ? 'bg-blue-400 animate-pulse'
                  : 'bg-emerald-400'
              }`}
            />
            {isListening
              ? language === 'hi'
                ? 'जेमिनाई का दिमाग आपकी आवाज़ सुन रहा है...'
                : 'Gemini Brain is listening... Say something'
              : orbState === 'thinking'
              ? language === 'hi'
                ? 'जेमिनाई न्यूरल प्रोसेसिंग (सोच रहा है)...'
                : 'Gemini Brain is reasoning...'
              : orbState === 'speaking'
              ? language === 'hi'
                ? 'जेमिनाई आवाज़ में बोल रहा है...'
                : 'Gemini Brain is speaking...'
              : language === 'hi'
              ? 'नमस्ते! जेमिनाई का दिमाग तैयार है — कुछ भी पूछें'
              : 'Gemini Brain Ready • Tap orb or say "Hey Deka"'}
          </span>
        </div>

        {/* Gemini Brain Neural Highlights */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[10px]">
          <span className="px-2.5 py-0.5 rounded-full bg-[#0b1528] text-cyan-300 border border-cyan-500/20">
            ⚡ {language === 'hi' ? 'गहन तर्क क्षमता' : 'Deep Reasoning'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#0b1528] text-blue-300 border border-blue-500/20">
            🌐 {language === 'hi' ? 'द्विभाषी हिंदी+English' : 'Bilingual Engine'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#0b1528] text-emerald-300 border border-emerald-500/20">
            📱 {language === 'hi' ? 'एंड्रॉइड इंटेंट दिमाग' : 'Android Intent Core'}
          </span>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold uppercase tracking-wider">
          <span>{language === 'hi' ? 'त्वरित क्रियाएं' : 'Quick Actions'}</span>
          <span className="text-[10px] text-cyan-400">Android Shortcuts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => onNavigateTab('chat')}
            className="p-3 rounded-2xl bg-[#0b1528] border border-cyan-500/20 hover:border-cyan-400/60 hover:bg-[#0f1d38] text-left transition-all flex flex-col justify-between group shadow-sm hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 w-fit group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <p className="text-xs font-bold text-white">Ask AI</p>
              <p className="text-[10px] text-slate-400">{language === 'hi' ? 'चैट करें' : 'ChatGPT Chat'}</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('voice')}
            className="p-3 rounded-2xl bg-[#0b1528] border border-cyan-500/20 hover:border-cyan-400/60 hover:bg-[#0f1d38] text-left transition-all flex flex-col justify-between group shadow-sm hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 w-fit group-hover:scale-110 transition-transform">
              <Mic className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <p className="text-xs font-bold text-white">Voice AI</p>
              <p className="text-[10px] text-slate-400">{language === 'hi' ? 'बोलकर पूछें' : 'Voice Mode'}</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('apps')}
            className="p-3 rounded-2xl bg-[#0b1528] border border-cyan-500/20 hover:border-cyan-400/60 hover:bg-[#0f1d38] text-left transition-all flex flex-col justify-between group shadow-sm hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 w-fit group-hover:scale-110 transition-transform">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <p className="text-xs font-bold text-white">Open Apps</p>
              <p className="text-[10px] text-slate-400">{language === 'hi' ? 'ऐप्स खोलें' : 'Intents'}</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('apps')}
            className="p-3 rounded-2xl bg-[#0b1528] border border-cyan-500/20 hover:border-cyan-400/60 hover:bg-[#0f1d38] text-left transition-all flex flex-col justify-between group shadow-sm hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 w-fit group-hover:scale-110 transition-transform">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <p className="text-xs font-bold text-white">Documents</p>
              <p className="text-[10px] text-slate-400">{language === 'hi' ? 'फाइल सारांश' : 'PDF & Files'}</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('chat')}
            className="p-3 rounded-2xl bg-[#0b1528] border border-cyan-500/20 hover:border-cyan-400/60 hover:bg-[#0f1d38] text-left transition-all flex flex-col justify-between group shadow-sm hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] col-span-2 sm:col-span-1"
          >
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 w-fit group-hover:scale-110 transition-transform">
              <History className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <p className="text-xs font-bold text-white">Chat History</p>
              <p className="text-[10px] text-slate-400">{language === 'hi' ? 'इतिहास' : 'Past Chats'}</p>
            </div>
          </button>
        </div>

        {/* Quick 1-Tap App & In-App Search Shortcuts Bar */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 px-0.5">
            <span className="font-semibold uppercase tracking-wider text-cyan-400">
              {language === 'hi' ? '⚡ 1-टैप ऐप खोलें व सर्च करें' : '⚡ 1-Tap App & Search Shortcuts'}
            </span>
            <button
              onClick={() => onNavigateTab('apps')}
              className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-0.5"
            >
              <span>{language === 'hi' ? 'सभी ऐप्स देखें' : 'View all'}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {[
              { id: 'youtube', name: 'YouTube', nameHi: 'यूट्यूब', query: 'Latest songs 2026', color: '#FF0000' },
              { id: 'maps', name: 'Maps', nameHi: 'मैप्स', query: 'Taj Mahal', color: '#34A853' },
              { id: 'whatsapp', name: 'WhatsApp', nameHi: 'व्हाट्सएप', query: '', color: '#25D366' },
              { id: 'spotify', name: 'Spotify', nameHi: 'स्पॉटिफ़ाई', query: 'Top Hindi Hits', color: '#1DB954' },
              { id: 'google', name: 'Google', nameHi: 'गूगल', query: 'AI Tech 2026', color: '#4285F4' },
              { id: 'playstore', name: 'Play Store', nameHi: 'प्ले स्टोर', query: 'BGMI', color: '#01875F' },
              { id: 'camera', name: 'Camera', nameHi: 'कैमरा', query: '', color: '#00F0FF' },
              { id: 'calculator', name: 'Calculator', nameHi: 'कैलकुलेटर', query: '', color: '#FFB703' },
            ].map((shortcut) => (
              <button
                key={shortcut.id}
                onClick={async () => {
                  const targetApp = UNIVERSAL_APPS.find((a) => a.id === shortcut.id);
                  if (targetApp) {
                    if (shortcut.id === 'camera' || shortcut.id === 'calculator') {
                      onNavigateTab('apps');
                    } else {
                      await executeAppLaunch(targetApp, shortcut.query);
                    }
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1528] hover:bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400 text-xs font-semibold text-slate-200 hover:text-white whitespace-nowrap transition-all shadow-sm"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: shortcut.color }}
                />
                <span>{language === 'hi' ? shortcut.nameHi : shortcut.name}</span>
                {shortcut.query && (
                  <span className="text-[10px] text-cyan-400/80 font-normal">
                    ({shortcut.query})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Live Telemetry Quick Inquiry Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-[11px]">
          <button
            type="button"
            onClick={() => onSendPrompt(language === 'hi' ? 'टाइम और तारीख क्या है?' : 'What is the current time and date?')}
            className="px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 font-medium whitespace-nowrap transition-colors flex items-center gap-1"
          >
            <span>⏰</span>
            <span>{language === 'hi' ? 'टाइम क्या है?' : 'What time is it?'}</span>
          </button>

          <button
            type="button"
            onClick={() => onSendPrompt(language === 'hi' ? 'बैटरी कितनी प्रतिशत बची है?' : 'What is my battery percentage?')}
            className="px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 font-medium whitespace-nowrap transition-colors flex items-center gap-1"
          >
            <span>🔋</span>
            <span>{language === 'hi' ? 'बैटरी प्रतिशत?' : 'Battery %?'}</span>
          </button>

          <button
            type="button"
            onClick={() => onSendPrompt(language === 'hi' ? 'मेरा नाम और मोबाइल नंबर क्या है?' : 'What is my name and phone number?')}
            className="px-2.5 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/25 border border-blue-400/30 text-blue-300 font-medium whitespace-nowrap transition-colors flex items-center gap-1"
          >
            <span>👤</span>
            <span>{language === 'hi' ? 'मेरा नाम व मोबाइल?' : 'My name & phone?'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('settings')}
            className="px-2.5 py-1 rounded-full bg-purple-500/10 hover:bg-purple-500/25 border border-purple-400/30 text-purple-300 font-medium whitespace-nowrap transition-colors flex items-center gap-1"
          >
            <span>📈</span>
            <span>{language === 'hi' ? 'बैटरी खपत चार्ट' : 'Battery Trends'}</span>
          </button>

          {onOpenPublishModal && (
            <button
              type="button"
              onClick={onOpenPublishModal}
              className="px-2.5 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-medium whitespace-nowrap transition-colors flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
            >
              <span>🌐</span>
              <span>{language === 'hi' ? 'लाइव यूआरएल व पब्लिश' : 'Live URL & Publish'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (onOpenMathLab) {
                onOpenMathLab();
              } else {
                onSendPrompt(language === 'hi' ? 'गणित का सवाल दो' : 'Give me a math question');
              }
            }}
            className="px-2.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-medium whitespace-nowrap transition-colors flex items-center gap-1 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
          >
            <span>🧮</span>
            <span>{language === 'hi' ? 'गणित का सवाल (Math Lab)' : 'Math Challenge'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Microphone and Prompt Bar */}
      <div className="w-full pt-1">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-[#0b1528] border border-cyan-500/30 rounded-3xl p-1.5 focus-within:border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.25)] transition-all"
        >
          {/* Big Mic Button */}
          <button
            type="button"
            onClick={onMicClick}
            className={`p-3 rounded-2xl transition-all flex items-center justify-center ${
              isListening
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,240,255,0.7)] animate-pulse'
                : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
            }`}
            title="Speak with DEKA AI (Hindi or English)"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'DEKA AI से कुछ भी पूछें... (उदा: व्हाट्सएप खोलो)'
                : 'Ask DEKA AI anything or give voice command...'
            }
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none px-2"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold disabled:bg-slate-800 disabled:text-slate-600 transition-all shadow-[0_0_15px_rgba(0,240,255,0.35)] disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
