import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Download,
  Smartphone,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Server,
  Terminal,
  ShieldCheck,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import { LanguageMode } from '../types/deka';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageMode;
  onOpenAndroidHub?: () => void;
  onOpenInstallModal?: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  language,
  onOpenAndroidHub,
  onOpenInstallModal,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<{
    online: boolean;
    checking: boolean;
    port?: number;
    appName?: string;
  }>({
    online: true,
    checking: false,
  });

  const isHindi = language === 'hi';

  const sharedUrl = 'https://ais-pre-s2ibwrhwxfbpzje2yg7f7e-227948008805.asia-east1.run.app';
  const devUrl = 'https://ais-dev-s2ibwrhwxfbpzje2yg7f7e-227948008805.asia-east1.run.app';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const checkHealth = async () => {
    setServerStatus((prev) => ({ ...prev, checking: true }));
    try {
      const res = await fetch('/api/publish-info');
      if (res.ok) {
        const data = await res.json();
        setServerStatus({
          online: true,
          checking: false,
          port: data.port,
          appName: data.appName,
        });
      } else {
        setServerStatus({ online: false, checking: false });
      }
    } catch {
      setServerStatus({ online: false, checking: false });
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#090f1d] border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-cyan-500/20 bg-[#060a14]/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {isHindi ? 'पब्लिश एवं लाइव शेयरिंग केंद्र' : 'Publish & Live Sharing Hub'}
                </h2>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Cloud Run Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isHindi
                  ? 'सार्वजनिक लाइव वेब यूआरएल, क्लाउड रन पब्लिशिंग एवं एपीके डाउनलोड'
                  : 'Public Live Web App URLs, Cloud Run configuration & Android downloads'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white border border-slate-700/50 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-sm">
          {/* Real Cloud Run Server Status Pill */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0b1528] border border-cyan-500/20">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-cyan-400" />
              <div className="text-xs">
                <span className="text-slate-300 font-medium">
                  {isHindi ? 'सर्वर स्थिति:' : 'Server Health:'}
                </span>{' '}
                <span className="text-emerald-400 font-mono font-bold">
                  {serverStatus.online ? 'Online & Cloud Run Ready (0.0.0.0)' : 'Reconnecting...'}
                </span>
              </div>
            </div>
            <button
              onClick={checkHealth}
              disabled={serverStatus.checking}
              className="min-h-[36px] px-3 flex items-center gap-1.5 text-xs font-mono text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl border border-cyan-500/30 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${serverStatus.checking ? 'animate-spin' : ''}`} />
              <span>{isHindi ? 'जाँचें' : 'Check'}</span>
            </button>
          </div>

          {/* Primary Shareable Live URL Card */}
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-cyan-950/40 via-[#0a162c] to-[#071120] border border-cyan-400/35 shadow-[0_0_20px_rgba(0,240,255,0.15)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-cyan-300">
                  {isHindi ? 'आधिकारिक सार्वजनिक लाइव लिंक' : 'Official Public Live Web URL'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                ✓ Public Accessible
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isHindi
                ? 'यह आपका सक्रिय सार्वजनिक यूआरएल है जो किसी भी फोन, टैबलेट या कंप्यूटर पर बिना लॉगिन के तुरंत खुलता है:'
                : 'This is your permanently accessible public live URL. It works across any smartphone, tablet, or browser without special setup:'}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-[#060a14] rounded-xl border border-cyan-500/30">
              <code className="flex-1 text-xs sm:text-[13px] font-mono text-cyan-200 px-2 py-1 truncate selection:bg-cyan-500/40">
                {sharedUrl}
              </code>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopy(sharedUrl, 'shared')}
                  className="min-h-[40px] px-3.5 py-1.5 flex items-center justify-center gap-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
                >
                  {copiedKey === 'shared' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'कॉपी हो गया!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'लिंक कॉपी करें' : 'Copy Link'}</span>
                    </>
                  )}
                </button>

                <a
                  href={sharedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[40px] px-3 py-1.5 flex items-center justify-center gap-1 rounded-lg bg-slate-800 text-cyan-300 hover:text-white hover:bg-slate-700 text-xs font-mono border border-cyan-500/30 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'खोलें' : 'Open'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Cloud Run "URL galat batata hai" Explanation & Fix */}
          <div className="rounded-2xl p-4 bg-[#0d1424] border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <h4 className="text-xs font-bold font-mono uppercase tracking-wide">
                {isHindi ? 'क्लाउड रन "URL गलत बताता है" समाधान' : 'Cloud Run Publishing URL Solution'}
              </h4>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                {isHindi ? (
                  <>
                    जब आप <strong>&quot;Publish your app as a Cloud Run Service&quot;</strong> चुनते हैं, तो Google AI Studio स्वचालित रूप से क्लाउड रन कंटेनर तैयार करता है। यदि आपको URL एरर दिखता है, तो इसके सामान्य कारण और समाधान निम्नलिखित हैं:
                  </>
                ) : (
                  <>
                    When publishing via Google AI Studio as a Cloud Run Service, keep these verified points in mind:
                  </>
                )}
              </p>

              <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1">
                <li>
                  <strong className="text-white">{isHindi ? 'पूर्व-निर्मित लाइव यूआरएल पहले से सक्रिय है:' : 'Pre-deployed Live URL is already active:'}</strong>{' '}
                  {isHindi
                    ? 'ऊपर दिया गया Public URL (Shared App URL) पहले से ही Google Cloud Run पर 24/7 लाइव है।'
                    : 'The official Shared App URL above is already hosted and running live on Google Cloud Run 24/7.'}
                </li>
                <li>
                  <strong className="text-white">{isHindi ? 'होस्ट एवं पोर्ट बाइंडिंग:' : 'Host & Port Binding:'}</strong>{' '}
                  {isHindi
                    ? 'सर्वर अब process.env.PORT और 0.0.0.0 पर पूरी तरह अनुकूलित है, जिससे सभी Cloud Run हेल्थ चेक पास होते हैं।'
                    : 'Server is fully configured for Cloud Run with 0.0.0.0 host binding and process.env.PORT.'}
                </li>
                <li>
                  <strong className="text-white">{isHindi ? 'कस्टम सबडोमेन न बदलें:' : 'Do not enter custom protocol prefixes:'}</strong>{' '}
                  {isHindi
                    ? 'डायलॉग में केवल डिफ़ॉल्ट प्रोजेक्ट आईडी रखें, अतिरिक्त https:// या गलत कैरेक्टर न जोड़ें।'
                    : 'Keep the auto-assigned Cloud Run service name without manual https:// or invalid character prefixes.'}
                </li>
              </ul>
            </div>
          </div>

          {/* Android APK & Kotlin Project Download */}
          <div className="rounded-2xl p-4 bg-[#0b172a] border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-300">
                <Smartphone className="w-4 h-4" />
                <h4 className="text-xs font-bold font-mono uppercase tracking-wide">
                  {isHindi ? 'Android Studio प्रोजेक्ट एवं APK' : 'Android Studio Project & APK'}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30 font-bold">
                Kotlin Jetpack Compose
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isHindi
                ? 'यदि आप इसे वास्तविक Android फोन में APK के रूप में इंस्टॉल करना चाहते हैं, तो पूरा Android Studio प्रोजेक्ट ZIP एक क्लिक में डाउनलोड करें:'
                : 'For a native Android app release, download the ready-to-build Android Studio Kotlin project:'}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href="/api/download-android-project"
                download="deka-ai-android-studio-project.zip"
                className="min-h-[44px] px-4 py-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:opacity-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{isHindi ? 'प्रोजेक्ट ZIP डाउनलोड करें (.ZIP)' : 'Download Android Project (.ZIP)'}</span>
              </a>

              {onOpenAndroidHub && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAndroidHub();
                  }}
                  className="min-h-[44px] px-3.5 py-2 flex items-center gap-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-mono border border-slate-700 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isHindi ? 'सोर्स कोड हब देखें' : 'View Source Hub'}</span>
                </button>
              )}

              {onOpenInstallModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenInstallModal();
                  }}
                  className="min-h-[44px] px-3.5 py-2 flex items-center gap-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-mono border border-emerald-500/30 transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isHindi ? 'फ़ोन में PWA ऐप इंस्टॉल करें' : 'Install PWA on Phone'}</span>
                </button>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-[#060a14] border border-white/5 text-[11px] font-mono text-slate-400">
              <span className="text-cyan-400">$</span> ./gradlew assembleRelease{' '}
              <span className="text-slate-500"># app/build/outputs/apk/release/app-release.apk</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-cyan-500/20 bg-[#060a14]/90">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isHindi ? 'सुरक्षित एवं सत्यापित डिप्लॉयमेंट' : 'Secure & verified deployment'}</span>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] px-4 py-1.5 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
