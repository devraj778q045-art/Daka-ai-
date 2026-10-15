import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  sendPasswordReset,
  logoutUser,
  getUserProfile,
  saveUserProfile,
  StoredUserProfile,
  testConnection,
} from '../services/firebase';
import { LanguageMode, ThemeMode } from '../types/deka';

interface AuthContextType {
  currentUser: User | null;
  userProfile: StoredUserProfile | null;
  loading: boolean;
  authError: string | null;
  isOnline: boolean;
  signUp: (email: string, pass: string, name?: string, phone?: string) => Promise<void>;
  logIn: (email: string, pass: string) => Promise<void>;
  logInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logOut: () => Promise<void>;
  updateUserPreferences: (prefs: {
    language?: LanguageMode;
    theme?: ThemeMode;
    ttsEnabled?: boolean;
    speechRate?: number;
    batterySaver?: boolean;
    displayName?: string;
    phoneNumber?: string;
  }) => Promise<void>;
  updateUserProfileDetails: (details: { displayName?: string; phoneNumber?: string }) => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<StoredUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Test connection on boot and listen to network online/offline events
  useEffect(() => {
    const updateOnlineStatus = () => {
      const navOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      setIsOnline(navOnline);
      if (navOnline) {
        testConnection().then((connected) => setIsOnline(connected));
      }
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Listen to Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (err) {
          console.warn('Could not fetch user profile on auth change:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const clearAuthError = () => setAuthError(null);

  const signUp = async (email: string, pass: string, name?: string, phone?: string) => {
    setAuthError(null);
    try {
      const user = await registerWithEmail(email, pass, name, phone);
      setCurrentUser(user);
      if (phone) {
        setUserProfile((prev) => (prev ? { ...prev, phoneNumber: phone } : null));
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to create account');
      throw err;
    }
  };

  const logIn = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const user = await loginWithEmail(email, pass);
      setCurrentUser(user);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign in');
      throw err;
    }
  };

  const logInWithGoogle = async () => {
    setAuthError(null);
    try {
      const user = await loginWithGoogle();
      setCurrentUser(user);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign in with Google');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordReset(email);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send password reset email');
      throw err;
    }
  };

  const logOut = async () => {
    setAuthError(null);
    try {
      await logoutUser();
      setCurrentUser(null);
      setUserProfile(null);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign out');
      throw err;
    }
  };

  const updateUserPreferences = async (prefs: {
    language?: LanguageMode;
    theme?: ThemeMode;
    ttsEnabled?: boolean;
    speechRate?: number;
    batterySaver?: boolean;
    displayName?: string;
    phoneNumber?: string;
  }) => {
    if (!currentUser) return;
    try {
      await saveUserProfile(currentUser.uid, prefs);
      setUserProfile((prev) => (prev ? { ...prev, ...prefs } : null));
    } catch (err) {
      console.warn('Failed to update user preferences in Firestore:', err);
    }
  };

  const updateUserProfileDetails = async (details: { displayName?: string; phoneNumber?: string }) => {
    if (!currentUser) return;
    try {
      await saveUserProfile(currentUser.uid, details);
      setUserProfile((prev) => (prev ? { ...prev, ...details } : null));
    } catch (err) {
      console.warn('Failed to update user profile in Firestore:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        authError,
        isOnline,
        signUp,
        logIn,
        logInWithGoogle,
        resetPassword,
        logOut,
        updateUserPreferences,
        updateUserProfileDetails,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
