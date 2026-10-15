import React, { useState } from 'react';
import {
  Download,
  FolderArchive,
  FileCode,
  Terminal,
  Smartphone,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { LanguageMode } from '../types/deka';

interface AndroidProjectHubProps {
  language: LanguageMode;
}

const ANDROID_FILES: { path: string; name: string; type: string; snippet: string }[] = [
  {
    path: 'android_project/app/src/main/java/com/deka/ai/MainActivity.kt',
    name: 'MainActivity.kt',
    type: 'kotlin',
    snippet: `package com.deka.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.deka.ai.ui.theme.DEKAAITheme
import com.deka.ai.ui.components.OrbState
import com.deka.ai.voice.DekaVoiceManager
import com.deka.ai.network.GeminiApiClient

class MainActivity : ComponentActivity() {
    private lateinit var voiceManager: DekaVoiceManager
    private val apiClient = GeminiApiClient()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        initVoiceManager()
        setContent {
            DEKAAITheme {
                // Crossfade navigation across Home, Chat, Voice, Apps, Settings
            }
        }
    }
}`,
  },
  {
    path: 'android_project/app/src/main/java/com/deka/ai/auth/FirebaseAuthManager.kt',
    name: 'FirebaseAuthManager.kt',
    type: 'kotlin',
    snippet: `package com.deka.ai.auth

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

class FirebaseAuthManager {
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()

    suspend fun signUpWithEmail(email: String, pass: String): Result<FirebaseUser> { ... }
    suspend fun signInWithEmail(email: String, pass: String): Result<FirebaseUser> { ... }
    suspend fun sendPasswordReset(email: String): Result<Unit> { ... }
    suspend fun syncChatSession(id: String, title: String, messages: List<...>): Result<Unit> { ... }
}`,
  },
  {
    path: 'android_project/app/src/main/java/com/deka/ai/ui/components/DekaOrb.kt',
    name: 'DekaOrb.kt',
    type: 'kotlin',
    snippet: `package com.deka.ai.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush

enum class OrbState { IDLE, LISTENING, THINKING, SPEAKING }

@Composable
fun DekaOrb(state: OrbState = OrbState.IDLE, size: Dp = 220.dp) {
    // Jetpack Compose Canvas with dynamic radial gradients, 
    // plasma particles, and frequency ripple waves
}`,
  },
  {
    path: 'android_project/app/src/main/java/com/deka/ai/voice/DekaVoiceManager.kt',
    name: 'DekaVoiceManager.kt',
    type: 'kotlin',
    snippet: `package com.deka.ai.voice

import android.content.Context
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech

class DekaVoiceManager(
    private val context: Context,
    private val onSpeechResult: (String) -> Unit,
    private val onWakeWordDetected: () -> Unit
) : RecognitionListener, TextToSpeech.OnInitListener {
    // Android SpeechRecognizer (Hindi hi-IN & English en-IN/US)
    // "Hey Deka" wake-phrase listener + Android TextToSpeech
}`,
  },
  {
    path: 'android_project/app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    type: 'xml',
    snippet: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.deka.ai">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:label="@string/app_name"
        android:theme="@style/Theme.DEKAAI">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
  },
  {
    path: 'android_project/app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    type: 'gradle',
    snippet: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.deka.ai"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.deka.ai"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }
    buildFeatures { compose = true }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.05.00"))
    implementation("androidx.compose.material3:material3:1.2.1")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
}`,
  },
];

export const AndroidProjectHub: React.FC<AndroidProjectHubProps> = ({ language }) => {
  const [selectedFile, setSelectedFile] = useState(ANDROID_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/download-android-project');
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'deka-ai-android-studio-project.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert('Could not download zip. Ensure server is running.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 bg-[#080c14] space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#0b1528] to-blue-950/30 border border-cyan-500/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_35px_rgba(0,240,255,0.15)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/40 uppercase">
              Kotlin • Jetpack Compose • API 35
            </span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Project Generated
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            DEKA AI Android Studio Source & APK Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            {language === 'hi'
              ? 'पूर्ण कोटलिन और जेटपैक कंपोज़ कोडबेस। आप पूरे प्रोजेक्ट की .ZIP फाइल डाउनलोड कर सकते हैं और सीधे एंड्रॉइड स्टूडियो में बिल्ड कर सकते हैं।'
              : 'Complete native Android Studio project with clean architecture, voice assistant services, intents, and build scripts.'}
          </p>
        </div>

        {/* Big Download Button */}
        <button
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs sm:text-sm transition-all shadow-[0_0_25px_rgba(0,240,255,0.5)] disabled:opacity-50 hover:scale-105 active:scale-95"
        >
          <FolderArchive className="w-5 h-5" />
          <span>
            {isDownloading
              ? 'Packing Project ZIP...'
              : language === 'hi'
              ? 'प्रोजेक्ट डाउनलोड करें (.ZIP)'
              : 'Download Project ZIP'}
          </span>
        </button>
      </div>

      {/* Build & Run Instructions Card */}
      <div className="rounded-3xl bg-[#0b1528] border border-cyan-500/20 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          {language === 'hi' ? 'एंड्रॉइड स्टूडियो में Debug APK कैसे बनाएं' : 'How to Build & Run Debug APK'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#080c14] border border-cyan-500/15">
            <span className="text-[10px] font-bold text-cyan-400 uppercase">Step 1</span>
            <h4 className="font-semibold text-white mt-1">Open in Android Studio</h4>
            <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
              Extract the zip and open the <code className="text-cyan-300">android_project</code> folder in Android Studio Hedgehog or newer.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#080c14] border border-cyan-500/15">
            <span className="text-[10px] font-bold text-cyan-400 uppercase">Step 2</span>
            <h4 className="font-semibold text-white mt-1">Run Gradle Build</h4>
            <div className="bg-black/60 p-2 rounded-lg font-mono text-[11px] text-cyan-300 mt-1 select-all">
              ./gradlew assembleDebug
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#080c14] border border-cyan-500/15">
            <span className="text-[10px] font-bold text-cyan-400 uppercase">Step 3</span>
            <h4 className="font-semibold text-white mt-1">Install on Phone</h4>
            <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
              APK output at <code className="text-cyan-300">app-debug.apk</code>. Run <code className="text-cyan-300">adb install</code> or hit Run (▶).
            </p>
          </div>
        </div>
      </div>

      {/* Code Browser */}
      <div className="rounded-3xl bg-[#0b1528] border border-cyan-500/20 overflow-hidden">
        <div className="p-4 border-b border-cyan-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Kotlin Source Inspector
            </span>
          </div>

          {/* File selector pill */}
          <div className="flex flex-wrap gap-1.5">
            {ANDROID_FILES.map((file) => (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
                  selectedFile.name === file.name
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'bg-[#080c14] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {file.name}
              </button>
            ))}
          </div>
        </div>

        {/* Code Viewport */}
        <div className="p-4 bg-[#080c14] relative">
          <div className="flex items-center justify-between pb-2 text-[11px] text-slate-500 font-mono border-b border-slate-900 mb-2">
            <span>{selectedFile.path}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-2 leading-relaxed">
            <code>{selectedFile.snippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
