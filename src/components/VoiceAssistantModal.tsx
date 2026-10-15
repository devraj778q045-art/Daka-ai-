import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ShieldCheck,
  BatteryCharging,
  CornerDownRight,
  Send,
  Zap,
} from 'lucide-react';
import { DekaOrb } from './DekaOrb';
import { OrbState, LanguageMode } from '../types/deka';
import { DekaSpeechService, DekaTTS } from '../utils/speech';
import {
  parseAppAndSearchQuery,
  executeAppLaunch,
  AppDefinition,
} from '../utils/appLauncher';
import { ExternalLink, Play, Search } from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendQuery: (query: string) => Promise<string>;
  language: LanguageMode;
  onLanguageChange: (lang: LanguageMode) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onSendQuery,
  language,
  onLanguageChange,
}) => {
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [speechService] = useState(() => new DekaSpeechService());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [manualText, setManualText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedAppAction, setDetectedAppAction] = useState<{
    app: AppDefinition;
    query: string;
  } | null>(null);
  const [autoLaunchCountdown, setAutoLaunchCountdown] = useState<number | null>(null);

  useEffect(() => {
    speechService.setLanguage(language);
  }, [language, speechService]);

  // Handle countdown timer for auto launch
  useEffect(() => {
    if (autoLaunchCountdown === null) return;
    if (autoLaunchCountdown <= 0) {
      if (detectedAppAction) {
        executeAppLaunch(detectedAppAction.app, detectedAppAction.query);
      }
      setAutoLaunchCountdown(null);
      return;
    }
    const timer = setTimeout(() => {
      setAutoLaunchCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoLaunchCountdown, detectedAppAction]);

  useEffect(() => {
    if (!isOpen) {
      speechService.stopListening();
      DekaTTS.stop();
      setIsListening(false);
      setOrbState('idle');
      setDetectedAppAction(null);
      setAutoLaunchCountdown(null);
      return;
    }

    // Auto start listening on open
    startVoiceSession();

    return () => {
      speechService.stopListening();
      DekaTTS.stop();
    };
  }, [isOpen]);

  const startVoiceSession = () => {
    if (!speechService.isSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    setTranscript('');
    setWakeWordDetected(false);
    setIsListening(true);
    setOrbState('listening');

    speechService.startListening({
      onStart: () => {
        setIsListening(true);
        setOrbState('listening');
      },
      onWakeWord: () => {
        setWakeWordDetected(true);
      },
      onResult: (text, isFinal) => {
        setTranscript(text);
        if (isFinal && text.trim().length > 1) {
          handleVoiceQuery(text.trim());
        }
      },
      onError: (err) => {
        console.warn('Voice error:', err);
        setIsListening(false);
        setOrbState('idle');
      },
      onEnd: () => {
        setIsListening(false);
        if (orbState === 'listening') {
          setOrbState('idle');
        }
      },
    });
  };

  const handleVoiceQuery = async (queryText: string) => {
    speechService.stopListening();
    setIsListening(false);
    setIsProcessing(true);
    setOrbState('thinking');

    // Parse for app launching and in-app search intent
    const parsed = parseAppAndSearchQuery(queryText);
    if (parsed.isSpecificApp) {
      setDetectedAppAction({
        app: parsed.detectedApp,
        query: parsed.searchQuery,
      });
      setAutoLaunchCountdown(3);
    } else {
      setDetectedAppAction(null);
      setAutoLaunchCountdown(null);
    }

    try {
      const reply = await onSendQuery(queryText);
      setAiResponse(reply);
      setIsProcessing(false);
      setOrbState('speaking');
      setIsSpeaking(true);

      DekaTTS.speak(reply, {
        lang: language,
        onEnd: () => {
          setIsSpeaking(false);
          setOrbState('idle');
        },
        onError: () => {
          setIsSpeaking(false);
          setOrbState('idle');
        },
      });
    } catch (e) {
      setIsProcessing(false);
      setOrbState('idle');
      setAiResponse('Sorry, I encountered an issue processing your request.');
    }
  };

  const stopAudio = () => {
    DekaTTS.stop();
    setIsSpeaking(false);
    setOrbState('idle');
  };

  const toggleMic = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      setOrbState('idle');
    } else {
      stopAudio();
      startVoiceSession();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#080c14]/95 shadow-[0_0_60px_rgba(0,240,255,0.25)] flex flex-col max-h-[92vh]">
        {/* Glow ambient background header */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-cyan-500/15 via-blue-500/5 to-transparent pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="relative z-10 flex items-center justify-between p-5 border-b border-cyan-500/15">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-400/40">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                DEKA Voice • Gemini Brain
                {wakeWordDetected && (
                  <span className="text-[10px] bg-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-400/40 animate-pulse">
                    "Hey Deka" Detected
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-cyan-300/80">
                {language === 'hi' ? '🧠 जेमिनाई न्यूरल दिमाग द्वारा संचालित' : '🧠 Powered by Google Gemini Neural Intelligence'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language toggle pill */}
            <div className="flex bg-[#0b1528] rounded-full p-1 border border-cyan-500/20 text-xs">
              <button
                onClick={() => onLanguageChange('auto')}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                  language === 'auto' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Auto
              </button>
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                  language === 'hi' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                  language === 'en' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Orb Section */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
          <DekaOrb state={orbState} size={230} onClick={toggleMic} />

          {/* Status Label */}
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isListening
                  ? 'bg-cyan-400 animate-ping'
                  : isSpeaking
                  ? 'bg-blue-400 animate-pulse'
                  : isProcessing
                  ? 'bg-purple-400 animate-spin'
                  : 'bg-slate-600'
              }`}
            />
            <p className="text-sm font-medium text-slate-300">
              {isListening
                ? language === 'hi'
                  ? 'सुन रहा हूँ... बोलिए या "Hey Deka" कहें'
                  : 'Listening... Speak or say "Hey Deka"'
                : isProcessing
                ? language === 'hi'
                  ? 'DEKA विचार कर रहा है...'
                  : 'DEKA is thinking...'
                : isSpeaking
                ? language === 'hi'
                  ? 'बोल रहा हूँ...'
                  : 'Speaking response...'
                : language === 'hi'
                ? 'माइक पर टैप करें या बोलना शुरू करें'
                : 'Tap microphone orb to speak'}
            </p>
          </div>

          {/* Transcript Display Card */}
          {transcript && (
            <div className="w-full mt-4 p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-left animate-in slide-in-from-bottom-2">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                {language === 'hi' ? 'आपकी आवाज़ (Speech Input)' : 'Your Speech'}
              </span>
              <p className="text-sm text-cyan-100 font-medium mt-1">"{transcript}"</p>
            </div>
          )}

          {/* AI Response Card */}
          {aiResponse && (
            <div className="w-full mt-3 p-4 rounded-2xl bg-[#0b1528] border border-cyan-500/20 text-left max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> DEKA AI
                </span>
                {isSpeaking ? (
                  <button
                    onClick={stopAudio}
                    className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-100 bg-cyan-500/20 px-2 py-0.5 rounded-full"
                  >
                    <Volume2 className="w-3 h-3 animate-pulse" /> Stop Voice
                  </button>
                ) : (
                  <button
                    onClick={() => DekaTTS.speak(aiResponse, { lang: language })}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300"
                  >
                    <Volume2 className="w-3 h-3" /> Replay Voice
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
            </div>
          )}

          {/* Detected App Action Launch Card in Voice Modal */}
          {detectedAppAction && (
            <div className="w-full mt-3 p-4 rounded-2xl bg-gradient-to-r from-[#0c1a36] to-[#071124] border-2 border-cyan-400/50 text-left space-y-2.5 shadow-[0_0_30px_rgba(0,240,255,0.3)] animate-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs"
                    style={{
                      backgroundColor: `${detectedAppAction.app.color}25`,
                      color: detectedAppAction.app.color,
                    }}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white">
                      {detectedAppAction.app.nameHi || detectedAppAction.app.name}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono ml-2">
                      [Intent Ready]
                    </span>
                  </div>
                </div>

                {autoLaunchCountdown !== null && (
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono font-bold px-2 py-0.5 rounded-full border border-cyan-400/30 animate-pulse">
                    Auto-launch in {autoLaunchCountdown}s
                  </span>
                )}
              </div>

              {detectedAppAction.query && (
                <div className="p-2 rounded-xl bg-[#080c14] border border-cyan-500/20 flex items-center gap-2 text-xs text-slate-200">
                  <Search className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="text-slate-400 text-[11px]">
                    {language === 'hi' ? 'सर्च:' : 'Search:'}
                  </span>
                  <strong className="text-cyan-300 truncate">
                    "{detectedAppAction.query}"
                  </strong>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setAutoLaunchCountdown(null);
                    executeAppLaunch(detectedAppAction.app, detectedAppAction.query);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>
                    {detectedAppAction.query
                      ? language === 'hi'
                        ? `${detectedAppAction.app.nameHi || detectedAppAction.app.name} में सर्च खोलें`
                        : `Launch Search in ${detectedAppAction.app.name}`
                      : language === 'hi'
                      ? `${detectedAppAction.app.nameHi || detectedAppAction.app.name} अभी खोलें`
                      : `Open ${detectedAppAction.app.name} Now`}
                  </span>
                </button>

                {autoLaunchCountdown !== null && (
                  <button
                    onClick={() => setAutoLaunchCountdown(null)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Sample Prompts */}
          {!transcript && !aiResponse && (
            <div className="w-full mt-5">
              <p className="text-[11px] text-slate-400 mb-2 font-medium">
                {language === 'hi' ? 'आप ऐसे प्रश्न पूछ सकते हैं:' : 'Try saying:'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  language === 'hi' ? 'व्हाट्सएप खोलो' : 'Open WhatsApp',
                  language === 'hi' ? 'आज का मौसम क्या है?' : 'What is the latest AI news?',
                  language === 'hi' ? 'YouTube पर गाने चलाओ' : 'Search nearby places on Maps',
                  language === 'hi' ? 'मुझे एक मोटिवेशनल विचार सुनाओ' : 'Explain quantum computers simply',
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTranscript(sample);
                      handleVoiceQuery(sample);
                    }}
                    className="text-xs bg-[#0b1528] hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 px-3 py-1.5 rounded-xl border border-cyan-500/20 transition-all flex items-center gap-1.5"
                  >
                    <CornerDownRight className="w-3 h-3 text-cyan-400" />
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Voice Controls & Manual Input Bar */}
        <div className="relative z-10 p-4 border-t border-cyan-500/15 bg-[#080c14] space-y-3">
          <div className="flex items-center gap-3">
            {/* Big Mic Button */}
            <button
              onClick={toggleMic}
              className={`p-3.5 rounded-2xl transition-all flex items-center justify-center ${
                isListening
                  ? 'bg-cyan-500 text-black shadow-[0_0_25px_rgba(0,240,255,0.6)] animate-pulse'
                  : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25'
              }`}
              title={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? <Mic className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Alternative text typing */}
            <div className="flex-1 flex items-center bg-[#0b1528] border border-cyan-500/25 rounded-2xl px-3 py-1.5 focus-within:border-cyan-400">
              <input
                type="text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && manualText.trim()) {
                    handleVoiceQuery(manualText.trim());
                    setManualText('');
                  }
                }}
                placeholder={
                  language === 'hi' ? 'या यहाँ लिखकर पूछें...' : 'Or type your command...'
                }
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (manualText.trim()) {
                    handleVoiceQuery(manualText.trim());
                    setManualText('');
                  }
                }}
                disabled={!manualText.trim()}
                className="p-1.5 text-cyan-400 disabled:text-slate-600 hover:text-cyan-300 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Privacy & Android Battery note */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1 border-t border-slate-800/80">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Real-time on-device audio stream (Never recorded)
            </span>
            <span className="flex items-center gap-1">
              <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
              Battery optimized
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
