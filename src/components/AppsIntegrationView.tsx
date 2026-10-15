import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Youtube,
  Mail,
  MapPin,
  Camera,
  Globe,
  Music,
  PhoneCall,
  FileText,
  Upload,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Battery,
  Smartphone,
  Vibrate,
  FileSearch,
  Sparkles,
  Search,
  ShoppingBag,
  Film,
  Send,
  Download,
  Calculator,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';
import { LanguageMode } from '../types/deka';
import {
  UNIVERSAL_APPS,
  AppDefinition,
  executeAppLaunch,
  createDynamicAppTarget,
} from '../utils/appLauncher';

interface AppsIntegrationViewProps {
  language: LanguageMode;
  onAnalyzeDocument: (file: File) => void;
  isAnalyzingDoc: boolean;
  docSummary: string | null;
  onOpenMathLab?: () => void;
}

export const AppsIntegrationView: React.FC<AppsIntegrationViewProps> = ({
  language,
  onAnalyzeDocument,
  isAnalyzingDoc,
  docSummary,
  onOpenMathLab,
}) => {
  // App Search State
  const [selectedAppId, setSelectedAppId] = useState<string>('youtube');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customAppName, setCustomAppName] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  // System status
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [calcInput, setCalcInput] = useState<string>('0');
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryCharging, setBatteryCharging] = useState<boolean>(false);
  const [vibrateStatus, setVibrateStatus] = useState<string | null>(null);
  const [pickedFileName, setPickedFileName] = useState<string | null>(null);
  const [launchStatus, setLaunchStatus] = useState<{
    msg: string;
    url?: string;
  } | null>(null);

  // In-App Web Viewer Modal
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  // Read Battery API if supported
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setBatteryCharging(battery.charging);
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setBatteryCharging(battery.charging);
        });
      });
    }
  }, []);

  const selectedApp =
    UNIVERSAL_APPS.find((a) => a.id === selectedAppId) || UNIVERSAL_APPS[0];

  const handleLaunchSearch = async (
    appToLaunch: AppDefinition = selectedApp,
    queryToSearch: string = searchQuery
  ) => {
    if (appToLaunch.id === 'camera') {
      startCamera();
      return;
    }
    if (appToLaunch.id === 'calculator') {
      setShowCalculator(true);
      return;
    }

    const res = await executeAppLaunch(appToLaunch, queryToSearch);

    setLaunchStatus({
      msg:
        language === 'hi'
          ? `🚀 ${appToLaunch.nameHi || appToLaunch.name} खोला जा रहा है...`
          : `🚀 Launching ${appToLaunch.name}...`,
      url: res.targetUrl,
    });

    setTimeout(() => {
      setLaunchStatus(null);
    }, 4500);
  };

  const handleOpenCustomApp = () => {
    if (!customAppName.trim()) return;
    const dynamicApp = createDynamicAppTarget(customAppName.trim(), searchQuery);
    setShowCustomModal(false);
    handleLaunchSearch(dynamicApp, searchQuery);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      setCameraStream(stream);
      setCameraActive(true);
    } catch {
      setLaunchStatus({
        msg:
          language === 'hi'
            ? 'कैमरा अनुमतियां उपलब्ध नहीं हैं या अनुमति अस्वीकृत हुई।'
            : 'Camera permission denied or camera device unavailable.',
      });
      setTimeout(() => setLaunchStatus(null), 3500);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const handleVibrateTest = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]);
      setVibrateStatus('Haptic pulse executed successfully!');
      setTimeout(() => setVibrateStatus(null), 3000);
    } else {
      setVibrateStatus('Vibration simulated on device.');
      setTimeout(() => setVibrateStatus(null), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPickedFileName(file.name);
      onAnalyzeDocument(file);
    }
  };

  // Calculator button handler
  const handleCalcBtn = (val: string) => {
    if (val === 'C') {
      setCalcInput('0');
    } else if (val === '=') {
      try {
        // Safe evaluation of basic math expressions
        const sanitized = calcInput.replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${sanitized})`)();
        setCalcInput(String(result));
      } catch {
        setCalcInput('Error');
      }
    } else {
      setCalcInput((prev) => (prev === '0' || prev === 'Error' ? val : prev + val));
    }
  };

  const filteredApps =
    activeCategory === 'all'
      ? UNIVERSAL_APPS
      : UNIVERSAL_APPS.filter((a) => a.category === activeCategory);

  const getAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'Youtube':
        return <Youtube className="w-5 h-5" />;
      case 'MessageCircle':
        return <MessageCircle className="w-5 h-5" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5" />;
      case 'Globe':
        return <Globe className="w-5 h-5" />;
      case 'Music':
        return <Music className="w-5 h-5" />;
      case 'Download':
        return <Download className="w-5 h-5" />;
      case 'Camera':
        return <Camera className="w-5 h-5" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5" />;
      case 'Mail':
        return <Mail className="w-5 h-5" />;
      case 'Film':
        return <Film className="w-5 h-5" />;
      case 'Send':
        return <Send className="w-5 h-5" />;
      case 'PhoneCall':
        return <PhoneCall className="w-5 h-5" />;
      case 'Calculator':
        return <Calculator className="w-5 h-5" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 bg-[#080c14] space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2 glow-text-cyan">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              {language === 'hi' ? 'एंड्रॉइड ऐप और इन-ऐप सर्च हब' : 'Android Apps & In-App Search Engine'}
            </h2>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono font-bold px-2 py-0.5 rounded-full border border-cyan-400/30">
              UNIVERSAL INTENT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'hi'
              ? 'कोई भी ऐप खोलें और उसमें सीधी खोज करें (YouTube, WhatsApp, Maps, Spotify, Instagram, आदि)'
              : 'Launch ANY installed application and search inside it instantly with direct Android deep links.'}
          </p>
        </div>

        {/* Battery & System Status Pill */}
        <div className="flex items-center gap-2 bg-[#0b1528] px-3.5 py-1.5 rounded-2xl border border-cyan-500/20 text-xs">
          <Battery
            className={`w-4 h-4 ${batteryCharging ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}`}
          />
          <span className="text-slate-300 font-medium">
            {batteryLevel !== null ? `${batteryLevel}%` : 'Android Intent Ready'}
          </span>
          {batteryCharging && <span className="text-[10px] text-emerald-400">(Charging)</span>}
        </div>
      </div>

      {/* Launch Notification Toast */}
      {launchStatus && (
        <div className="p-3.5 bg-cyan-950/70 border border-cyan-400/50 rounded-2xl flex items-center justify-between shadow-[0_0_25px_rgba(0,240,255,0.3)] animate-in fade-in">
          <div className="flex items-center gap-2 text-xs text-cyan-200 font-semibold">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>{launchStatus.msg}</span>
          </div>
          {launchStatus.url && (
            <a
              href={launchStatus.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl transition-all shadow-[0_0_10px_rgba(0,240,255,0.4)]"
            >
              <span>{language === 'hi' ? 'सीधा खोलें' : 'Open Link'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* 🚀 HERO SECTION: UNIVERSAL IN-APP SEARCH BAR */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0c1933] via-[#091326] to-[#060b17] border-2 border-cyan-400/40 p-5 sm:p-6 shadow-[0_0_35px_rgba(0,240,255,0.2)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/40">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-wide">
                {language === 'hi'
                  ? 'किसी भी ऐप में कुछ भी सर्च करें (Universal In-App Search)'
                  : 'Universal In-App Search & Direct App Launch'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'hi'
                  ? 'ऐप चुनें, जो भी सर्च करना है लिखें और एक क्लिक में खोलें'
                  : 'Select any app, type any query, and launch directly into search results.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/25 text-xs font-semibold transition-all"
            title="Open any other app not in the list"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'hi' ? '+ कोई भी कस्टम ऐप' : '+ Any Custom App'}</span>
          </button>
        </div>

        {/* Selected App Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 mb-3 scrollbar-none">
          {UNIVERSAL_APPS.slice(0, 8).map((app) => {
            const isSelected = app.id === selectedAppId;
            return (
              <button
                key={app.id}
                onClick={() => setSelectedAppId(app.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-[#080c14] text-slate-300 border-cyan-500/20 hover:border-cyan-400/40'
                }`}
              >
                <span style={{ color: isSelected ? '#000' : app.color }}>
                  {getAppIcon(app.iconName)}
                </span>
                <span>{language === 'hi' ? app.nameHi : app.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Search Input & Launch Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLaunchSearch();
              }}
              placeholder={
                language === 'hi'
                  ? selectedApp.searchPlaceholderHi
                  : selectedApp.searchPlaceholder
              }
              className="w-full bg-[#080c14] text-white text-sm placeholder-slate-500 border border-cyan-500/30 rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:border-cyan-400 shadow-inner"
            />
            <div className="absolute left-3.5 top-3.5 text-cyan-400">
              <Search className="w-4 h-4" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Launch & Search Button */}
            <button
              onClick={() => handleLaunchSearch()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(0,240,255,0.45)] hover:scale-[1.02] active:scale-95"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>
                {searchQuery.trim()
                  ? language === 'hi'
                    ? `${selectedApp.nameHi || selectedApp.name} में सर्च करें`
                    : `Search in ${selectedApp.name}`
                  : language === 'hi'
                  ? `${selectedApp.nameHi || selectedApp.name} खोलें`
                  : `Open ${selectedApp.name}`}
              </span>
            </button>

            {/* In-App Preview Option */}
            <button
              onClick={() => {
                const url = searchQuery.trim()
                  ? selectedApp.getSearchUrl(searchQuery.trim())
                  : selectedApp.getDefaultUrl();
                setPreviewTitle(`${selectedApp.name} — ${searchQuery || 'Home'}`);
                setPreviewUrl(url);
              }}
              className="p-3 rounded-2xl bg-[#080c14] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all"
              title="Preview in DEKA AI window"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Search Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-medium">
            {language === 'hi' ? 'सुझाव:' : 'Quick search ideas:'}
          </span>
          {(selectedApp.id === 'youtube'
            ? ['Arijit Singh songs', 'Android Jetpack Compose tutorial', 'Latest tech news 2026', 'Funny comedy reels']
            : selectedApp.id === 'maps'
            ? ['Taj Mahal Agra', 'Restaurants near me', 'Petrol pump nearby', 'Delhi to Mumbai route']
            : selectedApp.id === 'spotify'
            ? ['Top 50 Hindi songs', 'Shershaah songs', 'Chill acoustic beats', 'Motivational podcasts']
            : selectedApp.id === 'playstore'
            ? ['BGMI Battlegrounds', 'WhatsApp Messenger', 'Spotify Music', 'ChatGPT AI']
            : selectedApp.id === 'amazon'
            ? ['Samsung Galaxy Phone', 'Wireless Earbuds', 'Smart Watch', 'Fast Charger']
            : ['Google AI Studio news', 'ChatGPT update', 'Weather today', 'World cup cricket']
          ).map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(chip);
                handleLaunchSearch(selectedApp, chip);
              }}
              className="px-2.5 py-1 rounded-xl bg-cyan-950/40 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-[11px] transition-all"
            >
              + {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: language === 'hi' ? 'सभी ऐप्स' : 'All Apps' },
          { id: 'media', label: language === 'hi' ? 'मीडिया व वीडियो' : 'Media & Video' },
          { id: 'social', label: language === 'hi' ? 'सोशल व चैट' : 'Social & Chat' },
          { id: 'utility', label: language === 'hi' ? 'उपयोगिता व वेब' : 'Utility & Web' },
          { id: 'shopping', label: language === 'hi' ? 'शॉपिंग व फूड' : 'Shopping & Food' },
          { id: 'system', label: language === 'hi' ? 'सिस्टम व टूल्स' : 'System Tools' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeCategory === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                : 'bg-[#0b1528] text-slate-400 border-cyan-500/10 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Comprehensive Grid of Installed Apps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold uppercase tracking-wider">
          <span>
            {language === 'hi'
              ? `समर्थित ऐप्स (${filteredApps.length})`
              : `Supported Installed Apps (${filteredApps.length})`}
          </span>
          <span className="text-[10px] text-cyan-400">1-Tap Intent Launcher</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="p-4 rounded-2xl bg-[#0b1528] border border-cyan-500/15 hover:border-cyan-400/50 hover:bg-[#0e1d38] transition-all flex flex-col justify-between group shadow-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
                    style={{ backgroundColor: `${app.color}25`, color: app.color }}
                  >
                    {getAppIcon(app.iconName)}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#080c14] text-slate-400 border border-slate-800">
                    {app.category}
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-bold text-white">
                    {language === 'hi' ? app.nameHi : app.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                    {language === 'hi' ? app.descriptionHi : app.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons for this app */}
              <div className="mt-4 pt-3 border-t border-cyan-500/10 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedAppId(app.id);
                    handleLaunchSearch(app, '');
                  }}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-black text-xs font-bold transition-all border border-cyan-400/30 flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'ऐप खोलें' : 'Open App'}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedAppId(app.id);
                    // Focus on search bar at top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="py-1.5 px-2.5 rounded-xl bg-[#080c14] hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-medium border border-cyan-500/15 transition-all"
                  title="Search inside this app"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Hardware Toggles (Camera lens, Dialer, Haptics) */}
      <div className="rounded-3xl bg-[#0b1528] border border-cyan-500/20 p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>{language === 'hi' ? 'सिस्टम हार्डवेयर त्वरित नियंत्रण' : 'System Hardware Controls'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={startCamera}
            className="p-4 rounded-2xl bg-[#080c14] border border-cyan-500/20 hover:border-cyan-400/50 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Camera Optical Lens</p>
                <p className="text-[11px] text-slate-400">Live preview & capture</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </button>

          <button
            onClick={handleVibrateTest}
            className="p-4 rounded-2xl bg-[#080c14] border border-cyan-500/20 hover:border-cyan-400/50 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <Vibrate className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Haptic Vibration Motor</p>
                <p className="text-[11px] text-slate-400">Pulse feedback test</p>
              </div>
            </div>
            <Zap className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </button>

          <button
            onClick={() => (window.location.href = 'tel:')}
            className="p-4 rounded-2xl bg-[#080c14] border border-cyan-500/20 hover:border-cyan-400/50 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Android Phone Dialer</p>
                <p className="text-[11px] text-slate-400">Launch direct dialer</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </button>

          <button
            onClick={() => onOpenMathLab?.()}
            className="p-4 rounded-2xl bg-[#080c14] border border-amber-500/30 hover:border-amber-400 text-left transition-all flex items-center justify-between group shadow-[0_0_15px_rgba(245,158,11,0.15)]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-300">
                  {language === 'hi' ? 'गणित लैब व क्विज़' : 'Math Lab & Quiz'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {language === 'hi' ? 'सवाल हल करें व गणना' : 'Solve math & calculate'}
                </p>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {vibrateStatus && (
          <div className="p-2.5 text-center text-xs text-purple-300 bg-purple-950/40 rounded-xl border border-purple-500/30">
            {vibrateStatus}
          </div>
        )}
      </div>

      {/* Document Picker & AI Analysis Section */}
      <div className="rounded-3xl bg-[#0b1528] border border-cyan-500/20 p-5 shadow-[0_0_25px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {language === 'hi' ? 'एंड्रॉइड दस्तावेज़ पिकर और AI सारांश' : 'Android Document Picker & AI Analyzer'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'PDF, Text या कोड फाइल चुनें — DEKA AI इसे पढ़कर सारांश देगा'
                  : 'Select any document (PDF, TXT, MD, Code) to analyze with DEKA AI'}
              </p>
            </div>
          </div>

          <label className="cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <Upload className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'दस्तावेज़ चुनें' : 'Choose Document'}</span>
            <input
              type="file"
              accept=".txt,.md,.pdf,.json,.csv,.js,.ts,.kt"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {pickedFileName && (
          <div className="p-3 bg-cyan-950/30 rounded-2xl border border-cyan-500/25 flex items-center justify-between text-xs text-cyan-200 my-3">
            <span className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              Selected: <strong>{pickedFileName}</strong>
            </span>
            {isAnalyzingDoc ? (
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold animate-pulse">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Analyzing with Gemini...
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
              </span>
            )}
          </div>
        )}

        {docSummary && (
          <div className="mt-3 p-4 bg-[#080c14] rounded-2xl border border-cyan-500/30 text-xs sm:text-sm text-slate-200 max-h-56 overflow-y-auto leading-relaxed whitespace-pre-wrap">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-2">
              <Sparkles className="w-4 h-4" /> DEKA Document Insights:
            </div>
            {docSummary}
          </div>
        )}
      </div>

      {/* 📱 MODAL: Custom Any App Launcher */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0b1528] border-2 border-cyan-400/40 p-6 space-y-4 shadow-[0_0_50px_rgba(0,240,255,0.3)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {language === 'hi' ? 'कोई भी ऐप खोलें और सर्च करें' : 'Launch Any Custom App'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'hi' ? 'दुनिया का कोई भी ऐप नाम दर्ज करें' : 'Open any Android app on your phone'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">
                  {language === 'hi' ? 'ऐप का नाम (उदा. Duolingo, BGMI, Paytm, Canva)' : 'App Name (e.g. Duolingo, BGMI, Paytm)'}
                </label>
                <input
                  type="text"
                  value={customAppName}
                  onChange={(e) => setCustomAppName(e.target.value)}
                  placeholder="App name..."
                  className="w-full bg-[#080c14] border border-cyan-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">
                  {language === 'hi' ? 'सर्च क्वेरी (वैकल्पिक)' : 'Search Query (Optional)'}
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What to search inside this app..."
                  className="w-full bg-[#080c14] border border-cyan-500/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-cyan-500/15">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={handleOpenCustomApp}
                disabled={!customAppName.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              >
                {language === 'hi' ? 'ऐप खोलें' : 'Launch App'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🧮 MODAL: In-App Scientific Calculator */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xs rounded-3xl bg-[#080c14] border-2 border-cyan-400/50 p-5 space-y-4 shadow-[0_0_40px_rgba(0,240,255,0.35)]">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-cyan-400" /> DEKA Calculator
              </h4>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>

            {/* Calc Display */}
            <div className="p-4 rounded-2xl bg-[#0b1528] border border-cyan-500/30 text-right font-mono text-2xl font-bold text-cyan-300 tracking-wider overflow-x-auto">
              {calcInput}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2 text-sm font-bold">
              {['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '%', '='].map(
                (btn) => (
                  <button
                    key={btn}
                    onClick={() => handleCalcBtn(btn)}
                    className={`p-3 rounded-xl transition-all ${
                      btn === '='
                        ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.5)] font-black'
                        : btn === 'C'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : ['/', '*', '-', '+'].includes(btn)
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                        : 'bg-[#0f1d38] text-white hover:bg-cyan-950/50'
                    }`}
                  >
                    {btn}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📷 MODAL: Camera Live Modal */}
      {cameraActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#080c14] border border-cyan-500/40 p-5 space-y-4 shadow-[0_0_40px_rgba(0,240,255,0.3)]">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" /> Camera Live View
              </h4>
              <button
                onClick={stopCamera}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-cyan-500/30">
              <video
                autoPlay
                playsInline
                ref={(vid) => {
                  if (vid && cameraStream) vid.srcObject = cameraStream;
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-cyan-500/30 pointer-events-none rounded-2xl" />
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Camera intent connected. In Android APK, this invokes{' '}
              <code className="text-cyan-300">MediaStore.ACTION_IMAGE_CAPTURE</code>.
            </p>
          </div>
        </div>
      )}

      {/* 🌐 MODAL: In-App Web Search Preview */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-4xl h-[85vh] rounded-3xl bg-[#080c14] border-2 border-cyan-400/50 flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.3)]">
            <div className="p-4 bg-[#0b1528] border-b border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="text-xs font-bold text-white truncate">{previewTitle}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1 bg-cyan-500 text-black text-xs font-bold rounded-xl"
                >
                  <span>External Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white relative">
              <iframe
                src={previewUrl}
                title={previewTitle}
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
