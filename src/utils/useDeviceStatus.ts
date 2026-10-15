import { useState, useEffect, useCallback, useMemo } from 'react';

export interface DeviceBatteryInfo {
  level: number; // 0 - 100
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  isSupported: boolean;
}

export interface BatteryUsagePoint {
  timestamp: number;
  level: number; // 0 - 100
  charging: boolean;
}

export interface UserProfileInfo {
  name: string;
  phoneNumber: string;
  email: string;
}

export interface DeviceStatusHook {
  battery: DeviceBatteryInfo;
  timeString: string;
  timeWithSeconds: string;
  dateStringHi: string;
  dateStringEn: string;
  shortDateString: string;
  statusDateTimeString: string;
  timezone: string;
  is24Hour: boolean;
  setIs24Hour: (val: boolean) => void;
  userProfile: UserProfileInfo;
  updateUserProfile: (updates: Partial<UserProfileInfo>) => void;
  setManualBatteryLevel: (level: number) => void;
  batteryHistory: BatteryUsagePoint[];
  addBatteryPoint: (point: Omit<BatteryUsagePoint, 'timestamp'>) => void;
  resetBatteryHistory: () => void;
  simulateDrain: (pct?: number) => void;
  simulateCharge: (pct?: number) => void;
}

const STORAGE_KEY_PROFILE = 'deka_user_profile_v1';
const STORAGE_KEY_BATTERY_OVERRIDE = 'deka_battery_override';
const STORAGE_KEY_TIME_FORMAT_24H = 'deka_time_format_24h';
const STORAGE_KEY_BATTERY_HISTORY = 'deka_battery_history_v1';

// Seed realistic 24-hour history data points if none exists
function generateInitialBatteryHistory(currentLevel: number, isCharging: boolean): BatteryUsagePoint[] {
  const points: BatteryUsagePoint[] = [];
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  // Let's create a realistic 24-hour curve ending at currentLevel
  // e.g. 24h ago started around 95%, drained to 40% 12h ago, charged to 98% 8h ago, drained to currentLevel
  const profileSteps = [
    { hoursAgo: 24, level: 96, charging: false },
    { hoursAgo: 21, level: 88, charging: false },
    { hoursAgo: 18, level: 76, charging: false },
    { hoursAgo: 15, level: 62, charging: false },
    { hoursAgo: 13, level: 48, charging: false },
    { hoursAgo: 11, level: 38, charging: true },
    { hoursAgo: 9, level: 75, charging: true },
    { hoursAgo: 8, level: 95, charging: false },
    { hoursAgo: 6, level: 90, charging: false },
    { hoursAgo: 4, level: 82, charging: false },
    { hoursAgo: 2, level: Math.min(100, currentLevel + 5), charging: false },
    { hoursAgo: 0, level: currentLevel, charging: isCharging },
  ];

  for (const step of profileSteps) {
    points.push({
      timestamp: now - step.hoursAgo * oneHour,
      level: Math.max(5, Math.min(100, step.level)),
      charging: step.charging,
    });
  }

  return points.sort((a, b) => a.timestamp - b.timestamp);
}

export function useDeviceStatus(initialEmail?: string, initialDisplayName?: string): DeviceStatusHook {
  // 1. User Profile State (Local-first persistence)
  const [userProfile, setUserProfileState] = useState<UserProfileInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || initialDisplayName || 'देवराज (Devraj)',
          phoneNumber: parsed.phoneNumber || '+91 98765 43210',
          email: parsed.email || initialEmail || 'devraj778q045@gmail.com',
        };
      }
    } catch {
      // ignore
    }
    return {
      name: initialDisplayName || 'देवराज (Devraj)',
      phoneNumber: '+91 98765 43210',
      email: initialEmail || 'devraj778q045@gmail.com',
    };
  });

  // Sync if initialDisplayName or email changes from auth
  useEffect(() => {
    if (initialEmail || initialDisplayName) {
      setUserProfileState((prev) => {
        const updated = {
          ...prev,
          name: initialDisplayName && (prev.name === 'देवराज (Devraj)' || !prev.name) ? initialDisplayName : prev.name,
          email: initialEmail || prev.email,
        };
        try {
          localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, [initialEmail, initialDisplayName]);

  const updateUserProfile = useCallback((updates: Partial<UserProfileInfo>) => {
    setUserProfileState((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save user profile to localStorage', e);
      }
      return next;
    });
  }, []);

  // 2. Battery State
  const [battery, setBattery] = useState<DeviceBatteryInfo>(() => {
    let fallbackLevel = 88;
    try {
      const savedOverride = localStorage.getItem(STORAGE_KEY_BATTERY_OVERRIDE);
      if (savedOverride) fallbackLevel = Number(savedOverride);
    } catch {}
    return {
      level: fallbackLevel,
      charging: false,
      chargingTime: 0,
      dischargingTime: 0,
      isSupported: false,
    };
  });

  // 3. Battery History State
  const [batteryHistory, setBatteryHistory] = useState<BatteryUsagePoint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BATTERY_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return generateInitialBatteryHistory(88, false);
  });

  const saveHistory = useCallback((points: BatteryUsagePoint[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_BATTERY_HISTORY, JSON.stringify(points.slice(-100)));
    } catch {}
  }, []);

  const addBatteryPoint = useCallback((point: Omit<BatteryUsagePoint, 'timestamp'>) => {
    setBatteryHistory((prev) => {
      const now = Date.now();
      // avoid dupes within 60s unless status changed
      const last = prev[prev.length - 1];
      if (last && now - last.timestamp < 60000 && last.level === point.level && last.charging === point.charging) {
        return prev;
      }
      const updated = [...prev, { ...point, timestamp: now }].slice(-100);
      saveHistory(updated);
      return updated;
    });
  }, [saveHistory]);

  const resetBatteryHistory = useCallback(() => {
    const fresh = generateInitialBatteryHistory(battery.level, battery.charging);
    setBatteryHistory(fresh);
    saveHistory(fresh);
  }, [battery.level, battery.charging, saveHistory]);

  const setManualBatteryLevel = useCallback((level: number) => {
    const clamped = Math.max(1, Math.min(100, Math.round(level)));
    setBattery((prev) => {
      const next = { ...prev, level: clamped };
      addBatteryPoint({ level: clamped, charging: prev.charging });
      return next;
    });
    try {
      localStorage.setItem(STORAGE_KEY_BATTERY_OVERRIDE, String(clamped));
    } catch {}
  }, [addBatteryPoint]);

  const simulateDrain = useCallback((pct: number = 5) => {
    setBattery((prev) => {
      const nextLevel = Math.max(1, prev.level - pct);
      const next = { ...prev, level: nextLevel, charging: false };
      addBatteryPoint({ level: nextLevel, charging: false });
      try {
        localStorage.setItem(STORAGE_KEY_BATTERY_OVERRIDE, String(nextLevel));
      } catch {}
      return next;
    });
  }, [addBatteryPoint]);

  const simulateCharge = useCallback((pct: number = 10) => {
    setBattery((prev) => {
      const nextLevel = Math.min(100, prev.level + pct);
      const next = { ...prev, level: nextLevel, charging: true };
      addBatteryPoint({ level: nextLevel, charging: true });
      try {
        localStorage.setItem(STORAGE_KEY_BATTERY_OVERRIDE, String(nextLevel));
      } catch {}
      return next;
    });
  }, [addBatteryPoint]);

  // Hook into navigator.getBattery if supported
  useEffect(() => {
    let batteryObj: any = null;

    const handleLevelChange = () => {
      if (batteryObj) {
        const pct = Math.round(batteryObj.level * 100);
        setBattery((prev) => {
          const next = {
            ...prev,
            level: pct,
            charging: Boolean(batteryObj.charging),
            chargingTime: batteryObj.chargingTime || 0,
            dischargingTime: batteryObj.dischargingTime || 0,
            isSupported: true,
          };
          addBatteryPoint({ level: pct, charging: Boolean(batteryObj.charging) });
          return next;
        });
      }
    };

    const handleChargingChange = () => {
      if (batteryObj) {
        setBattery((prev) => {
          const next = {
            ...prev,
            charging: Boolean(batteryObj.charging),
            level: Math.round(batteryObj.level * 100),
            isSupported: true,
          };
          addBatteryPoint({ level: Math.round(batteryObj.level * 100), charging: Boolean(batteryObj.charging) });
          return next;
        });
      }
    };

    if (typeof navigator !== 'undefined' && typeof (navigator as any).getBattery === 'function') {
      (navigator as any)
        .getBattery()
        .then((bat: any) => {
          batteryObj = bat;
          const liveLevel = Math.round(bat.level * 100);
          setBattery({
            level: liveLevel,
            charging: Boolean(bat.charging),
            chargingTime: bat.chargingTime || 0,
            dischargingTime: bat.dischargingTime || 0,
            isSupported: true,
          });
          addBatteryPoint({ level: liveLevel, charging: Boolean(bat.charging) });

          bat.addEventListener('levelchange', handleLevelChange);
          bat.addEventListener('chargingchange', handleChargingChange);
        })
        .catch((err: any) => {
          console.warn('Web Battery API not accessible:', err);
        });
    }

    return () => {
      if (batteryObj) {
        try {
          batteryObj.removeEventListener('levelchange', handleLevelChange);
          batteryObj.removeEventListener('chargingchange', handleChargingChange);
        } catch {}
      }
    };
  }, [addBatteryPoint]);

  // Periodic battery logging (every 10 minutes)
  useEffect(() => {
    const timer = setInterval(() => {
      addBatteryPoint({ level: battery.level, charging: battery.charging });
    }, 10 * 60 * 1000);
    return () => clearInterval(timer);
  }, [battery.level, battery.charging, addBatteryPoint]);

  // 4. Time Format (12h vs 24h toggle)
  const [is24Hour, setIs24HourState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TIME_FORMAT_24H);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return false; // Default to 12h format
  });

  const setIs24Hour = useCallback((val: boolean) => {
    setIs24HourState(val);
    try {
      localStorage.setItem(STORAGE_KEY_TIME_FORMAT_24H, JSON.stringify(val));
    } catch {}
  }, []);

  // 5. Clock State
  const [clockDate, setClockDate] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setClockDate(new Date());
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeString = useMemo(() => {
    return clockDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !is24Hour,
    });
  }, [clockDate, is24Hour]);

  const timeWithSeconds = useMemo(() => {
    return clockDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !is24Hour,
    });
  }, [clockDate, is24Hour]);

  const dateStringHi = useMemo(() => {
    return clockDate.toLocaleDateString('hi-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [clockDate]);

  const dateStringEn = useMemo(() => {
    return clockDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [clockDate]);

  const shortDateString = useMemo(() => {
    return clockDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }, [clockDate]);

  // Status Bar Combined String: "Wed, Oct 14 • 2:38 PM" or "Wed, Oct 14 • 14:38"
  const statusDateTimeString = useMemo(() => {
    return `${shortDateString} • ${timeString}`;
  }, [shortDateString, timeString]);

  const timezone = useMemo(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'IST (Local)';
  }, []);

  return {
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
    userProfile,
    updateUserProfile,
    setManualBatteryLevel,
    batteryHistory,
    addBatteryPoint,
    resetBatteryHistory,
    simulateDrain,
    simulateCharge,
  };
}
