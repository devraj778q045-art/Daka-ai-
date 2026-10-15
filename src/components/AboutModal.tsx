import React from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  Cpu,
  Globe,
  Mic,
  Camera,
  Database,
  Calculator,
  Smartphone,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { LanguageMode } from '../types/deka';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageMode;
  onOpenProjectTab?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  language,
  onOpenProjectTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#080d19] border border-cyan-500/35 rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/20 bg-gradient-to-r from-[#0a1224] via-[#0f1d38] to-[#0a1224] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] border border-cyan-300/40">
              <span className="font-mono text-black font-black text-xl tracking-tighter">Δ</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  DEKA AI
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  v2.5 Production
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'आधुनिक और स्मार्ट एंड्रॉइड AI सहायक'
                  : 'Smart & Futuristic Android AI Assistant'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-300 text-xs sm:text-sm leading-relaxed">
          {/* Mission & Brand */}
          <div className="p-4 rounded-2xl bg-[#0b1528] border border-cyan-500/20 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'hi' ? 'मिशन और दृष्टिकोण' : 'Mission & Architecture'}</span>
            </div>
            <p className="text-slate-200">
              {language === 'hi'
                ? 'DEKA AI एक अत्याधुनिक, मोबाइल-फर्स्ट AI असिस्टेंट है जो ChatGPT जैसी बातचीत और Google Gemini के गहरे संज्ञान के साथ काम करता है। यह हिंदी और अंग्रेज़ी दोनों भाषाओं में पारंगत है और बिना इंटरनेट के भी लोकल-फर्स्ट काम कर सकता है।'
                : 'DEKA AI is a cutting-edge, mobile-first AI assistant powered by Google Gemini cognitive neural engine. It delivers conversational chat with native bilingual Hindi & English fluency, voice interaction, and offline resilience.'}
            </p>
          </div>

          {/* Key Capabilities Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-[#060c18] border border-cyan-500/15 space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'hi' ? 'वॉइस व वेक-वर्ड' : 'Voice & Wake-Word'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'hi' ? '“Hey Deka” वेक वर्ड और लाइव स्पीच-टू-टेक्स्ट' : '"Hey Deka" wake word and realtime TTS'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#060c18] border border-cyan-500/15 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'hi' ? 'इमेज विश्लेषण' : 'Multimodal Vision'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'hi' ? 'इमेज अपलोड कर सवाल पूछने की सुविधा' : 'Upload photos, equations, and diagrams'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#060c18] border border-cyan-500/15 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'hi' ? 'गणित लैब व क्विज़' : 'Math Lab & Solver'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'hi' ? 'सटीक गणना और इंटरएक्टिव सवाल' : 'Direct arithmetic, quizzes & step solutions'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#060c18] border border-cyan-500/15 space-y-1">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>{language === 'hi' ? 'लाइव वेब सर्च' : 'Web Grounding'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'hi' ? 'Google Search ग्राउंडिंग के साथ रीयल-टाइम उत्तर' : 'Live Google search grounding citations'}
              </p>
            </div>
          </div>

          {/* Privacy & Security Pledge */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'hi' ? 'सुरक्षा और गोपनीयता गारंटी' : 'Privacy & Security Guarantee'}</span>
            </div>
            <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
              <li>{language === 'hi' ? 'सुरक्षित बैकएंड प्रॉक्सी: कोई भी API Key क्लाइंट में स्टोर नहीं होती।' : 'Secure server proxy: zero API keys stored on client.'}</li>
              <li>{language === 'hi' ? 'लोकल-फर्स्ट डेटाबेस (IndexedDB) में सुरक्षित डेटा।' : 'Local-first IndexedDB offline storage encryption.'}</li>
              <li>{language === 'hi' ? 'उपयोगकर्ता की अनुमति के बिना कोई फ़ाइल एक्सेस नहीं।' : 'No file accessed without explicit user selection.'}</li>
              <li>{language === 'hi' ? 'एक क्लिक में पूरी चैट हिस्ट्री मिटाने की सुविधा।' : 'One-click full chat history wiping available anytime.'}</li>
            </ul>
          </div>

          {/* Android Kotlin Native Export Option */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0b1528] to-[#0d1a33] border border-cyan-500/25 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-xs font-bold text-white">
                  {language === 'hi' ? 'नेटिव Android Studio सोर्स कोड' : 'Native Android Studio Project'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {language === 'hi' ? 'Kotlin और Jetpack Compose का पूरा कोड' : '100% Kotlin & Jetpack Compose codebase'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenProjectTab?.();
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)] flex items-center gap-1"
            >
              <span>{language === 'hi' ? 'कोड देखें' : 'View Code'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#050811] border-t border-cyan-500/15 flex items-center justify-between text-[11px] text-slate-500 px-5">
          <span>DEKA AI Framework v2.5.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
