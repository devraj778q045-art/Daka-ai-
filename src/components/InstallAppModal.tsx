import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Laptop,
  ArrowRight,
  ShieldCheck,
  Flame,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import { LanguageMode } from '../types/deka';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageMode;
  onOpenProjectTab?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  language,
  onOpenProjectTab,
}) => {
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'publish' | 'apk'>('publish');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleNativeInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const PUBLIC_APP_URL = 'https://ais-pre-s2ibwrhwxfbpzje2yg7f7e-227948008805.asia-east1.run.app';
  const RECOMMENDED_SLUG = 'deka-ai';

  const handleCopyLink = () => {
    const urlToCopy = window.location.href.startsWith('http') && !window.location.href.includes('about:')
      ? window.location.href
      : PUBLIC_APP_URL;
    navigator.clipboard.writeText(urlToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopySlug = () => {
    navigator.clipboard.writeText(RECOMMENDED_SLUG);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#091120] border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.2)] flex flex-col text-white">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#091120]/95 backdrop-blur-md px-5 py-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Smartphone className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{language === 'hi' ? 'मोबाइल में कैसे इंस्टॉल व पब्लिश करें?' : 'Install on Mobile & Publish'}</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-400/30">
                  Live + PWA
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'लाइव यूआरएल प्राप्त करें या फ़ोन में 1-क्लिक में इंस्टॉल करें'
                  : 'Get live URL or install in 1-click on your phone'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">

          {/* Quick Install Prompt (If browser supports BeforeInstallPrompt) */}
          {deferredPrompt && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-blue-900/40 to-slate-900 border border-cyan-400/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {language === 'hi' ? '1-क्लिक ऑटोमैटिक इंस्टॉलेशन उपलब्ध' : '1-Click Direct Install Ready'}
                  </h4>
                  <p className="text-xs text-cyan-200/80">
                    {language === 'hi'
                      ? 'आपका ब्राउज़र सीधे ऐप इंस्टॉल करने की अनुमति दे रहा है'
                      : 'Your browser is ready to install DEKA AI directly'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleNativeInstallClick}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all hover:scale-105 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'hi' ? 'अभी इंस्टॉल करें' : 'Install Now'}</span>
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>
                {language === 'hi'
                  ? 'DEKA AI पहले से ही आपके मोबाइल/सिस्टम में स्टैंडअलोन ऐप की तरह एक्टिव है!'
                  : 'DEKA AI is already running as an installed standalone app!'}
              </span>
            </div>
          )}

          {/* Platform Switcher Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-[#060a12] border border-cyan-500/15 text-xs font-semibold">
            <button
              onClick={() => setActivePlatform('publish')}
              className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activePlatform === 'publish'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-extrabold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>पब्लिश गाइड (URL)</span>
            </button>
            <button
              onClick={() => setActivePlatform('android')}
              className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activePlatform === 'android'
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android (Chrome)</span>
            </button>
            <button
              onClick={() => setActivePlatform('ios')}
              className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activePlatform === 'ios'
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>iPhone (Safari)</span>
            </button>
            <button
              onClick={() => setActivePlatform('apk')}
              className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activePlatform === 'apk'
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Android APK</span>
            </button>
          </div>

          {/* Tab 0: Publish & URL Fix Guide */}
          {activePlatform === 'publish' && (
            <div className="space-y-4">
              {/* Problem & Solution Alert */}
              <div className="p-4 rounded-2xl bg-[#0d1c2e] border-2 border-cyan-400/40 space-y-3 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {language === 'hi'
                        ? 'पब्लिश में "यूआरएल गलत है (Invalid URL)" एरर क्यों आता है?'
                        : 'Why does AI Studio say "URL is Invalid" when Publishing?'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {language === 'hi'
                        ? 'Google AI Studio के Publish विंडो में "App URL" बॉक्स में पूरा लिंक (https://...) या स्पेस नहीं लिखना होता। वहाँ सिर्फ एक छोटा अंग्रेजी नाम (Slug) लिखना होता है!'
                        : 'In the AI Studio Publish dialog, the "App URL" field only expects a short slug (lowercase letters and hyphens), not a full https:// URL or spaces.'}
                    </p>
                  </div>
                </div>

                {/* Solution Box: Click to copy slug */}
                <div className="p-3.5 rounded-xl bg-[#060c18] border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-cyan-400 font-bold uppercase font-mono block">
                      {language === 'hi' ? '✅ AI Studio के URL बॉक्स में सिर्फ यह लिखें:' : '✅ Type only this into the URL box:'}
                    </span>
                    <span className="text-base font-black font-mono text-white tracking-wider">
                      deka-ai
                    </span>
                  </div>

                  <button
                    onClick={handleCopySlug}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      copiedSlug
                        ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    }`}
                  >
                    {copiedSlug ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSlug ? (language === 'hi' ? 'कॉपी हो गया!' : 'Copied!') : (language === 'hi' ? '"deka-ai" कॉपी करें' : 'Copy "deka-ai"')}</span>
                  </button>
                </div>

                {/* Comparison Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 space-y-1">
                    <span className="font-bold text-red-400 block">❌ क्या न लिखें (Invalid):</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[10px] text-red-200">
                      <li><code>https://ais-dev-...</code> (पूरा लिंक न डालें)</li>
                      <li><code>DEKA AI</code> (कैपिटल या स्पेस न दें)</li>
                      <li><code>डेका एआई</code> (हिंदी अक्षर न लिखें)</li>
                      <li><code>deka@ai</code> (स्पेशल सिंबल न दें)</li>
                    </ul>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 space-y-1">
                    <span className="font-bold text-emerald-400 block">✅ क्या लिखें (Valid):</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[10px] text-emerald-200">
                      <li><code>deka-ai</code> (सर्वश्रेष्ठ)</li>
                      <li><code>deka-assistant</code></li>
                      <li><code>deka-ai-app</code></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Direct Live App URL Card */}
              <div className="p-4 rounded-2xl bg-[#081224] border border-cyan-500/25 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>{language === 'hi' ? 'सीधा लाइव वेब यूआरएल (Direct Shareable URL)' : 'Direct Live Web URL'}</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                    Live
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/60 border border-cyan-500/20 font-mono text-xs text-cyan-300 break-all select-all">
                  {PUBLIC_APP_URL}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? (language === 'hi' ? 'लिंक कॉपी हो गया!' : 'URL Copied!') : (language === 'hi' ? 'लाइव लिंक कॉपी करें' : 'Copy Live URL')}</span>
                  </button>

                  <a
                    href={PUBLIC_APP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{language === 'hi' ? 'ब्राउज़र में खोलें' : 'Open in Browser'}</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tab 1: Android Chrome PWA */}
          {activePlatform === 'android' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0d1829] border border-cyan-500/20 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">
                      🤖
                    </span>
                    {language === 'hi'
                      ? 'Android फ़ोन में Chrome से 10 सेकंड में इंस्टॉल करें:'
                      : 'Install on Android Phone via Chrome (10 Seconds):'}
                  </h3>
                  <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    Recommended
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#080c14] border border-slate-800 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                      1
                    </span>
                    <div>
                      <strong className="text-white">
                        {language === 'hi' ? 'मोबाइल में लिंक खोलें:' : 'Open link on your phone:'}
                      </strong>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {language === 'hi'
                          ? 'अपने मोबाइल में Google Chrome ब्राउज़र में यह लिंक खोलें।'
                          : 'Open this web app link in Google Chrome or Edge on your Android phone.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#080c14] border border-slate-800 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                      2
                    </span>
                    <div>
                      <strong className="text-white">
                        {language === 'hi' ? '3 डॉट्स (⋮ Menu) दबाएँ:' : 'Tap 3 Dots (⋮ Menu):'}
                      </strong>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {language === 'hi'
                          ? 'Chrome के ऊपर दाएँ कोने में 3 डॉट्स (⋮ मेनू) पर टैप करें।'
                          : 'Tap the 3 dots menu button at the top right corner of Chrome.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#080c14] border border-cyan-500/30 flex items-start gap-3 bg-cyan-950/20">
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-black font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                      3
                    </span>
                    <div>
                      <strong className="text-cyan-300 font-bold">
                        {language === 'hi'
                          ? '"Install app" या "होम स्क्रीन पर जोड़ें" चुनें'
                          : 'Select "Install app" or "Add to Home screen"'}
                      </strong>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        {language === 'hi'
                          ? 'मेनू में "Install app" (या "Add to Home screen") विकल्प पर टैप करें और फिर "Install" पर क्लिक करें।'
                          : 'Tap "Install app" (or "Add to Home screen") from the list, then tap "Install" on the prompt.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#080c14] border border-slate-800 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                      ✓
                    </span>
                    <div>
                      <strong className="text-emerald-300">
                        {language === 'hi' ? 'बधाई! ऐप इंस्टॉल हो गया:' : 'Ready! Native-like App Icon Created:'}
                      </strong>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {language === 'hi'
                          ? 'DEKA AI आपके फ़ोन के होम स्क्रीन और ऐप ड्रॉअर में एक असली फुल-स्क्रीन ऐप की तरह काम करेगा। यह ऑफ़लाइन भी चलेगा!'
                          : 'DEKA AI will appear as an app icon on your home screen and drawer, opening in full screen standalone mode with offline IndexedDB support.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: iPhone Safari PWA */}
          {activePlatform === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0d1829] border border-cyan-500/20 space-y-3.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs font-mono">
                    🍎
                  </span>
                  {language === 'hi'
                    ? 'iPhone / iPad में Safari से कैसे इंस्टॉल करें:'
                    : 'Install on iPhone / iPad via Safari:'}
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#080c14] border border-slate-800 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                      1
                    </span>
                    <div>
                      <strong className="text-white">
                        {language === 'hi' ? 'Safari में लिंक खोलें:' : 'Open link in Safari:'}
                      </strong>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {language === 'hi'
                          ? 'इस वेब ऐप को iPhone के डिफ़ॉल्ट Safari ब्राउज़र में खोलें।'
                          : 'Open this app inside the default Safari browser on iOS.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#080c14] border border-cyan-500/30 flex items-start gap-3 bg-cyan-950/20">
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-black font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                      2
                    </span>
                    <div>
                      <strong className="text-cyan-300 font-bold">
                        {language === 'hi' ? 'शेयर बटन (📤 Share) पर टैप करें:' : 'Tap Share Button (📤):'}
                      </strong>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        {language === 'hi'
                          ? 'स्क्रीन के सबसे नीचे बार में दिए गए शेयर (Share 📤) आइकन पर टैप करें।'
                          : 'Tap the Share icon (box with upward arrow) at the bottom toolbar.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#080c14] border border-slate-800 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                      3
                    </span>
                    <div>
                      <strong className="text-white">
                        {language === 'hi'
                          ? '"Add to Home Screen (होम स्क्रीन में जोड़ें)" चुनें:'
                          : 'Select "Add to Home Screen":'}
                      </strong>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {language === 'hi'
                          ? 'नीचे स्क्रॉल करें और "Add to Home Screen" (+) विकल्प पर टैप करके ऊपर "Add" दबाएँ।'
                          : 'Scroll down the share sheet and tap "Add to Home Screen", then tap "Add" at the top right.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Native Android APK */}
          {activePlatform === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0d1829] border border-cyan-500/20 space-y-3.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-mono">
                    ⚡
                  </span>
                  {language === 'hi'
                    ? 'असली Android APK (Kotlin & Jetpack Compose प्रोजेक्ट):'
                    : 'Native Android APK (Kotlin & Jetpack Compose):'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'hi'
                    ? 'इस ऐप के साथ पूरा Android Studio नेटिव प्रोजेक्ट पहले से तैयार है जिसमें DekaOrb, SpeechRecognizer, TextToSpeech और Android Intents शामिल हैं।'
                    : 'The repository includes a complete Android Studio native project with Jetpack Compose, SpeechRecognizer, and Android intents.'}
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#080c14] border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono">
                      Step 1: Download Source ZIP
                    </span>
                    <p className="text-slate-400 text-[11px]">
                      {language === 'hi'
                        ? 'प्रोजेक्ट टैब से पूरा Android Studio कोड डाउनलोड करें।'
                        : 'Download the complete Android Studio project ZIP from the Project tab.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#080c14] border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono">
                      Step 2: Build Debug APK
                    </span>
                    <div className="p-2 rounded bg-black/60 font-mono text-[11px] text-cyan-300">
                      ./gradlew assembleDebug
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      आउटपुट APK मिलेगा: <code className="text-cyan-300">app/build/outputs/apk/debug/app-debug.apk</code>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#080c14] border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono">
                      Step 3: Phone Install
                    </span>
                    <p className="text-slate-400 text-[11px]">
                      {language === 'hi'
                        ? 'APK को अपने फोन में भेजकर सीधे "Install" पर टैप करें या USB से adb install चलाएं।'
                        : 'Transfer the APK file to your phone and tap to install, or run adb install.'}
                    </p>
                  </div>
                </div>

                {onOpenProjectTab && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenProjectTab();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>{language === 'hi' ? 'Android Studio प्रोजेक्ट हब खोलें' : 'Open Android Studio Hub'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Share App Link section */}
          <div className="p-4 rounded-2xl bg-[#070d17] border border-cyan-500/15 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">
                  {language === 'hi' ? 'मोबाइल में लिंक भेजें (Copy Link)' : 'Send Link to Mobile (Copy Link)'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {language === 'hi'
                    ? 'लिंक कॉपी करके अपने WhatsApp या मैसेज पर भेजें और मोबाइल में खोलें'
                    : 'Copy this link and send to your phone to install directly'}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyLink}
              className={`w-full sm:w-auto flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                copiedLink
                  ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-400/30'
              }`}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? (language === 'hi' ? 'कॉपी हो गया!' : 'Copied!') : (language === 'hi' ? 'लिंक कॉपी करें' : 'Copy Link')}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#070c16] border-t border-cyan-500/15 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'hi' ? 'ऑफ़लाइन लोकल-फर्स्ट सपोर्टेड' : '100% Offline IndexedDB Supported'}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
