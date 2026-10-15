import React, { useState, useMemo } from 'react';
import {
  X,
  Calculator,
  Trophy,
  Flame,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Zap,
  ChevronRight,
  Award,
  Layers,
  Percent,
  Target,
} from 'lucide-react';
import { LanguageMode } from '../types/deka';

export interface MathQuestion {
  id: string;
  category: 'easy' | 'medium' | 'hard' | 'word' | 'mental';
  titleHi: string;
  titleEn: string;
  options: string[];
  correctIndex: number;
  explanationHi: string;
  explanationEn: string;
  hintHi: string;
  hintEn: string;
}

const STATIC_MATH_QUESTIONS: MathQuestion[] = [
  {
    id: 'q1',
    category: 'easy',
    titleHi: 'यदि आप ₹150 की 3 किताबें खरीदते हैं और दुकानदार को ₹500 का नोट देते हैं, तो आपको कितने रुपये वापस मिलेंगे?',
    titleEn: 'If you buy 3 books costing ₹150 each and hand a ₹500 note, how much change do you receive?',
    options: ['₹350', '₹50', '₹100', '₹150'],
    correctIndex: 1,
    explanationHi: '3 किताबों की कुल कीमत = 3 × 150 = ₹450। वापस मिलने वाली राशि = 500 - 450 = ₹50।',
    explanationEn: 'Total price of 3 books = 3 × 150 = ₹450. Change returned = 500 - 450 = ₹50.',
    hintHi: 'पहले तीनों किताबों की कुल कीमत निकालें, फिर 500 में से घटाएं।',
    hintEn: 'Calculate the total cost of books first, then subtract from 500.',
  },
  {
    id: 'q2',
    category: 'medium',
    titleHi: 'एक शर्ट का वास्तविक मूल्य ₹800 है। उस पर 25% की छूट (Discount) दी जाती है। ग्राहक को वह शर्ट कितने रुपये में मिलेगी?',
    titleEn: 'The original price of a shirt is ₹800. A discount of 25% is offered. What is the final selling price?',
    options: ['₹600', '₹650', '₹550', '₹700'],
    correctIndex: 0,
    explanationHi: 'छूट की राशि = 800 × 25/100 = ₹200। विक्रय मूल्य = 800 - 200 = ₹600।',
    explanationEn: 'Discount amount = 800 × 25/100 = ₹200. Final selling price = 800 - 200 = ₹600.',
    hintHi: '25% का मतलब 1/4 भाग होता है। 800 का 1/4 = 200।',
    hintEn: '25% equals 1/4th. 800 divided by 4 is 200.',
  },
  {
    id: 'q3',
    category: 'medium',
    titleHi: 'सरल कीजिए: (12 × 5) + (48 ÷ 6) - 15 = ?',
    titleEn: 'Simplify: (12 × 5) + (48 ÷ 6) - 15 = ?',
    options: ['51', '53', '55', '60'],
    correctIndex: 1,
    explanationHi: 'BODMAS नियम के अनुसार: (12 × 5) = 60; (48 ÷ 6) = 8; अतः 60 + 8 - 15 = 68 - 15 = 53।',
    explanationEn: 'Using BODMAS: (12 × 5) = 60; (48 ÷ 6) = 8; 60 + 8 - 15 = 68 - 15 = 53.',
    hintHi: 'BODMAS नियम का पालन करें: पहले कोष्ठक, फिर भाग, फिर गुणा, जोड़ और घटाव।',
    hintEn: 'Follow BODMAS order of operations: Parentheses, Division, Multiplication, Addition, Subtraction.',
  },
  {
    id: 'q4',
    category: 'hard',
    titleHi: 'समीकरण हल कीजिए: 4x + 18 = 50 में x का मान क्या होगा?',
    titleEn: 'Solve the equation: What is the value of x in 4x + 18 = 50?',
    options: ['6', '8', '7', '9'],
    correctIndex: 1,
    explanationHi: '4x = 50 - 18 ⇒ 4x = 32 ⇒ x = 32 / 4 = 8।',
    explanationEn: '4x = 50 - 18 ⇒ 4x = 32 ⇒ x = 32 / 4 = 8.',
    hintHi: '18 को दाईं तरफ ले जाकर 50 में से घटाएं, फिर 4 से भाग दें।',
    hintEn: 'Subtract 18 from 50, then divide by 4.',
  },
  {
    id: 'q5',
    category: 'word',
    titleHi: 'एक रेलगाड़ी 60 किमी/घंटा की गति से चल रही है। 180 किमी की दूरी तय करने में उसे कितना समय लगेगा?',
    titleEn: 'A train travels at a speed of 60 km/h. How much time does it take to cover 180 km?',
    options: ['2.5 घंटे', '3 घंटे', '3.5 घंटे', '4 घंटे'],
    correctIndex: 1,
    explanationHi: 'समय = दूरी / चाल = 180 / 60 = 3 घंटे।',
    explanationEn: 'Time = Distance / Speed = 180 / 60 = 3 hours.',
    hintHi: 'समय का सूत्र: समय = दूरी ÷ गति।',
    hintEn: 'Formula for time: Time = Distance ÷ Speed.',
  },
  {
    id: 'q6',
    category: 'mental',
    titleHi: 'संख्या श्रृंखला में अगला पद क्या होगा? 2, 6, 12, 20, 30, ?',
    titleEn: 'What is the next number in the sequence: 2, 6, 12, 20, 30, ?',
    options: ['40', '42', '44', '46'],
    correctIndex: 1,
    explanationHi: 'अंतर बढ़ रहा है: +4, +6, +8, +10, अगला अंतर +12 होगा। 30 + 12 = 42। (या n × (n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42)।',
    explanationEn: 'Differences are increasing by 2: +4, +6, +8, +10, next is +12. 30 + 12 = 42. (Or n × (n+1): 6 × 7 = 42).',
    hintHi: 'लगातार संख्याओं के बीच का अंतर देखें: 4, 6, 8, 10...',
    hintEn: 'Observe the gap between terms: +4, +6, +8, +10...',
  },
  {
    id: 'q7',
    category: 'easy',
    titleHi: 'एक आयत (Rectangle) की लंबाई 12 सेमी और चौड़ाई 8 सेमी है। इसका क्षेत्रफल (Area) कितना होगा?',
    titleEn: 'The length of a rectangle is 12 cm and width is 8 cm. What is its area?',
    options: ['80 सेमी²', '96 सेमी²', '100 सेमी²', '40 सेमी²'],
    correctIndex: 1,
    explanationHi: 'आयत का क्षेत्रफल = लंबाई × चौड़ाई = 12 × 8 = 96 सेमी²।',
    explanationEn: 'Area of rectangle = Length × Width = 12 × 8 = 96 cm².',
    hintHi: 'क्षेत्रफल निकालने के लिए लंबाई और चौड़ाई को गुणा करें।',
    hintEn: 'Multiply length by width.',
  },
  {
    id: 'q8',
    category: 'hard',
    titleHi: 'यदि A और B की आयु का अनुपात 3:4 है और उनकी आयु का योग 35 वर्ष है, तो B की आयु क्या है?',
    titleEn: 'If the ratio of ages of A and B is 3:4 and the sum of their ages is 35 years, what is B\'s age?',
    options: ['15 वर्ष', '20 वर्ष', '24 वर्ष', '18 वर्ष'],
    correctIndex: 1,
    explanationHi: 'कुल अनुपात = 3 + 4 = 7 भाग। 7 भाग = 35 वर्ष ⇒ 1 भाग = 5 वर्ष। B की आयु = 4 × 5 = 20 वर्ष।',
    explanationEn: 'Total ratio parts = 3 + 4 = 7. 7 parts = 35 ⇒ 1 part = 5. B\'s age = 4 × 5 = 20 years.',
    hintHi: 'अनुपातों को जोड़ें (3+4=7), 35 को 7 से विभाजित करें, फिर 4 से गुणा करें।',
    hintEn: 'Sum the ratio parts (3+4=7), divide 35 by 7, then multiply by 4.',
  },
];

interface MathLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageMode;
  onSendToChat?: (text: string) => void;
}

export const MathLabModal: React.FC<MathLabModalProps> = ({
  isOpen,
  onClose,
  language,
  onSendToChat,
}) => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'calc' | 'ai'>('quiz');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('deka_math_best_streak') || '0', 10);
  });
  const [answeredCount, setAnsweredCount] = useState<number>(0);

  // Calculator state
  const [calcInput, setCalcInput] = useState<string>('0');
  const [calcHistory, setCalcHistory] = useState<string[]>([]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    if (selectedCategory === 'all') return STATIC_MATH_QUESTIONS;
    return STATIC_MATH_QUESTIONS.filter((q) => q.category === selectedCategory);
  }, [selectedCategory]);

  const currentQ = filteredQuestions[currentIndex % filteredQuestions.length];

  const playerLevel = Math.floor(score / 40) + 1;
  const rankTitleHi =
    playerLevel >= 4
      ? 'क्वांटम जीनियस'
      : playerLevel === 3
      ? 'मैथ विज़ार्ड'
      : playerLevel === 2
      ? 'तेज़ गणितज्ञ'
      : 'गणित खोजकर्ता';
  const rankTitleEn =
    playerLevel >= 4
      ? 'Quantum Genius'
      : playerLevel === 3
      ? 'Math Wizard'
      : playerLevel === 2
      ? 'Speed Solver'
      : 'Math Explorer';
  const progressPercent = Math.min(
    100,
    Math.round(((currentIndex + (selectedOption !== null ? 1 : 0)) / filteredQuestions.length) * 100)
  );
  const accuracy = answeredCount > 0 ? Math.min(100, Math.round((Math.max(1, score / 12) / answeredCount) * 100)) : 100;

  if (!isOpen) return null;

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return; // Already answered
    setSelectedOption(idx);
    setShowExplanation(true);
    setAnsweredCount((prev) => prev + 1);

    if (idx === currentQ.correctIndex) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore((prev) => prev + 10 + newStreak * 2);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        localStorage.setItem('deka_math_best_streak', String(newStreak));
      }
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % filteredQuestions.length);
  };

  const handleResetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setShowHint(false);
    setScore(0);
    setStreak(0);
  };

  // Calculator Handlers
  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setCalcInput('0');
    } else if (val === 'DEL') {
      setCalcInput((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (val === '=') {
      try {
        const sanitized = calcInput
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/%/g, '/100')
          .replace(/[^0-9+\-*/.()]/g, '');
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${sanitized})`)();
        const resStr = Number.isFinite(result) ? String(Number(result.toFixed(6))) : 'Error';
        setCalcHistory((prev) => [`${calcInput} = ${resStr}`, ...prev.slice(0, 4)]);
        setCalcInput(resStr);
      } catch {
        setCalcInput('Error');
      }
    } else if (val === 'sqrt') {
      try {
        const num = parseFloat(calcInput);
        if (num >= 0) {
          const res = Math.sqrt(num);
          const resStr = String(Number(res.toFixed(6)));
          setCalcHistory((prev) => [`√(${calcInput}) = ${resStr}`, ...prev.slice(0, 4)]);
          setCalcInput(resStr);
        } else {
          setCalcInput('Error');
        }
      } catch {
        setCalcInput('Error');
      }
    } else if (val === 'sq') {
      try {
        const num = parseFloat(calcInput);
        const res = num * num;
        const resStr = String(Number(res.toFixed(6)));
        setCalcHistory((prev) => [`(${calcInput})² = ${resStr}`, ...prev.slice(0, 4)]);
        setCalcInput(resStr);
      } catch {
        setCalcInput('Error');
      }
    } else {
      setCalcInput((prev) => (prev === '0' || prev === 'Error' ? val : prev + val));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#080d19] border border-cyan-500/30 rounded-3xl shadow-[0_0_40px_rgba(0,240,255,0.25)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/20 bg-gradient-to-r from-[#0a1224] via-[#0f1d38] to-[#0a1224] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {language === 'hi' ? 'DEKA गणित लैब व सवाल' : 'DEKA Math Lab & Quiz'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  v2.5 Interactive
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'गणित के सवाल हल करें, स्कोर बनाएं और स्टेप-बाय-स्टेप सीखें'
                  : 'Solve interactive math problems with step-by-step solutions'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-cyan-500/15 bg-[#050811] px-4 pt-2 gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-[#0b1528] text-cyan-300 border-t border-x border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'hi' ? 'गणित क्विज़ (सवाल)' : 'Math Challenge'}</span>
          </button>

          <button
            onClick={() => setActiveTab('calc')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'calc'
                ? 'bg-[#0b1528] text-cyan-300 border-t border-x border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'hi' ? 'स्मार्ट कैलकुलेटर' : 'Smart Calculator'}</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'bg-[#0b1528] text-cyan-300 border-t border-x border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{language === 'hi' ? 'AI मैथ प्रॉम्प्ट्स' : 'AI Math Prompts'}</span>
          </button>
        </div>

        {/* Tab 1: Math Quiz / सवाल */}
        {activeTab === 'quiz' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* Cyber HUD Telemetry Console (Unique Futuristic Cockpit) */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#061122] via-[#091730] to-[#040812] border border-cyan-500/35 p-3.5 sm:p-4 shadow-[0_0_35px_rgba(0,240,255,0.18)]">
              {/* Background Cyber Grid Pattern */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.08]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(0, 240, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.4) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              />
              <div className="absolute top-0 right-0 w-44 h-24 bg-gradient-to-bl from-cyan-500/15 to-transparent blur-2xl pointer-events-none" />

              {/* Main Cockpit Stats Row */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                {/* Left: Player Neural Rank & Level Gauge */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    {/* Glowing Circular Level Core */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-500 p-0.5 shadow-[0_0_18px_rgba(0,240,255,0.4)]">
                      <div className="w-full h-full bg-[#080d19] rounded-[14px] flex flex-col items-center justify-center">
                        <span className="text-[9px] font-mono font-bold text-cyan-400 tracking-tighter uppercase leading-none">
                          LVL
                        </span>
                        <span className="text-base font-black font-mono text-white leading-none mt-0.5">
                          {playerLevel}
                        </span>
                      </div>
                    </div>
                    {streak > 1 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce">
                        ⚡
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-black text-white tracking-wide flex items-center gap-1.5">
                        <span className="text-cyan-400">Δ</span>
                        <span>{language === 'hi' ? rankTitleHi : rankTitleEn}</span>
                      </h4>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                        RANK {playerLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                      <span>XP: <strong className="text-cyan-300 font-bold">{score} pts</strong></span>
                      <span className="text-slate-600">|</span>
                      <span>{language === 'hi' ? 'बेस्ट स्ट्रीक' : 'Best'}: <strong className="text-amber-300 font-bold">{bestStreak}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right Telemetry: Live Combo Multiplier & Accuracy Counters */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {/* Streak Multiplier Reactor */}
                  <div
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${
                      streak >= 2
                        ? 'bg-gradient-to-r from-red-950/70 to-amber-950/70 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : streak === 1
                        ? 'bg-[#0a1528] border-cyan-500/30 text-cyan-300'
                        : 'bg-[#080d19]/80 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Flame className={`w-4 h-4 ${streak >= 2 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
                    <div className="text-left">
                      <p className="text-[9px] uppercase font-bold tracking-wider leading-none text-slate-400">
                        {streak >= 2 ? 'Active Combo' : language === 'hi' ? 'स्ट्रीक' : 'Streak'}
                      </p>
                      <p className="text-xs font-black font-mono mt-0.5">
                        {streak >= 2 ? (
                          <span className="text-amber-300 font-bold">{streak}x Multiplier 🔥</span>
                        ) : (
                          <span className="text-slate-200">{streak} {language === 'hi' ? 'लगातार' : 'In A Row'}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Accuracy Meter */}
                  <div className="px-3 py-1.5 rounded-xl bg-[#0a1528] border border-cyan-500/25 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-wider leading-none text-slate-400">
                        {language === 'hi' ? 'सटीकता' : 'Accuracy'}
                      </p>
                      <p className="text-xs font-black font-mono text-emerald-300 mt-0.5">
                        {accuracy}%
                      </p>
                    </div>
                  </div>

                  {/* Question Index Progress Counter */}
                  <div className="px-3 py-1.5 rounded-xl bg-[#0a1528] border border-cyan-500/25 flex items-center gap-2">
                    <Award className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-wider leading-none text-slate-400">
                        {language === 'hi' ? 'सवाल संख्या' : 'Question'}
                      </p>
                      <p className="text-xs font-black font-mono text-cyan-300 mt-0.5">
                        #{currentIndex + 1} / {filteredQuestions.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Progress Bar Strip with Micro Segments */}
              <div className="mt-3 pt-2.5 border-t border-cyan-500/15 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="h-1.5 w-full bg-[#050811] rounded-full overflow-hidden border border-cyan-500/20 p-0.5 flex items-center">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,240,255,0.8)]"
                      style={{ width: `${Math.max(5, progressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Micro Segment LED Indicators */}
                <div className="flex items-center gap-1">
                  {filteredQuestions.slice(0, 8).map((_, qIdx) => {
                    const isDone = qIdx < currentIndex || (qIdx === currentIndex && selectedOption !== null);
                    const isCurrent = qIdx === currentIndex && selectedOption === null;
                    return (
                      <span
                        key={qIdx}
                        className={`h-1.5 rounded-full transition-all ${
                          isDone
                            ? 'w-3 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                            : isCurrent
                            ? 'w-4 bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]'
                            : 'w-1.5 bg-slate-800'
                        }`}
                        title={`Question ${qIdx + 1}`}
                      />
                    );
                  })}
                </div>

                <span className="text-[10px] font-mono font-bold text-cyan-400">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-[11px]">
              {[
                { id: 'all', nameHi: 'सभी सवाल', nameEn: 'All Questions' },
                { id: 'easy', nameHi: 'आसान (Basic)', nameEn: 'Easy' },
                { id: 'medium', nameHi: 'मध्यम (प्रतिशत %)', nameEn: 'Medium' },
                { id: 'hard', nameHi: 'कठिन (समीकरण)', nameEn: 'Hard / Algebra' },
                { id: 'word', nameHi: 'व्यावहारिक (Word)', nameEn: 'Word Problems' },
                { id: 'mental', nameHi: 'दिमागी ट्रिक्स', nameEn: 'Mental Math' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentIndex(0);
                    setSelectedOption(null);
                    setShowExplanation(false);
                    setShowHint(false);
                  }}
                  className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {language === 'hi' ? cat.nameHi : cat.nameEn}
                </button>
              ))}
            </div>

            {/* Current Question Card (Futuristic Holographic Panel) */}
            {currentQ && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0c1830] via-[#091426] to-[#050b16] border border-cyan-500/30 p-4 sm:p-5 shadow-[0_0_30px_rgba(0,0,0,0.5)] space-y-4">
                {/* Cyber Corner Decals */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400/50" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400/50" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest">
                      SYS_EVAL_0{currentIndex + 1} · {currentQ.category.toUpperCase()}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 font-medium"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHint ? (language === 'hi' ? 'संकेत छिपाएं' : 'Hide Hint') : (language === 'hi' ? '💡 संकेत लें' : '💡 Hint')}</span>
                  </button>
                </div>

                {/* Hint Box */}
                {showHint && (
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                    <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300">{language === 'hi' ? 'संकेत (Hint):' : 'Hint:'}</strong>{' '}
                      {language === 'hi' ? currentQ.hintHi : currentQ.hintEn}
                    </div>
                  </div>
                )}

                {/* Question Title */}
                <div className="p-3.5 rounded-xl bg-[#060c18]/90 border border-cyan-500/20">
                  <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed tracking-wide">
                    {language === 'hi' ? currentQ.titleHi : currentQ.titleEn}
                  </h3>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQ.correctIndex;
                    let btnStyle = 'bg-[#060c18] border-cyan-500/20 text-slate-200 hover:border-cyan-400/60 hover:bg-cyan-950/30';

                    if (selectedOption !== null) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-950/70 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.35)]';
                      } else if (isSelected) {
                        btnStyle = 'bg-red-950/70 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
                      } else {
                        btnStyle = 'bg-[#060c18]/40 border-slate-800 text-slate-500 opacity-50';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={selectedOption !== null}
                        onClick={() => handleSelectOption(idx)}
                        className={`p-3.5 rounded-xl border text-left font-medium text-xs sm:text-sm transition-all flex items-center justify-between group active:scale-[0.98] ${btnStyle}`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-colors ${
                            selectedOption !== null && isCorrect
                              ? 'bg-emerald-500 text-black'
                              : selectedOption !== null && isSelected
                              ? 'bg-red-500 text-white'
                              : 'bg-slate-800 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="font-semibold">{opt}</span>
                        </span>

                        {selectedOption !== null && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-bounce" />
                        )}
                        {selectedOption !== null && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {showExplanation && (
                  <div
                    className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 animate-fadeIn ${
                      selectedOption === currentQ.correctIndex
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-2 text-cyan-300">
                      <BookOpen className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span>{language === 'hi' ? 'विस्तृत हल (Step-by-step Solution):' : 'Step-by-step Solution:'}</span>
                    </div>
                    <p className="font-sans leading-relaxed">{language === 'hi' ? currentQ.explanationHi : currentQ.explanationEn}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleResetQuiz}
                    className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'रीसेट' : 'Reset'}</span>
                  </button>

                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:brightness-110 text-black font-black text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all active:scale-95"
                  >
                    <span>{language === 'hi' ? 'अगला सवाल हल करें' : 'Next Question'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Smart Calculator */}
        {activeTab === 'calc' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            <div className="p-4 rounded-2xl bg-[#050811] border border-cyan-500/20 text-right space-y-2">
              <div className="text-[11px] text-slate-400 font-mono min-h-[16px] truncate">
                {calcHistory.length > 0 ? calcHistory[0] : (language === 'hi' ? 'गणना इतिहास यहाँ दिखेगा' : 'Calculation history appears here')}
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-300 tracking-wider overflow-x-auto scrollbar-none">
                {calcInput}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2 text-sm font-semibold">
              {[
                { label: 'C', val: 'C', color: 'bg-red-500/20 text-red-300 hover:bg-red-500/30' },
                { label: 'DEL', val: 'DEL', color: 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' },
                { label: '√x', val: 'sqrt', color: 'bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25' },
                { label: '÷', val: '÷', color: 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' },

                { label: '7', val: '7', color: 'bg-slate-800 text-slate-100 hover:bg-slate-700' },
                { label: '8', val: '8', color: 'bg-slate-800 text-slate-100 hover:bg-slate-700' },
                { label: '9', val: '9', color: 'bg-slate-800 text-slate-100 hover:bg-slate-700' },
                { label: '×', val: '×', color: 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' },

                { label: '4', val: '4', color: 'bg-slate-800 text-slate-100 hover:bg-slate-700' },
                { label: '5', val: '5', color: 'bg-slate-800 text-slate-100 hover:bg-slate-700' },
                { label: '6', val: '6', color: 'bg-slate-800 text-slate-100 hover:bg-slate-700' },
                { label: '-', val: '-', color: 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' },

                { label: '1', val: '1', color: 'bg-slate-800 text-slate-100 hover:bg-slate-700' },
                { label: '2', val: '2', color: 'bg-slate-800 text-slate-100 hover:bg-slate-700' },
                { label: '3', val: '3', color: 'bg-slate-800 text-slate-100 hover:bg-slate-700' },
                { label: '+', val: '+', color: 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' },

                { label: '0', val: '0', color: 'bg-slate-800 text-slate-100 hover:bg-slate-700' },
                { label: '.', val: '.', color: 'bg-slate-800 text-slate-100 hover:bg-slate-700' },
                { label: 'x²', val: 'sq', color: 'bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25' },
                { label: '=', val: '=', color: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold hover:brightness-110 shadow-[0_0_15px_rgba(0,240,255,0.4)]' },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={() => handleCalcClick(btn.val)}
                  className={`p-3 rounded-2xl transition-all active:scale-95 text-center flex items-center justify-center border border-cyan-500/15 ${btn.color}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Quick Math Shortcuts */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-400 mb-2">
                {language === 'hi' ? 'त्वरित सूत्र व गणना:' : 'Quick Shortcuts:'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setCalcInput('25 * 40')}
                  className="p-2 rounded-xl bg-[#080d1a] border border-cyan-500/20 text-slate-300 hover:text-cyan-300 text-left"
                >
                  25 × 40 (गुणनफल)
                </button>
                <button
                  onClick={() => setCalcInput('1500 * 0.18')}
                  className="p-2 rounded-xl bg-[#080d1a] border border-cyan-500/20 text-slate-300 hover:text-cyan-300 text-left"
                >
                  1500 का 18% GST
                </button>
                <button
                  onClick={() => setCalcInput('(120 - 90) / 90 * 100')}
                  className="p-2 rounded-xl bg-[#080d1a] border border-cyan-500/20 text-slate-300 hover:text-cyan-300 text-left"
                >
                  प्रतिशत लाभ / वृद्धि %
                </button>
                <button
                  onClick={() => setCalcInput('3.14159 * 10 * 10')}
                  className="p-2 rounded-xl bg-[#080d1a] border border-cyan-500/20 text-slate-300 hover:text-cyan-300 text-left"
                >
                  वृत्त का क्षेत्रफल (πr²)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: AI Math Prompts */}
        {activeTab === 'ai' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-purple-200 text-xs">
              <div className="flex items-center gap-2 font-bold mb-1">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>{language === 'hi' ? 'DEKA AI गणित गुरु' : 'DEKA AI Math Master'}</span>
              </div>
              <p>
                {language === 'hi'
                  ? 'नीचे दिए गए किसी भी प्रॉम्प्ट पर क्लिक करें। DEKA AI आपको तुरंत नए सवाल, ट्रिक और स्टेप-बाय-स्टेप हल प्रदान करेगा।'
                  : 'Tap any prompt below to ask DEKA AI for custom math questions, formulas, or tricky problems.'}
              </p>
            </div>

            <div className="space-y-2">
              {[
                {
                  titleHi: 'मुझे एक कठिन गणित का सवाल दो और उसका हल भी बताओ',
                  titleEn: 'Give me a challenging math problem with detailed solution',
                  badge: 'कठिन सवाल',
                },
                {
                  titleHi: 'लाभ-हानि और छूट (Profit, Loss & Discount) का एक व्यावहारिक सवाल दो',
                  titleEn: 'Give me a practical word problem on profit, loss and discount',
                  badge: 'व्यावहारिक',
                },
                {
                  titleHi: 'वैदिक गणित या दिमागी गणना की 3 सबसे तेज़ ट्रिक्स सिखाओ',
                  titleEn: 'Teach me 3 fastest mental math or Vedic math calculation tricks',
                  badge: 'शॉर्टकट ट्रिक्स',
                },
                {
                  titleHi: 'कक्षा 10वीं के स्तर का द्विघात समीकरण (Quadratic Equation) का सवाल दो',
                  titleEn: 'Give me a 10th grade quadratic equation problem to solve',
                  badge: 'समीकरण',
                },
                {
                  titleHi: 'समय और कार्य (Time & Work) का एक प्रतियोगी परीक्षा वाला सवाल दो',
                  titleEn: 'Give me a competitive exam question on Time and Work',
                  badge: 'परीक्षा स्तर',
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onClose();
                    if (onSendToChat) {
                      onSendToChat(language === 'hi' ? item.titleHi : item.titleEn);
                    }
                  }}
                  className="w-full p-3.5 rounded-2xl bg-[#080d1a] border border-cyan-500/20 hover:border-cyan-400/50 text-left transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/25">
                      {item.badge}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 group-hover:text-white font-medium">
                      {language === 'hi' ? item.titleHi : item.titleEn}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-[#050811] border-t border-cyan-500/15 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0 px-4">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Zap className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'ऑफलाइन व ऑनलाइन दोनों मोड में समर्थित' : 'Supports both offline and online modes'}</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
