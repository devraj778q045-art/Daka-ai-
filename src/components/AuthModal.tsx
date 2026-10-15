import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LanguageMode } from '../types/deka';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageMode;
  initialMode?: 'login' | 'signup' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  initialMode = 'login',
}) => {
  const { signUp, logIn, logInWithGoogle, resetPassword, authError, clearAuthError } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim()) {
      setLocalError(language === 'hi' ? 'कृपया ईमेल दर्ज करें' : 'Please enter your email');
      return;
    }

    if (mode !== 'reset' && !password) {
      setLocalError(language === 'hi' ? 'कृपया पासवर्ड दर्ज करें' : 'Please enter a password');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setLocalError(
          language === 'hi'
            ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए'
            : 'Password must be at least 6 characters'
        );
        return;
      }
      if (password !== confirmPassword) {
        setLocalError(
          language === 'hi' ? 'पासवर्ड मेल नहीं खा रहे हैं' : 'Passwords do not match'
        );
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        await signUp(email.trim(), password, displayName.trim(), phoneNumber.trim());
        onClose();
      } else if (mode === 'login') {
        await logIn(email.trim(), password);
        onClose();
      } else if (mode === 'reset') {
        await resetPassword(email.trim());
        setResetSent(true);
      }
    } catch (err: any) {
      // Handled by context authError or local error
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setLocalError(null);
    try {
      await logInWithGoogle();
      onClose();
    } catch (err) {
      // error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#080c14] border border-cyan-500/35 shadow-[0_0_60px_rgba(0,240,255,0.3)] overflow-hidden flex flex-col">
        {/* Glow Header Ambient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-cyan-500/20 via-blue-500/5 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between p-5 border-b border-cyan-500/15">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
                DEKA AI Account
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'hi'
                  ? 'क्लाउड सिंक और वैयक्तिकृत सेटिंग्स'
                  : 'Cloud sync & personalized settings'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle (Sign In / Sign Up) */}
        {mode !== 'reset' && (
          <div className="relative z-10 flex p-1.5 mx-5 mt-4 rounded-2xl bg-[#0b1528] border border-cyan-500/20 text-xs">
            <button
              onClick={() => {
                setMode('login');
                setLocalError(null);
                clearAuthError();
              }}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                mode === 'login'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'hi' ? 'लॉग इन (Log In)' : 'Sign In'}
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setLocalError(null);
                clearAuthError();
              }}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'hi' ? 'साइन अप (Sign Up)' : 'Create Account'}
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="relative z-10 p-5 space-y-4">
          {/* Error Banner */}
          {(localError || authError) && (
            <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{localError || authError}</span>
            </div>
          )}

          {/* Reset Sent Banner */}
          {resetSent && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold">Password Reset Email Sent!</p>
                <p className="text-[11px] text-emerald-300/80">
                  Check your inbox for a secure password reset link.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    {language === 'hi' ? 'आपका नाम (Optional)' : 'Your Name (Optional)'}
                  </label>
                  <div className="flex items-center bg-[#0b1528] border border-cyan-500/25 focus-within:border-cyan-400 rounded-2xl px-3 py-2.5 transition-colors">
                    <User className="w-4 h-4 text-slate-400 mr-2" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Devraj (देवराज)"
                      className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    {language === 'hi' ? 'मोबाइल नंबर (Optional)' : 'Mobile Phone Number (Optional)'}
                  </label>
                  <div className="flex items-center bg-[#0b1528] border border-cyan-500/25 focus-within:border-cyan-400 rounded-2xl px-3 py-2.5 transition-colors">
                    <Phone className="w-4 h-4 text-slate-400 mr-2" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                {language === 'hi' ? 'ईमेल पता' : 'Email Address'}
              </label>
              <div className="flex items-center bg-[#0b1528] border border-cyan-500/25 focus-within:border-cyan-400 rounded-2xl px-3 py-2.5 transition-colors">
                <Mail className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    {language === 'hi' ? 'पासवर्ड' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setResetSent(false);
                        setLocalError(null);
                        clearAuthError();
                      }}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      {language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot password?'}
                    </button>
                  )}
                </div>
                <div className="flex items-center bg-[#0b1528] border border-cyan-500/25 focus-within:border-cyan-400 rounded-2xl px-3 py-2.5 transition-colors">
                  <Lock className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  {language === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
                </label>
                <div className="flex items-center bg-[#0b1528] border border-cyan-500/25 focus-within:border-cyan-400 rounded-2xl px-3 py-2.5 transition-colors">
                  <Lock className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(0,240,255,0.45)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'signup'
                      ? language === 'hi'
                        ? 'खाता बनाएं'
                        : 'Sign Up'
                      : mode === 'login'
                      ? language === 'hi'
                        ? 'लॉग इन करें'
                        : 'Sign In'
                      : language === 'hi'
                      ? 'रीसेट लिंक भेजें'
                      : 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Back to Sign In from Reset */}
          {mode === 'reset' && (
            <button
              onClick={() => {
                setMode('login');
                setResetSent(false);
                setLocalError(null);
              }}
              className="w-full text-center text-xs text-cyan-400 hover:underline pt-1"
            >
              ← Back to Sign In
            </button>
          )}

          {/* Divider */}
          {mode !== 'reset' && (
            <>
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-cyan-500/15" />
                <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-cyan-500/15" />
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 rounded-2xl bg-[#0b1528] hover:bg-[#11203d] border border-cyan-500/20 text-white font-medium text-xs transition-all flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}

          {/* Privacy & Security Note */}
          <div className="pt-2 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted credentials via Firebase Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};
