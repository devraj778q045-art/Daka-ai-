import React, { useState, useEffect, useCallback } from 'react';
import {
  Home,
  MessageSquare,
  Mic,
  Smartphone,
  FolderArchive,
  Settings,
  Sparkles,
  Wifi,
  WifiOff,
  Battery,
  Zap,
  Clock,
  Maximize2,
  Minimize2,
  Languages,
  User as UserIcon,
  Cloud,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { useDeviceStatus } from './utils/useDeviceStatus';
import { HomeScreen } from './components/HomeScreen';
import { ChatView } from './components/ChatView';
import { AppsIntegrationView } from './components/AppsIntegrationView';
import { AndroidProjectHub } from './components/AndroidProjectHub';
import { SettingsModal } from './components/SettingsModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { AuthModal } from './components/AuthModal';
import { InstallAppModal } from './components/InstallAppModal';
import { MathLabModal } from './components/MathLabModal';
import { PublishModal } from './components/PublishModal';
import {
  ChatMessage,
  ChatSession,
  OrbState,
  LanguageMode,
  ThemeMode,
} from './types/deka';
import { DekaTTS } from './utils/speech';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  syncChatSession,
  loadUserChatSessions,
  removeChatSession,
  clearAllChatSessions,
} from './services/firebase';
import {
  executeAppLaunch,
  UNIVERSAL_APPS,
  createDynamicAppTarget,
  parseAppAndSearchQuery,
} from './utils/appLauncher';
import {
  saveLocalSession,
  saveAllLocalSessions,
  loadAllLocalSessions,
  deleteLocalSession,
  clearAllLocalSessions,
  queueOfflineSyncAction,
  flushOfflineSyncQueue,
} from './services/localChatDB';

function DekaAppContent() {
  const { currentUser, userProfile: authProfile, updateUserPreferences, updateUserProfileDetails, isOnline } = useAuth();

  // Live Device Status (Battery, Time, Date, History, User Profile)
  const {
    battery,
    timeString,
    timeWithSeconds,
    dateStringHi,
    dateStringEn,
    shortDateString,
    statusDateTimeString,
    timezone,
    is24Hour,
    setIs24Hour,
    userProfile: localUserProfile,
    updateUserProfile,
    setManualBatteryLevel,
    batteryHistory,
    simulateDrain,
    simulateCharge,
    resetBatteryHistory,
  } = useDeviceStatus(
    currentUser?.email || undefined,
    authProfile?.displayName || currentUser?.displayName || undefined
  );

  const handleUpdateProfile = useCallback(
    (updates: Partial<{ name: string; phoneNumber: string; email: string }>) => {
      updateUserProfile(updates);
      if (currentUser && updateUserProfileDetails) {
        updateUserProfileDetails({
          displayName: updates.name,
          phoneNumber: updates.phoneNumber,
        }).catch(console.warn);
      }
    },
    [currentUser, updateUserProfile, updateUserProfileDetails]
  );

  const [activeTab, setActiveTab] = useState<
    'home' | 'chat' | 'voice' | 'apps' | 'project' | 'settings'
  >('home');
  const [language, setLanguage] = useState<LanguageMode>('auto');
  const [theme, setTheme] = useState<ThemeMode>('futuristic-dark');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [batterySaver, setBatterySaver] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('deka_battery_saver');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return false;
  });
  const [isDeviceFrame, setIsDeviceFrame] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMathLabOpen, setIsMathLabOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [isSyncing, setIsSyncing] = useState(false);

  // Orb and Voice State
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [isListening, setIsListening] = useState(false);

  // Document Analysis State
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);
  const [docSummary, setDocSummary] = useState<string | null>(null);

  // Chat State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('deka_chat_sessions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    const defaultSession: ChatSession = {
      id: 'default-session-1',
      title: 'Welcome to DEKA AI',
      messages: [
        {
          id: 'welcome-1',
          role: 'model',
          content:
            'Hello! I am DEKA AI, your futuristic Android AI assistant. I can converse fluently in Hindi (हिंदी) and English, open your favorite apps like WhatsApp and YouTube, inspect documents, and execute phone shortcuts. Sign up or log in to sync your conversations across devices!',
          timestamp: Date.now(),
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return [defaultSession];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(
    () => sessions[0]?.id || 'default-session-1'
  );
  const [isLoading, setIsLoading] = useState(false);

  const currentSession =
    sessions.find((s) => s.id === currentSessionId) || sessions[0];

  // 1. Initial Load: Load chat sessions from IndexedDB (local-first)
  useEffect(() => {
    let isMounted = true;
    loadAllLocalSessions()
      .then((loadedSessions) => {
        if (!isMounted) return;
        if (loadedSessions && loadedSessions.length > 0) {
          setSessions(loadedSessions);
          if (!loadedSessions.some((s) => s.id === currentSessionId)) {
            setCurrentSessionId(loadedSessions[0].id);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not load sessions from IndexedDB:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Local-First Persistence: Save all sessions to IndexedDB whenever changed
  useEffect(() => {
    saveAllLocalSessions(sessions).catch((err) => {
      console.warn('Could not persist sessions to IndexedDB:', err);
    });
  }, [sessions]);

  // Sync profile preferences when user logs in
  useEffect(() => {
    if (authProfile) {
      if (authProfile.language) setLanguage(authProfile.language);
      if (authProfile.theme) setTheme(authProfile.theme);
      if (authProfile.ttsEnabled !== undefined) setTtsEnabled(authProfile.ttsEnabled);
      if (authProfile.speechRate !== undefined) setSpeechRate(authProfile.speechRate);
      if (authProfile.batterySaver !== undefined) setBatterySaver(authProfile.batterySaver);
    }
  }, [authProfile]);

  // Load chat sessions from Firestore when authenticated & online
  const syncFromCloud = useCallback(async () => {
    if (!currentUser || !isOnline) return;
    setIsSyncing(true);
    try {
      const cloudSessions = await loadUserChatSessions(currentUser.uid);
      if (cloudSessions && cloudSessions.length > 0) {
        // Merge cloud sessions with local IndexedDB sessions
        setSessions(cloudSessions);
        saveAllLocalSessions(cloudSessions).catch(console.warn);
        if (!cloudSessions.some((s) => s.id === currentSessionId)) {
          setCurrentSessionId(cloudSessions[0].id);
        }
      } else if (sessions.length > 0) {
        // Upload initial local sessions to new account
        for (const s of sessions) {
          await syncChatSession(currentUser.uid, s);
        }
      }
    } catch (err) {
      console.warn('Could not sync chat sessions from Firestore:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser, isOnline, currentSessionId, sessions]);

  // Flush offline sync queue and trigger cloud sync when online & authenticated
  useEffect(() => {
    if (currentUser && isOnline) {
      flushOfflineSyncQueue(
        currentUser.uid,
        syncChatSession,
        removeChatSession,
        clearAllChatSessions
      )
        .then(({ processed }) => {
          if (processed > 0) {
            console.log(`Synced ${processed} offline operations to cloud.`);
          }
          syncFromCloud();
        })
        .catch(console.warn);
    }
  }, [currentUser, isOnline]);

  // Update preferences with cloud sync
  const handleLanguageChange = (newLang: LanguageMode) => {
    setLanguage(newLang);
    if (currentUser) updateUserPreferences({ language: newLang });
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    if (currentUser) updateUserPreferences({ theme: newTheme });
  };

  const handleTtsEnabledChange = (enabled: boolean) => {
    setTtsEnabled(enabled);
    if (currentUser) updateUserPreferences({ ttsEnabled: enabled });
  };

  const handleSpeechRateChange = (rate: number) => {
    setSpeechRate(rate);
    if (currentUser) updateUserPreferences({ speechRate: rate });
  };

  const handleBatterySaverChange = (enabled: boolean) => {
    setBatterySaver(enabled);
    try {
      localStorage.setItem('deka_battery_saver', JSON.stringify(enabled));
    } catch (e) {
      // ignore
    }
    if (currentUser) updateUserPreferences({ batterySaver: enabled });
  };

  // Real Gemini Chat Handler with Local-First Fallback
  const handleSendPrompt = async (promptText: string): Promise<string> => {
    if (!promptText.trim()) return '';

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: Date.now(),
    };

    // Update session immediately and persist locally
    const updatedSessions = sessions.map((sess) => {
      if (sess.id === currentSession.id) {
        const updatedMessages = [...sess.messages, userMessage];
        const newTitle =
          sess.messages.length <= 1
            ? promptText.slice(0, 30) + (promptText.length > 30 ? '...' : '')
            : sess.title;
        const updated = {
          ...sess,
          title: newTitle,
          messages: updatedMessages,
          updatedAt: Date.now(),
        };
        // Local-first: write user message to IndexedDB right away
        saveLocalSession(updated).catch(console.warn);
        return updated;
      }
      return sess;
    });

    setSessions(updatedSessions);
    setIsLoading(true);
    setOrbState('thinking');

    // Offline handling: If user is offline, execute offline-first logic without blocking
    if (!isOnline) {
      const parsed = parseAppAndSearchQuery(promptText);
      let offlineReply = '';
      let actionPayload: any = undefined;

      if (parsed.isSpecificApp) {
        offlineReply =
          language === 'hi'
            ? `[ऑफलाइन मोड • Local-First] मैंने ${parsed.detectedApp.nameHi || parsed.detectedApp.name} का डायरेक्ट शॉर्टकट तैयार कर दिया है। आप नीचे दिए गए बटन से इसे तुरंत खोल सकते हैं।`
            : `[Offline Mode • Local-First] I've prepared the direct launcher for ${parsed.detectedApp.name}. Tap below to launch it directly.`;
        actionPayload = {
          name: parsed.detectedApp.name,
          query: parsed.searchQuery,
          url: parsed.detectedApp.getSearchUrl(parsed.searchQuery),
          intentUri: parsed.detectedApp.getIntentUri(parsed.searchQuery),
        };
      } else if (/battery|बैटरी|चार्ज|charge|charging|प्रतिशत|kitni bachi|time to full|kab tak chalegi|kitni der/i.test(promptText)) {
        const estDrainRate = batterySaver ? 2.8 : 3.8;
        const estMinutes = battery.charging
          ? (battery.level >= 100 ? 0 : Math.round(((100 - battery.level) / 28) * 60))
          : Math.round((battery.level / estDrainRate) * 60);
        const estHrs = Math.floor(estMinutes / 60);
        const estMins = estMinutes % 60;
        const timeEstimateStr = estHrs > 0 ? `${estHrs} घंटे ${estMins} मिनट` : `${estMins} मिनट`;
        const timeEstimateStrEn = estHrs > 0 ? `${estHrs} hr ${estMins} min` : `${estMins} min`;

        offlineReply =
          language === 'hi'
            ? `⚡ [ऑफलाइन मोड] आपकी डिवाइस की बैटरी वर्तमान में **${battery.level}%** है (${battery.charging ? 'चार्जर कनेक्टेड है और चार्ज हो रहा है ⚡' : 'बैटरी पर चल रहा है'})।\n\n* **${battery.charging ? 'फुल चार्ज होने में अनुमानित समय (Time to Full):' : 'अनुमानित शेष समय (Estimated Time Remaining):'}** **${timeEstimateStr}**\n\nआप सेटिंग्स में विस्तृत बैटरी उपयोग रुझान व खपत ग्राफ़ भी देख सकते हैं।`
            : `⚡ [Offline Mode] Your device battery is currently at **${battery.level}%** (${battery.charging ? 'Plugged in & Charging ⚡' : 'Discharging on Battery'}).\n\n* **${battery.charging ? 'Time to Full Charge:' : 'Estimated Time Remaining:'}** **${timeEstimateStrEn}**\n\nYou can view the full battery usage trend chart in Settings.`;
      } else if (/time|clock|समय|टाइम|तारीख|date|कितने बजे|घड़ी|samay/i.test(promptText)) {
        offlineReply =
          language === 'hi'
            ? `🕒 [ऑफलाइन मोड] वर्तमान स्थानीय समय **${timeString}** है। आज की तारीख: **${dateStringHi}** (${timezone}) [${is24Hour ? '24-घंटे प्रारूप' : '12-घंटे प्रारूप'}]।`
            : `🕒 [Offline Mode] The current local time is **${timeString}**. Today's date: **${dateStringEn}** (${timezone}) [${is24Hour ? '24-hour' : '12-hour'} format].`;
      } else if (/mera naam|my name|naam kya|who am i|mobile number|phone number|मोबाइल नंबर|मेरा नाम|फ़ोन नंबर/i.test(promptText)) {
        offlineReply =
          language === 'hi'
            ? `👤 [ऑफलाइन मोड] आपका पंजीकृत नाम **${localUserProfile.name}** है और मोबाइल नंबर **${localUserProfile.phoneNumber}** है। (ईमेल: ${currentUser?.email || localUserProfile.email})। आप सेटिंग्स में इसे कभी भी बदल सकते हैं।`
            : `👤 [Offline Mode] Your registered name is **${localUserProfile.name}** and mobile phone number is **${localUserProfile.phoneNumber}**. (Email: ${currentUser?.email || localUserProfile.email}). You can modify this in Settings anytime.`;
      } else if (
        (() => {
          const mathMatch = promptText.match(/([0-9]+(?:\.[0-9]+)?(?:\s*[\+\-\*\/×÷%^]\s*[0-9]+(?:\.[0-9]+)?)+)/);
          if (mathMatch) {
            try {
              const expr = mathMatch[1].trim();
              const sanitized = expr
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/%/g, '/100')
                .replace(/[^0-9+\-*/.()]/g, '');
              const evaluated = Function(`'use strict'; return (${sanitized})`)();
              if (typeof evaluated === 'number' && Number.isFinite(evaluated)) {
                offlineReply =
                  language === 'hi'
                    ? `🧮 **गणितीय गणना (Calculation Result):**\n\n**${expr} = ${Number(evaluated.toFixed(6))}**\n\n✅ ${expr} का सही उत्तर **${Number(evaluated.toFixed(6))}** है।`
                    : `🧮 **Calculation Result:**\n\n**${expr} = ${Number(evaluated.toFixed(6))}**\n\n✅ The answer to ${expr} is **${Number(evaluated.toFixed(6))}**.`;
                actionPayload = {
                  type: 'open_math_lab',
                  name: 'DEKA Math Lab & Quiz',
                  label: language === 'hi' ? '🧮 DEKA गणित लैब व कैलकुलेटर' : '🧮 Launch Math Lab',
                };
                return true;
              }
            } catch {
              // ignore
            }
          }
          return false;
        })()
      ) {
        // math expression handled above
      } else if (/math|गणित|हिसाब|समीकरण|sabal|sawal|सवाल|calculate|calculator|कैलकुलेटर|जोड़|गुणा|भाग|प्रतिशत|question/i.test(promptText)) {
        offlineReply =
          language === 'hi'
            ? `🧮 **[DEKA गणित सवाल • Offline Challenge]**\n\n**सवाल:** यदि एक दुकानदार ₹600 की वस्तु पर 25% की छूट देता है, तो ग्राहक को वह वस्तु कितने रुपये में मिलेगी?\n\n- A) ₹400\n- B) ₹450\n- C) ₹480\n- D) ₹500\n\n💡 **संकेत:** 600 का 25% = (600 × 25)/100 = ₹150 की छूट।\n✅ **सही उत्तर:** **B) ₹450** (600 - 150 = ₹450)।\n\n👉 आप अधिक सवाल हल करने और अपना स्कोर बढ़ाने के लिए नीचे दिए गए बटन से **DEKA Math Lab & Quiz** भी तुरंत खोल सकते हैं!`
            : `🧮 **[DEKA Math Challenge • Offline Mode]**\n\n**Question:** If a merchant offers a 25% discount on an item priced at ₹600, what is the selling price?\n\n- A) ₹400\n- B) ₹450\n- C) ₹480\n- D) ₹500\n\n💡 **Hint:** 25% of 600 = 600 / 4 = ₹150 discount.\n✅ **Answer:** **B) ₹450** (600 - 150 = ₹450).\n\n👉 Tap below to launch **DEKA Math Lab & Quiz** to solve more questions and track your streak!`;
        actionPayload = {
          type: 'open_math_lab',
          name: 'DEKA Math Lab & Quiz',
          label: language === 'hi' ? '🧮 DEKA गणित लैब व क्विज़ खोलें' : '🧮 Launch Math Lab & Quiz',
        };
      } else {
        offlineReply =
          language === 'hi'
            ? `आप वर्तमान में ऑफलाइन मोड (Offline Mode) में हैं। आपका संदेश IndexedDB लोकल डेटाबेस में सुरक्षित रूप से सहेज लिया गया है और बिना इंटरनेट के भी उपलब्ध रहेगा।`
            : `You are currently in Offline Mode. Your message and chat history have been securely saved to IndexedDB local storage and remain fully accessible without internet.`;
      }

      const offlineAiMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: offlineReply,
        timestamp: Date.now(),
        actionPayload,
        brainStats: {
          engine: 'DEKA Local-First Offline Engine',
          cognitiveMode: 'Local IndexedDB Cache',
          latencyMs: 15,
        },
      };

      const finalSessions = updatedSessions.map((sess) => {
        if (sess.id === currentSession.id) {
          const finalSess = {
            ...sess,
            messages: [...sess.messages, offlineAiMessage],
            updatedAt: Date.now(),
          };
          saveLocalSession(finalSess).catch(console.warn);
          if (currentUser) {
            queueOfflineSyncAction('upsert_session', finalSess.id, finalSess).catch(console.warn);
          }
          return finalSess;
        }
        return sess;
      });

      setSessions(finalSessions);
      setIsLoading(false);
      setOrbState('idle');

      if (ttsEnabled) {
        setOrbState('speaking');
        DekaTTS.speak(offlineReply, {
          rate: speechRate,
          lang: language,
          onEnd: () => setOrbState('idle'),
          onError: () => setOrbState('idle'),
        });
      }

      return offlineReply;
    }

    try {
      const payloadMessages = [...currentSession.messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          language,
          userProfile: {
            name: localUserProfile.name,
            phoneNumber: localUserProfile.phoneNumber,
            email: currentUser?.email || localUserProfile.email,
          },
          deviceContext: {
            currentTime: timeString,
            currentDate: language === 'hi' ? dateStringHi : dateStringEn,
            timezone,
            batteryLevel: battery.level,
            isCharging: battery.charging,
            batterySaver,
            is24Hour,
            timeToFullOrRemaining: battery.charging
              ? (battery.level >= 100 ? '100% Fully Charged' : `~${Math.round(((100 - battery.level) / 28) * 60)} minutes to full charge`)
              : `~${Math.round((battery.level / (batterySaver ? 2.8 : 3.8)) * 60)} minutes remaining (~${(battery.level / (batterySaver ? 2.8 : 3.8)).toFixed(1)} hrs)`,
          },
        }),
      });

      let reply = '';
      let detectedIntent: string | undefined;
      let actionPayload: any;
      let brainStats: any;

      try {
        const data = await res.json();
        reply = data.reply || data.error || 'DEKA AI received your query.';
        detectedIntent = data.detectedIntent;
        actionPayload = data.actionPayload;
        brainStats = data.brainStats;
      } catch {
        reply = 'DEKA AI received your query in local assistant mode.';
      }

      const aiMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: reply,
        timestamp: Date.now(),
        detectedIntent,
        actionPayload,
        brainStats,
      };

      const finalSessions = updatedSessions.map((sess) => {
        if (sess.id === currentSession.id) {
          const finalSess = {
            ...sess,
            messages: [...sess.messages, aiMessage],
            updatedAt: Date.now(),
          };

          // Save locally in IndexedDB first (Local-First Guarantee)
          saveLocalSession(finalSess).catch(console.warn);

          // Sync to Firestore if user logged in (limited in battery saver mode)
          if (currentUser && !batterySaver) {
            syncChatSession(currentUser.uid, finalSess).catch((err) => {
              console.warn('Sync failed, queuing for offline flush:', err);
              queueOfflineSyncAction('upsert_session', finalSess.id, finalSess).catch(console.warn);
            });
          }
          return finalSess;
        }
        return sess;
      });

      setSessions(finalSessions);
      setIsLoading(false);
      setOrbState('idle');

      // Speak if enabled
      if (ttsEnabled) {
        setOrbState('speaking');
        DekaTTS.speak(reply, {
          rate: speechRate,
          lang: language,
          onEnd: () => setOrbState('idle'),
          onError: () => setOrbState('idle'),
        });
      }

      return reply;
    } catch (err: any) {
      console.error('Chat error:', err);
      setIsLoading(false);
      setOrbState('idle');

      // Check if prompt can be fulfilled by local assistant even if network dropped
      const parsed = parseAppAndSearchQuery(promptText);
      const offlineReply = parsed.isSpecificApp
        ? (language === 'hi'
            ? `[ऑफलाइन मोड • Local-First] मैंने ${parsed.detectedApp.nameHi || parsed.detectedApp.name} का डायरेक्ट शॉर्टकट तैयार कर दिया है।`
            : `[Offline Mode • Local-First] I've prepared the direct launcher for ${parsed.detectedApp.name}.`)
        : (language === 'hi'
            ? 'नेटवर्क कनेक्शन अनुपलब्ध है। आपका संदेश IndexedDB लोकल स्टोरेज में सुरक्षित सेव हो गया है।'
            : 'Network connection unavailable. Your conversation has been safely preserved in local IndexedDB storage.');

      const fallbackMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: offlineReply,
        timestamp: Date.now(),
        actionPayload: parsed.isSpecificApp
          ? {
              name: parsed.detectedApp.name,
              query: parsed.searchQuery,
              url: parsed.detectedApp.getSearchUrl(parsed.searchQuery),
            }
          : undefined,
      };

      const finalSessions = updatedSessions.map((sess) => {
        if (sess.id === currentSession.id) {
          const finalSess = {
            ...sess,
            messages: [...sess.messages, fallbackMessage],
            updatedAt: Date.now(),
          };
          saveLocalSession(finalSess).catch(console.warn);
          if (currentUser) {
            queueOfflineSyncAction('upsert_session', finalSess.id, finalSess).catch(console.warn);
          }
          return finalSess;
        }
        return sess;
      });

      setSessions(finalSessions);
      return fallbackMessage.content;
    }
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title:
        language === 'hi'
          ? `नया वार्तालाप ${sessions.length + 1}`
          : `Chat ${sessions.length + 1}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveLocalSession(newSession).catch(console.warn);
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setActiveTab('chat');

    if (currentUser && !batterySaver) {
      if (isOnline) {
        syncChatSession(currentUser.uid, newSession).catch(() => {
          queueOfflineSyncAction('upsert_session', newSession.id, newSession).catch(console.warn);
        });
      } else {
        queueOfflineSyncAction('upsert_session', newSession.id, newSession).catch(console.warn);
      }
    }
  };

  const handleDeleteSession = (id: string) => {
    deleteLocalSession(id).catch(console.warn);
    if (currentUser) {
      if (isOnline) {
        removeChatSession(currentUser.uid, id).catch(() => {
          queueOfflineSyncAction('delete_session', id).catch(console.warn);
        });
      } else {
        queueOfflineSyncAction('delete_session', id).catch(console.warn);
      }
    }

    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fresh: ChatSession = {
          id: `session-${Date.now()}`,
          title: language === 'hi' ? 'नई चैट' : 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        saveLocalSession(fresh).catch(console.warn);
        setCurrentSessionId(fresh.id);
        if (currentUser) {
          if (isOnline) syncChatSession(currentUser.uid, fresh).catch(console.warn);
          else queueOfflineSyncAction('upsert_session', fresh.id, fresh).catch(console.warn);
        }
        return [fresh];
      }
      if (currentSessionId === id) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleClearAllSessions = () => {
    clearAllLocalSessions().catch(console.warn);
    if (currentUser) {
      if (isOnline) {
        clearAllChatSessions(currentUser.uid).catch(() => {
          queueOfflineSyncAction('clear_all').catch(console.warn);
        });
      } else {
        queueOfflineSyncAction('clear_all').catch(console.warn);
      }
    }

    const fresh: ChatSession = {
      id: `session-${Date.now()}`,
      title: language === 'hi' ? 'नई बातचीत' : 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions([fresh]);
    setCurrentSessionId(fresh.id);
    if (currentUser) syncChatSession(currentUser.uid, fresh).catch(console.warn);
  };

  const handleRegenerate = async () => {
    const lastUserMessage = [...currentSession.messages]
      .reverse()
      .find((m) => m.role === 'user');
    if (lastUserMessage) {
      await handleSendPrompt(lastUserMessage.content);
    }
  };

  const handleAnalyzeDocument = async (file: File) => {
    setIsAnalyzingDoc(true);
    setDocSummary(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const textContent = (e.target?.result as string) || '';
        const res = await fetch('/api/analyze-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentName: file.name,
            content: textContent.slice(0, 50000),
          }),
        });
        const data = await res.json();
        setDocSummary(data.summary || 'Summary completed.');
        setIsAnalyzingDoc(false);
      };
      reader.readAsText(file);
    } catch (e) {
      setDocSummary('Could not parse document file.');
      setIsAnalyzingDoc(false);
    }
  };

  const toggleLanguage = () => {
    const nextLang: LanguageMode = language === 'auto' ? 'hi' : language === 'hi' ? 'en' : 'auto';
    handleLanguageChange(nextLang);
  };

  const totalMessagesCount = sessions.reduce(
    (acc, sess) => acc + sess.messages.length,
    0
  );

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center transition-colors duration-300 ${
        theme === 'amoled-black'
          ? 'bg-black text-white'
          : theme === 'deep-navy'
          ? 'bg-[#050b18] text-slate-100'
          : theme === 'light'
          ? 'bg-slate-900 text-slate-100'
          : 'bg-[#06090f] text-slate-100'
      }`}
    >
      {/* Container - Responsive phone frame or full window */}
      <div
        className={`w-full h-screen flex flex-col overflow-hidden transition-all duration-300 ${
          batterySaver ? 'battery-saver-active' : ''
        } ${
          isDeviceFrame
            ? 'max-w-[420px] max-h-[880px] rounded-[48px] border-[10px] border-[#182338] shadow-[0_0_80px_rgba(0,240,255,0.35)] relative my-auto'
            : 'max-w-none h-screen'
        }`}
      >
        {/* Android Device Status Bar */}
        <div className="h-9 px-4 sm:px-6 bg-[#080c14] border-b border-cyan-500/10 flex items-center justify-between text-xs text-slate-400 select-none z-30 flex-shrink-0">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
            title={`Status: ${statusDateTimeString} (${is24Hour ? '24h' : '12h'} format) • Tap to adjust`}
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400 hidden xs:inline" />
            <span className="font-semibold text-white tracking-tight flex items-center gap-1 text-[11px] font-mono">
              <span className="text-cyan-400 hidden xs:inline">{shortDateString}</span>
              <span className="text-slate-600 hidden xs:inline">•</span>
              <span className="text-white font-bold">{timeString}</span>
            </span>
            <span className="text-[9px] text-cyan-400/80 font-mono hidden md:inline px-1 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
              5G • {is24Hour ? '24H' : '12H'}
            </span>
          </button>

          {/* Dynamic Island / Camera Punch Hole */}
          <div className="w-16 h-4 bg-black rounded-full border border-slate-800 flex items-center justify-center">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                batterySaver ? 'bg-amber-400/50' : 'bg-cyan-500/40 animate-pulse'
              }`}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Account pill button in top bar */}
            <button
              onClick={() => {
                if (currentUser) {
                  setIsSettingsOpen(true);
                } else {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }
              }}
              className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 transition-all"
              title={currentUser ? `Signed in as ${currentUser.email}` : `User: ${localUserProfile.name} (${localUserProfile.phoneNumber})`}
            >
              <UserIcon className="w-3 h-3 text-cyan-400" />
              <span className="truncate max-w-[85px]">
                {localUserProfile.name || (currentUser ? currentUser.displayName || 'Account' : 'Sign In')}
              </span>
            </button>

            {/* Install App on Mobile Button */}
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/25 transition-all shadow-sm"
              title={language === 'hi' ? 'मोबाइल में इंस्टॉल करें (PWA / APK)' : 'Install on Mobile'}
            >
              <Smartphone className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">
                {language === 'hi' ? 'इंस्टॉल' : 'Install'}
              </span>
            </button>

            {/* Publish & Public Live URL Button */}
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25 transition-all shadow-sm"
              title={language === 'hi' ? 'पब्लिश एवं सार्वजनिक लाइव लिंक देखें' : 'Publish & Public Live URL'}
            >
              <Cloud className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">
                {language === 'hi' ? 'पब्लिश' : 'Publish'}
              </span>
            </button>

            {/* View Mode Toggle: Android Frame vs Full Web */}
            <button
              onClick={() => setIsDeviceFrame(!isDeviceFrame)}
              className="p-1 rounded text-slate-400 hover:text-cyan-300 transition-colors"
              title={
                isDeviceFrame
                  ? 'Switch to Full Screen View'
                  : 'Switch to Android Phone Frame'
              }
            >
              {isDeviceFrame ? (
                <Maximize2 className="w-3.5 h-3.5" />
              ) : (
                <Minimize2 className="w-3.5 h-3.5" />
              )}
            </button>
            {isOnline ? (
              <span title="Network Online • Cloud Sync Active" className="flex items-center">
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              </span>
            ) : (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono hover:bg-amber-500/30 transition-all"
                title="Offline Mode: IndexedDB Local-First Active (Tap to view storage)"
              >
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Offline</span>
              </button>
            )}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-all ${
                batterySaver
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={
                batterySaver
                  ? `Battery Saver Active (${battery.level}%) • Tap to view chart & stats`
                  : `Battery ${battery.level}% ${battery.charging ? '(Charging ⚡)' : ''} • Tap to view chart & stats`
              }
            >
              <span
                className={`text-[10px] font-mono ${
                  batterySaver
                    ? 'text-amber-400 font-bold'
                    : battery.level < 20
                    ? 'text-red-400 font-bold'
                    : 'text-slate-300'
                }`}
              >
                {battery.level}%{battery.charging ? ' ⚡' : batterySaver ? ' 🔋' : ''}
              </span>
              {battery.charging ? (
                <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/40 animate-pulse" />
              ) : (
                <Battery
                  className={`w-3.5 h-3.5 ${
                    batterySaver
                      ? 'text-amber-400 fill-amber-400/25'
                      : battery.level < 20
                      ? 'text-red-400 fill-red-400/25'
                      : 'text-emerald-400'
                  }`}
                />
              )}
            </button>
          </div>
        </div>

        {/* Primary Main Content View Area */}
        <div className="flex-1 overflow-hidden relative bg-[#080c14]">
          {activeTab === 'home' && (
            <HomeScreen
              orbState={orbState}
              isListening={isListening}
              onOrbClick={() => setIsVoiceModalOpen(true)}
              onMicClick={() => setIsVoiceModalOpen(true)}
              onSendPrompt={(p) => {
                setActiveTab('chat');
                handleSendPrompt(p);
              }}
              onNavigateTab={(tab) => {
                if (tab === 'voice') setIsVoiceModalOpen(true);
                else if (tab === 'settings') setIsSettingsOpen(true);
                else setActiveTab(tab);
              }}
              language={language}
              onToggleLanguage={toggleLanguage}
              batterySaver={batterySaver}
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
              onOpenMathLab={() => setIsMathLabOpen(true)}
              onOpenPublishModal={() => setIsPublishModalOpen(true)}
            />
          )}

          {activeTab === 'chat' && (
            <ChatView
              currentSession={currentSession}
              sessions={sessions}
              onSelectSession={(id) => setCurrentSessionId(id)}
              onNewChat={handleNewChat}
              onDeleteSession={handleDeleteSession}
              onClearAllSessions={handleClearAllSessions}
              onSendMessage={async (t) => {
                await handleSendPrompt(t);
              }}
              onRegenerate={handleRegenerate}
              isLoading={isLoading}
              language={language}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              isOnline={isOnline}
              onOpenMathLab={() => setIsMathLabOpen(true)}
              onOpenAppIntent={async (appKey) => {
                const foundApp =
                  UNIVERSAL_APPS.find((a) => a.id === appKey) ||
                  createDynamicAppTarget(appKey);
                await executeAppLaunch(foundApp);
              }}
            />
          )}

          {activeTab === 'apps' && (
            <AppsIntegrationView
              language={language}
              onAnalyzeDocument={handleAnalyzeDocument}
              isAnalyzingDoc={isAnalyzingDoc}
              docSummary={docSummary}
              onOpenMathLab={() => setIsMathLabOpen(true)}
            />
          )}

          {activeTab === 'project' && <AndroidProjectHub language={language} />}
        </div>

        {/* Clean Android Bottom Navigation Bar */}
        <div className="h-16 bg-[#0b1322]/95 backdrop-blur-lg border-t border-cyan-500/15 flex items-center justify-around px-2 z-30 flex-shrink-0">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              activeTab === 'home'
                ? 'text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-1">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              activeTab === 'chat'
                ? 'text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] mt-1">AI Chat</span>
          </button>

          {/* Center Glowing Voice Orb Trigger */}
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="relative -top-3 flex flex-col items-center justify-center p-3 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-black shadow-[0_0_25px_rgba(0,240,255,0.6)] border-2 border-white/20 hover:scale-110 active:scale-95 transition-all"
            title="Open DEKA Voice Assistant"
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('apps')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              activeTab === 'apps'
                ? 'text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span className="text-[10px] mt-1">Apps</span>
          </button>

          <button
            onClick={() => setActiveTab('project')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              activeTab === 'project'
                ? 'text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Android Studio Source & APK"
          >
            <FolderArchive className="w-5 h-5" />
            <span className="text-[10px] mt-1">APK / Code</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-200 transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] mt-1">Settings</span>
          </button>
        </div>

        {/* Android Gesture Bar */}
        {isDeviceFrame && (
          <div className="h-4 bg-[#080c14] flex items-center justify-center">
            <div className="w-32 h-1 bg-slate-600 rounded-full" />
          </div>
        )}
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSendQuery={async (q) => {
          return await handleSendPrompt(q);
        }}
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeChange={handleThemeChange}
        ttsEnabled={ttsEnabled}
        onTtsEnabledChange={handleTtsEnabledChange}
        speechRate={speechRate}
        onSpeechRateChange={handleSpeechRateChange}
        batterySaver={batterySaver}
        onBatterySaverChange={handleBatterySaverChange}
        onClearHistory={handleClearAllSessions}
        totalChatsCount={totalMessagesCount}
        onOpenAuthModal={(m) => {
          setAuthModalMode(m || 'login');
          setIsAuthModalOpen(true);
        }}
        onSyncNow={syncFromCloud}
        isSyncing={isSyncing}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        userProfile={localUserProfile}
        onUpdateUserProfile={handleUpdateProfile}
        battery={battery}
        batteryHistory={batteryHistory}
        onSimulateDrain={simulateDrain}
        onSimulateCharge={simulateCharge}
        onResetBatteryHistory={resetBatteryHistory}
        onSetManualBatteryLevel={setManualBatteryLevel}
        is24Hour={is24Hour}
        onToggleTimeFormat={setIs24Hour}
        statusDateTimeString={statusDateTimeString}
        timeString={timeString}
      />

      {/* Mobile Installation Guide Modal (PWA & Native APK) */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        language={language}
        onOpenProjectTab={() => setActiveTab('project')}
      />

      {/* Auth Modal (Sign Up, Login, Password Reset) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
        initialMode={authModalMode}
      />

      {/* Interactive Math Lab & Quiz Modal */}
      <MathLabModal
        isOpen={isMathLabOpen}
        onClose={() => setIsMathLabOpen(false)}
        language={language}
        onSendToChat={(prompt) => {
          setActiveTab('chat');
          handleSendPrompt(prompt);
        }}
      />

      {/* Publish & Public Live Sharing Hub Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        language={language}
        onOpenAndroidHub={() => setActiveTab('project')}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DekaAppContent />
    </AuthProvider>
  );
}
