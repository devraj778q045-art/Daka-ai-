import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Plus,
  Copy,
  Check,
  RefreshCw,
  Volume2,
  Trash2,
  Sparkles,
  ExternalLink,
  Bot,
  User,
  MessageSquare,
  ChevronRight,
  Clock,
  Mic,
  Camera,
  FolderOpen,
  WifiOff,
  Database,
  HardDrive,
  Calculator,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Info,
  X,
  Code,
  Paperclip,
} from 'lucide-react';
import { ChatMessage, ChatSession, LanguageMode } from '../types/deka';
import { DekaTTS } from '../utils/speech';
import {
  UNIVERSAL_APPS,
  executeAppLaunch,
  createDynamicAppTarget,
  AppDefinition,
} from '../utils/appLauncher';
import { Play, Search, Globe, ArrowUpRight } from 'lucide-react';

interface ChatViewProps {
  currentSession: ChatSession;
  sessions: ChatSession[];
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClearAllSessions: () => void;
  onSendMessage: (text: string, imageAttachment?: { data: string; mimeType: string }) => Promise<void>;
  onRegenerate: () => Promise<void>;
  isLoading: boolean;
  language: LanguageMode;
  onOpenVoiceModal: () => void;
  onOpenAppIntent?: (appKey: string) => void;
  isOnline?: boolean;
  onOpenMathLab?: () => void;
  onOpenSettings?: () => void;
  onOpenAbout?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentSession,
  sessions,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAllSessions,
  onSendMessage,
  onRegenerate,
  isLoading,
  language,
  onOpenVoiceModal,
  onOpenAppIntent,
  isOnline = true,
  onOpenMathLab,
  onOpenSettings,
  onOpenAbout,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    data: string;
    mimeType: string;
    preview: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession.messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText.trim();
    setInputText('');
    onSendMessage(msg);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, id: string) => {
    if (speakingId === id) {
      DekaTTS.stop();
      setSpeakingId(null);
    } else {
      setSpeakingId(id);
      DekaTTS.speak(text, {
        lang: language,
        onEnd: () => setSpeakingId(null),
        onError: () => setSpeakingId(null),
      });
    }
  };

  return (
    <div className="flex h-full w-full relative bg-[#080c14] overflow-hidden">
      {/* Sessions / Chat History Drawer (Side or Mobile Drawer) */}
      {showHistoryDrawer && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setShowHistoryDrawer(false)}
        />
      )}

      <div
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-[#0b1322] border-r border-cyan-500/15 flex flex-col transition-transform duration-300 ease-in-out ${
          showHistoryDrawer ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-cyan-500/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {language === 'hi' ? 'बातचीत का इतिहास' : 'Chat History'}
            </h3>
          </div>
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-medium border border-cyan-400/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            {language === 'hi' ? 'नई चैट' : 'New Chat'}
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {sessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              {language === 'hi' ? 'कोई पिछला वार्तालाप नहीं' : 'No previous chats saved.'}
            </div>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.id === currentSession.id;
              return (
                <div
                  key={sess.id}
                  onClick={() => {
                    onSelectSession(sess.id);
                    setShowHistoryDrawer(false);
                  }}
                  className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{sess.title || (language === 'hi' ? 'नया वार्तालाप' : 'New Conversation')}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(sess.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 rounded transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Local-First Storage Badge in Drawer */}
        <div className="px-3 py-2 border-t border-cyan-500/10 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Database className="w-3 h-3 text-cyan-400" />
            IndexedDB Local-First
          </span>
          <span className="text-[10px] text-cyan-300 font-mono">
            {sessions.length} chats
          </span>
        </div>

        {/* Bottom Drawer Clear All */}
        {sessions.length > 0 && (
          <div className="p-3 border-t border-cyan-500/10">
            <button
              onClick={onClearAllSessions}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-colors border border-slate-800"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {language === 'hi' ? 'सभी चैट हटाएं' : 'Clear All History'}
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-[#080c14] relative">
        {/* Chat Header Bar */}
        <div className="h-14 border-b border-cyan-500/15 bg-[#0b1322]/80 backdrop-blur-md px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="p-1.5 text-slate-400 hover:text-cyan-300 lg:hidden rounded-lg bg-slate-800/40"
              title="Toggle Chat History"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-sm font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-xs">
                {currentSession.title || (language === 'hi' ? 'DEKA AI चैट' : 'DEKA AI Chat')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOnline && (
              <span className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                <WifiOff className="w-3 h-3" />
                Offline
              </span>
            )}
            <button
              onClick={onNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-medium border border-cyan-400/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'hi' ? 'नई चैट' : 'New Chat'}</span>
            </button>
          </div>
        </div>

        {/* Offline Banner when offline */}
        {!isOnline && (
          <div className="bg-amber-950/40 border-b border-amber-500/25 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <WifiOff className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-[11px] font-medium">
                {language === 'hi'
                  ? 'ऑफलाइन मोड: आपका चैट इतिहास IndexedDB में सुरक्षित है। सभी संदेश बिना इंटरनेट के भी उपलब्ध रहेंगे।'
                  : 'Offline Mode: Chat history cached in IndexedDB. All conversations remain fully accessible without internet.'}
              </span>
            </div>
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 flex-shrink-0">
              <Database className="w-3 h-3" />
              Local-First
            </span>
          </div>
        )}

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {currentSession.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto p-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.25)]">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {language === 'hi' ? 'DEKA AI आपका स्वागत करता है' : 'Welcome to DEKA AI'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {language === 'hi'
                    ? 'ChatGPT स्तर की बुद्धिमत्ता, हिंदी और अंग्रेज़ी द्विभाषी बातचीत, और एंड्रॉइड ऐप एकीकरण।'
                    : 'Intelligent multi-turn conversational AI with bilingual Hindi and English fluency and native Android integration.'}
                </p>
              </div>

              {/* Quick Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-2">
                {[
                  {
                    en: 'Explain Android Jetpack Compose architecture',
                    hi: 'एंड्रॉइड जेटपैक कंपोज़ का आर्किटेक्चर समझाएं',
                  },
                  {
                    en: 'Open WhatsApp or send an email',
                    hi: 'व्हाट्सएप या जीमेल ऐप खोलने में मदद करें',
                  },
                  {
                    en: 'Summarize the top 5 emerging tech trends',
                    hi: '2026 की टॉप 5 AI तकनीकें क्या हैं?',
                  },
                  {
                    en: 'Write a creative story in Hindi & English',
                    hi: 'एक प्रेरणादायक हिंदी कहानी सुनाएं',
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(language === 'hi' ? item.hi : item.en)}
                    className="p-3 text-left rounded-2xl bg-[#0b1528] border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-950/30 text-xs text-slate-300 transition-all flex items-start justify-between group"
                  >
                    <span>{language === 'hi' ? item.hi : item.en}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            currentSession.messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                      isUser
                        ? 'bg-cyan-500/25 border border-cyan-400/40 text-cyan-300'
                        : 'bg-[#0f2142] border border-cyan-400/40 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble Card */}
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 transition-all ${
                      isUser
                        ? 'bg-gradient-to-br from-cyan-950/40 to-blue-950/30 border border-cyan-400/40 text-slate-100 rounded-tr-sm'
                        : 'bg-[#0b1528] border border-cyan-500/20 text-slate-200 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                    }`}
                  >
                    {/* Header line for AI bubble with Gemini Brain badge */}
                    {!isUser && (
                      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-cyan-500/10">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold text-cyan-300 tracking-wider flex items-center gap-1 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-400/30">
                            🧠 GEMINI BRAIN • जेमिनाई
                          </span>
                          {message.brainStats?.latencyMs && (
                            <span className="text-[9px] font-mono text-cyan-400/80 bg-[#080c14] px-1.5 py-0.5 rounded">
                              {(message.brainStats.latencyMs / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Speak Button */}
                          <button
                            onClick={() => handleSpeak(message.content, message.id)}
                            className={`p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors ${
                              speakingId === message.id ? 'text-cyan-400 animate-pulse' : ''
                            }`}
                            title={speakingId === message.id ? 'Stop Speaking' : 'Listen to response'}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          {/* Copy Button */}
                          <button
                            onClick={() => handleCopy(message.content, message.id)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                            title="Copy response"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Text content with clean spacing */}
                    <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {message.content}
                    </div>

                    {/* Detected Android Action Card if intent present */}
                    {message.actionPayload && (
                      <div className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#0c1a36] to-[#071124] border-2 border-cyan-400/40 space-y-2.5 shadow-[0_0_25px_rgba(0,240,255,0.2)]">
                        {message.actionPayload.type === 'open_math_lab' ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                                  <Calculator className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-xs font-black text-white tracking-wide">
                                    {language === 'hi' ? 'DEKA गणित लैब व क्विज़' : 'DEKA Math Lab & Quiz'}
                                  </span>
                                  <span className="text-[10px] text-amber-400 font-mono ml-2">
                                    [Interactive Tool]
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 font-semibold">
                                MATH LAB
                              </span>
                            </div>

                            <button
                              onClick={() => onOpenMathLab?.()}
                              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-black flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                              <span>
                                {message.actionPayload.label ||
                                  (language === 'hi' ? '🧮 गणित लैब और क्विज़ खोलें' : '🧮 Launch Math Lab & Quiz')}
                              </span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs"
                                  style={{
                                    backgroundColor: message.actionPayload.color
                                      ? `${message.actionPayload.color}25`
                                      : 'rgba(0,240,255,0.2)',
                                    color: message.actionPayload.color || '#00F0FF',
                                  }}
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                </div>
                                <div>
                                  <span className="text-xs font-black text-white tracking-wide">
                                    {message.actionPayload.name || 'Android App'}
                                  </span>
                                  <span className="text-[10px] text-cyan-400 font-mono ml-2">
                                    [Ready to Launch]
                                  </span>
                                </div>
                              </div>

                              <span className="text-[10px] bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-400/30 font-semibold">
                                {message.actionPayload.query ? 'IN-APP SEARCH' : 'OPEN INTENT'}
                              </span>
                            </div>

                            {message.actionPayload.query && (
                              <div className="p-2 rounded-xl bg-[#080c14] border border-cyan-500/20 flex items-center gap-2 text-xs text-slate-200">
                                <Search className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                                <span className="text-slate-400 text-[11px]">
                                  {language === 'hi' ? 'सर्च क्वेरी:' : 'Query:'}
                                </span>
                                <strong className="text-cyan-300 font-bold truncate">
                                  "{message.actionPayload.query}"
                                </strong>
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={async () => {
                                  const foundApp =
                                    UNIVERSAL_APPS.find((a) => a.id === message.actionPayload.app) ||
                                    createDynamicAppTarget(
                                      message.actionPayload.name || 'App',
                                      message.actionPayload.query || ''
                                    );
                                  await executeAppLaunch(foundApp, message.actionPayload.query || '');
                                }}
                                className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>
                                  {message.actionPayload.query
                                    ? language === 'hi'
                                      ? `${message.actionPayload.name} में सर्च खोलें`
                                      : `Search in ${message.actionPayload.name}`
                                    : language === 'hi'
                                    ? `${message.actionPayload.name} खोलें`
                                    : `Open ${message.actionPayload.name}`}
                                </span>
                              </button>

                              {message.actionPayload.url && (
                                <a
                                  href={message.actionPayload.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-[#080c14] hover:bg-slate-800 text-cyan-300 border border-cyan-500/20 transition-all"
                                  title="Direct Web Link"
                                >
                                  <ArrowUpRight className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 animate-in fade-in">
              <div className="w-8 h-8 rounded-full bg-[#0f2142] border border-cyan-400/40 text-cyan-400 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-[#0b1528] border border-cyan-500/20 text-slate-300 rounded-tl-sm flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-cyan-300 font-medium">
                  {language === 'hi' ? 'DEKA विचार कर रहा है...' : 'DEKA is reasoning...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Regenerate Action Banner (If messages exist and not loading) */}
        {currentSession.messages.length > 0 && !isLoading && (
          <div className="px-4 py-1.5 flex justify-center">
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 text-[11px] border border-slate-800 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              {language === 'hi' ? 'पुनः उत्तर उत्पन्न करें' : 'Regenerate response'}
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-cyan-500/15 bg-[#080c14]">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 max-w-4xl mx-auto bg-[#0b1528] border border-cyan-500/25 focus-within:border-cyan-400/80 rounded-2xl p-1.5 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          >
            {/* Mic trigger button */}
            <button
              type="button"
              onClick={onOpenVoiceModal}
              className="p-2.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors"
              title="Voice Input (Hindi/English)"
            >
              <Mic className="w-4 h-4 text-cyan-400" />
            </button>

            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={
                language === 'hi'
                  ? 'DEKA AI से कुछ भी पूछें (हिंदी या English)...'
                  : 'Ask DEKA AI anything (Hindi or English)...'
              }
              className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-28 py-1.5"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold disabled:bg-slate-800 disabled:text-slate-600 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:shadow-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-500 mt-2">
            DEKA AI Neural Assistant • Contextual conversations with follow-up memory.
          </p>
        </div>
      </div>
    </div>
  );
};
