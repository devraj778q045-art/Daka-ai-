import React, { useState, useEffect } from 'react';
import {
  X,
  Languages,
  Moon,
  Volume2,
  Trash2,
  ShieldCheck,
  Cpu,
  Battery,
  HardDrive,
  Download,
  Check,
  Sliders,
  Sparkles,
  Database,
  Smartphone,
  User,
  Phone,
  Mail,
  Clock,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { LanguageMode, ThemeMode } from '../types/deka';
import { useAuth } from '../context/AuthContext';
import {
  getStorageMetrics,
  exportLocalChatBackup,
  StorageMetrics,
} from '../services/localChatDB';
import { BatteryUsageChart } from './BatteryUsageChart';
import {
  DeviceBatteryInfo,
  BatteryUsagePoint,
  UserProfileInfo,
} from '../utils/useDeviceStatus';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageMode;
  onLanguageChange: (lang: LanguageMode) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  ttsEnabled: boolean;
  onTtsEnabledChange: (enabled: boolean) => void;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  batterySaver: boolean;
  onBatterySaverChange: (enabled: boolean) => void;
  onClearHistory: () => void;
  totalChatsCount: number;
  onOpenAuthModal: (mode?: 'login' | 'signup' | 'reset') => void;
  onSyncNow?: () => void;
  isSyncing?: boolean;
  onOpenInstallModal?: () => void;

  // Live User Profile
  userProfile?: UserProfileInfo;
  onUpdateUserProfile?: (updates: Partial<UserProfileInfo>) => void;

  // Live Battery Status & History
  battery?: DeviceBatteryInfo;
  batteryHistory?: BatteryUsagePoint[];
  onSimulateDrain?: (pct?: number) => void;
  onSimulateCharge?: (pct?: number) => void;
  onResetBatteryHistory?: () => void;
  onSetManualBatteryLevel?: (level: number) => void;

  // 12h / 24h Time Format Settings
  is24Hour?: boolean;
  onToggleTimeFormat?: (is24: boolean) => void;
  statusDateTimeString?: string;
  timeString?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  ttsEnabled,
  onTtsEnabledChange,
  speechRate,
  onSpeechRateChange,
  batterySaver,
  onBatterySaverChange,
  onClearHistory,
  totalChatsCount,
  onOpenAuthModal,
  onSyncNow,
  isSyncing = false,
  onOpenInstallModal,

  userProfile,
  onUpdateUserProfile,

  battery = {
    level: 88,
    charging: false,
    chargingTime: 0,
    dischargingTime: 0,
    isSupported: false,
  },
  batteryHistory = [],
  onSimulateDrain,
  onSimulateCharge,
  onResetBatteryHistory,
  onSetManualBatteryLevel,

  is24Hour = false,
  onToggleTimeFormat,
  statusDateTimeString,
  timeString,
}) => {
  const { currentUser, logOut, isOnline } = useAuth();
  const [confirmClear, setConfirmClear] = useState(false);
  const [metrics, setMetrics] = useState<StorageMetrics | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Profile Form State
  const [editName, setEditName] = useState(userProfile?.name || 'देवराज (Devraj)');
  const [editPhone, setEditPhone] = useState(userProfile?.phoneNumber || '+91 98765 43210');
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.name);
      setEditPhone(userProfile.phoneNumber);
    }
  }, [userProfile]);

  useEffect(() => {
    if (isOpen) {
      getStorageMetrics().then(setMetrics).catch(console.warn);
    }
  }, [isOpen, totalChatsCount]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        name: editName.trim() || 'देवराज (Devraj)',
        phoneNumber: editPhone.trim() || '+91 98765 43210',
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    }
  };

  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      const json = await exportLocalChatBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deka_ai_chat_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (e) {
      console.warn('Backup export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#080c14] border border-cyan-500/30 shadow-[0_0_60px_rgba(0,240,255,0.25)] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-cyan-500/15 bg-[#0b1528] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              {language === 'hi' ? 'सेटिंग्स और प्राथमिकताएं' : 'DEKA AI Settings & Preferences'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* User Profile & Mobile Number Editing Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0b1528] via-[#0d1a33] to-cyan-950/20 border border-cyan-500/30 space-y-4 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    {language === 'hi' ? 'यूज़र प्रोफ़ाइल और मोबाइल नंबर' : 'User Profile & Mobile Identity'}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-mono">
                      DEKA AI Memory
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'hi'
                      ? 'AI सहायक को आपका नाम और मोबाइल नंबर याद रहता है और वह सीधे उत्तर देता है।'
                      : 'DEKA AI identifies you by this name & phone number in chat and voice responses.'}
                  </p>
                </div>
              </div>

              {currentUser ? (
                <button
                  onClick={() => logOut()}
                  className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors flex-shrink-0"
                >
                  {language === 'hi' ? 'लॉग आउट' : 'Sign Out'}
                </button>
              ) : (
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] flex-shrink-0"
                >
                  {language === 'hi' ? 'साइन इन करें' : 'Sign In'}
                </button>
              )}
            </div>

            {/* Editable Profile Form */}
            <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 border-t border-cyan-500/15">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* User Name Field */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    {language === 'hi' ? 'यूज़र का नाम (User Name)' : 'User Name'}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="देवराज (Devraj)"
                    className="w-full px-3 py-2 rounded-xl bg-[#060a12] border border-cyan-500/25 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                {/* Mobile Number Field */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    {language === 'hi' ? 'मोबाइल नंबर (Phone Number)' : 'Mobile Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-[#060a12] border border-cyan-500/25 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              {/* Email display & sync status */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-cyan-400" />
                  {currentUser ? currentUser.email : userProfile?.email || 'devraj778q045@gmail.com'}
                </span>

                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                >
                  {profileSaved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      <span>{language === 'hi' ? 'सहेजा गया!' : 'Saved!'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'Save Profile'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {currentUser && onSyncNow && (
              <div className="pt-2 border-t border-cyan-500/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  {isOnline ? 'Firebase Cloud Connected' : 'Offline Mode'}
                  {batterySaver && (
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 font-medium">
                      Auto-sync Throttled
                    </span>
                  )}
                </span>
                <button
                  onClick={onSyncNow}
                  disabled={isSyncing}
                  className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] flex items-center gap-1 disabled:opacity-50"
                >
                  {isSyncing ? 'Syncing...' : 'Sync History Now ↻'}
                </button>
              </div>
            )}
          </div>

          {/* Time & Clock Format Settings (12h vs 24h) */}
          <div className="p-4 rounded-2xl bg-[#0b1528] border border-cyan-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    {language === 'hi' ? 'घड़ी और समय प्रारूप (Time Format)' : 'Date & Clock Format'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'hi'
                      ? 'स्टेटस बार और सिस्टम समय के लिए 12-घंटे (AM/PM) या 24-घंटे का चुनाव करें।'
                      : 'Toggle between 12-hour (AM/PM) and 24-hour time format for status bar.'}
                  </p>
                </div>
              </div>

              {/* Status Bar Clock Preview */}
              <div className="px-3 py-1 rounded-xl bg-[#060a12] border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold shadow-[0_0_10px_rgba(0,240,255,0.15)] hidden sm:block">
                {statusDateTimeString || timeString || '12:00 PM'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-500/10">
              <button
                type="button"
                onClick={() => onToggleTimeFormat?.(false)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  !is24Hour
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : 'bg-[#080d1a] border-cyan-500/15 text-slate-400 hover:text-white hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">12-Hour Format</span>
                  <span className="text-[10px] font-mono text-cyan-400">AM / PM</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">e.g. 02:45 PM</p>
              </button>

              <button
                type="button"
                onClick={() => onToggleTimeFormat?.(true)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  is24Hour
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : 'bg-[#080d1a] border-cyan-500/15 text-slate-400 hover:text-white hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">24-Hour Format</span>
                  <span className="text-[10px] font-mono text-cyan-400">00:00 - 23:59</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">e.g. 14:45</p>
              </button>
            </div>
          </div>

          {/* Battery Saver Mode Toggle Card */}
          <div
            className={`p-4 rounded-2xl border transition-all duration-300 ${
              batterySaver
                ? 'bg-gradient-to-r from-amber-950/40 via-[#0b1528] to-[#080c14] border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.18)]'
                : 'bg-[#0b1528] border-cyan-500/15'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-2xl border transition-all ${
                    batterySaver
                      ? 'bg-amber-500/20 text-amber-400 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                  }`}
                >
                  <Battery className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white tracking-wide">
                      {language === 'hi' ? 'बैटरी सेवर (Battery Saver)' : 'Battery Saver Mode'}
                    </h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border transition-colors ${
                        batterySaver
                          ? 'bg-amber-500/25 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {batterySaver
                        ? (language === 'hi' ? 'सक्रिय (Active)' : 'Active (Eco)')
                        : (language === 'hi' ? 'बंद (Off)' : 'Disabled')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {language === 'hi'
                      ? 'बैकग्राउंड क्लाउड सिंकिंग सीमित करता है और बैटरी व जीपीयू बचाने के लिए एनिमेशन व चमक को हल्का (dim) करता है।'
                      : 'Limits background cloud syncing and dims animations & glows to conserve battery and GPU power.'}
                  </p>
                </div>
              </div>

              {/* iOS/Android Style Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={batterySaver}
                onClick={() => onBatterySaverChange(!batterySaver)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  batterySaver ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'bg-slate-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    batterySaver ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Feature impact status pills */}
            <div className="mt-3.5 pt-3 border-t border-cyan-500/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div
                className={`p-2 rounded-xl flex items-center gap-2 transition-colors ${
                  batterySaver
                    ? 'bg-amber-950/30 text-amber-200 border border-amber-500/25'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    batterySaver ? 'bg-amber-400' : 'bg-slate-500'
                  }`}
                />
                <div>
                  <span className="font-semibold">
                    {language === 'hi' ? 'बैकग्राउंड सिंक: ' : 'Background Sync: '}
                  </span>
                  <span>
                    {batterySaver
                      ? (language === 'hi' ? 'सीमित (मांग पर)' : 'Limited (On Demand)')
                      : (language === 'hi' ? 'स्वचालित' : 'Automatic')}
                  </span>
                </div>
              </div>

              <div
                className={`p-2 rounded-xl flex items-center gap-2 transition-colors ${
                  batterySaver
                    ? 'bg-amber-950/30 text-amber-200 border border-amber-500/25'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    batterySaver ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                />
                <div>
                  <span className="font-semibold">
                    {language === 'hi' ? 'एनिमेशन व चमक: ' : 'Visual Effects: '}
                  </span>
                  <span>
                    {batterySaver
                      ? (language === 'hi' ? 'हल्का/15 FPS' : 'Dimmed (15 FPS Eco)')
                      : (language === 'hi' ? 'पूर्ण 60 FPS' : 'Full 60 FPS + Glow')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* NEW SECTION: Battery Usage Trends Visualizer Chart */}
          <BatteryUsageChart
            battery={battery}
            batteryHistory={batteryHistory}
            language={language}
            batterySaver={batterySaver}
            is24Hour={is24Hour}
            onSimulateDrain={onSimulateDrain}
            onSimulateCharge={onSimulateCharge}
            onResetHistory={onResetBatteryHistory}
            onSetManualLevel={onSetManualBatteryLevel}
          />

          {/* Mobile Install Guide Card */}
          {onOpenInstallModal && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#0b1528] to-blue-950/30 border border-cyan-500/30 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(0,240,255,0.12)]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex-shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{language === 'hi' ? 'मोबाइल में ऐप इंस्टॉल करें' : 'Install on Mobile'}</span>
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono border border-cyan-400/30">
                      PWA + APK
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {language === 'hi'
                      ? 'Chrome / Safari से 1-क्लिक में या नेटिव Android APK से फ़ोन में इंस्टॉल करें।'
                      : 'Install in 1-click via Chrome / Safari or download native Android APK.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInstallModal();
                }}
                className="flex-shrink-0 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,240,255,0.4)] hover:scale-105 active:scale-95"
              >
                <span>{language === 'hi' ? 'गाइड देखें' : 'Install'}</span>
              </button>
            </div>
          )}

          {/* Language Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Languages className="w-4 h-4" />
              {language === 'hi' ? 'भाषा चयन (Language)' : 'Language Selection'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'auto', label: 'Auto (Hinglish)', desc: 'Hindi + English' },
                { id: 'hi', label: 'हिंदी (Hindi)', desc: 'प्राथमिक हिंदी' },
                { id: 'en', label: 'English', desc: 'Primary English' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onLanguageChange(item.id as LanguageMode)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    language === item.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                      : 'bg-[#0b1528] border-cyan-500/15 text-slate-400 hover:text-white hover:border-cyan-500/30'
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Mode */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Moon className="w-4 h-4" />
              {language === 'hi' ? 'थीम शैली (Theme)' : 'Theme Palette'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'futuristic-dark', label: 'Cyber Cyan', bg: 'bg-[#080c14]' },
                { id: 'deep-navy', label: 'Deep Navy', bg: 'bg-[#0b1528]' },
                { id: 'amoled-black', label: 'AMOLED Black', bg: 'bg-black' },
                { id: 'light', label: 'Clean Light', bg: 'bg-slate-100 text-slate-900' },
              ].map((th) => (
                <button
                  key={th.id}
                  onClick={() => onThemeChange(th.id as ThemeMode)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    theme === th.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                      : 'bg-[#0b1528] border-cyan-500/15 text-slate-400 hover:text-white hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-full border border-cyan-400/50 ${th.bg}`} />
                    <p className="text-xs font-bold truncate">{th.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice & Speech Controls */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#0b1528] border border-cyan-500/15">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  {language === 'hi' ? 'उत्तर बोलकर सुनाएं (TTS)' : 'Voice Responses (TTS)'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Automatically speak AI replies in Hindi or English
                </p>
              </div>
              <input
                type="checkbox"
                checked={ttsEnabled}
                onChange={(e) => onTtsEnabledChange(e.target.checked)}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
            </div>

            {ttsEnabled && (
              <div className="pt-2 border-t border-cyan-500/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Speech Speed:</span>
                  <span className="font-mono text-cyan-400">{speechRate.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => onSpeechRateChange(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* AI Provider Info */}
          <div className="p-4 rounded-2xl bg-[#0b1528] border border-cyan-500/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" /> Real AI Backend Connection
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Powered by <strong>Google Gemini</strong> through secure server-side proxy routes. API credentials remain strictly encrypted on the server.
            </p>
          </div>

          {/* Privacy & Permissions Dashboard */}
          <div className="p-4 rounded-2xl bg-[#0b1528] border border-cyan-500/15 space-y-2.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {language === 'hi' ? 'गोपनीयता और अनुमतियां' : 'Privacy & Permissions Shield'}
            </span>
            <div className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <strong>Microphone:</strong> Granted on user action only. No passive eavesdropping.
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <strong>App Intents:</strong> User confirms before opening any third-party app.
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <strong>Battery Optimization:</strong> Android wake-phrase works within OS power limits.
              </p>
            </div>
          </div>

          {/* Local-First Offline Storage (IndexedDB) Dashboard */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0b1528] via-[#09182d] to-[#080c14] border border-cyan-500/25 space-y-3 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white tracking-wide">
                      {language === 'hi' ? 'लोकल-फर्स्ट ऑफलाइन स्टोरेज (IndexedDB)' : 'Local-First Offline Storage'}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {metrics?.isIndexedDBSupported ? 'IndexedDB Active' : 'Cache Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {language === 'hi'
                      ? 'आपकी पूरी चैट हिस्ट्री ब्राउज़र के IndexedDB डेटाबेस में सुरक्षित रहती है। पूरी तरह ऑफलाइन होने पर भी सभी मैसेज तुरंत खुलते हैं।'
                      : 'Your complete chat history is stored locally using IndexedDB. All conversations remain 100% accessible even when completely offline.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Storage metrics breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-cyan-500/10 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[10px] uppercase font-mono">
                  {language === 'hi' ? 'लोकल सेशंस' : 'Stored Chats'}
                </span>
                <span className="text-cyan-300 font-bold text-xs mt-0.5">
                  {metrics?.sessionCount ?? 1} {language === 'hi' ? 'वार्तालाप' : 'sessions'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
                <span className="text-slate-400 text-[10px] uppercase font-mono">
                  {language === 'hi' ? 'लोकल मैसेज' : 'Cached Messages'}
                </span>
                <span className="text-cyan-300 font-bold text-xs mt-0.5">
                  {metrics?.messageCount ?? totalChatsCount} {language === 'hi' ? 'संदेश' : 'messages'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col col-span-2 sm:col-span-1">
                <span className="text-slate-400 text-[10px] uppercase font-mono">
                  {language === 'hi' ? 'ऑफलाइन उपलब्धता' : 'Offline Availability'}
                </span>
                <span className="text-emerald-400 font-bold text-xs mt-0.5 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  100% Offline Ready
                </span>
              </div>
            </div>

            {/* Offline Export Backup button */}
            <div className="pt-2 border-t border-cyan-500/10 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                {language === 'hi' ? 'ऑफलाइन बैकअप एक्सपोर्ट' : 'Export Offline Chat Backup'}
              </span>
              <button
                onClick={handleExportBackup}
                disabled={isExporting}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[11px] font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {exportSuccess ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Exported!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3" />
                    <span>{isExporting ? 'Exporting...' : 'Export JSON ⤓'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Chat History Management */}
          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  {language === 'hi' ? 'चैट इतिहास प्रबंधन' : 'Chat History Storage'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Stored locally on this device ({totalChatsCount} messages)
                </p>
              </div>
            </div>

            {confirmClear ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
                >
                  Yes, Delete All
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-medium border border-red-500/30 transition-colors"
              >
                Clear All Conversations
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
