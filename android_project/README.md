# DEKA AI — Android Studio Project (Kotlin & Jetpack Compose)

DEKA AI is a premium, futuristic Android AI assistant with an intelligent ChatGPT-like conversational experience, animated glowing AI orb, voice interaction in Hindi and English, Android app intent launching, document picker integration, and secure backend Gemini AI integration.

---

## 🚀 How to Open in Android Studio & Build Debug APK

### Prerequisites
- Android Studio Hedgehog (2023.1.1) or newer / Ladybug / Koala
- JDK 17 or higher
- Android SDK 35 (API 35) installed
- Device or Emulator running Android 8.0+ (API 26+)

### Step-by-Step Instructions:

1. **Open Project**:
   - Open Android Studio.
   - Click **Open** and select the `android_project` folder.
   - Android Studio will synchronize Gradle dependencies automatically.

2. **Configure Backend URL (Optional)**:
   - In `app/src/main/java/com/deka/ai/network/GeminiApiClient.kt`, configure your deployed DEKA backend URL:
     ```kotlin
     private val backendBaseUrl: String = "https://your-deployed-service.run.app"
     ```
   - *Note:* The API key remains strictly on the backend to avoid exposing secrets in the APK!

3. **Build the Debug APK**:
   - Open the **Terminal** tab in Android Studio (or your command prompt) and run:
     ```bash
     ./gradlew assembleDebug
     ```
   - On Windows:
     ```cmd
     gradlew.bat assembleDebug
     ```
   - Once the build succeeds, your installable APK will be generated at:
     ```
     app/build/outputs/apk/debug/app-debug.apk
     ```

4. **Install on Phone**:
   - Enable **Developer Options** and **USB Debugging** on your phone.
   - Run:
     ```bash
     adb install app/build/outputs/apk/debug/app-debug.apk
     ```
   - Or click the green **Run (▶)** button in Android Studio to launch directly on your connected phone or emulator!

---

## 📱 Features Implemented in Code:

1. **Futuristic Cyberpunk / Obsidian Dark Design**:
   - Deep navy background (`#080C14`), electric cyan (`#00F0FF`), glowing neon indigo accents.
   - Animated glowing canvas AI orb in Jetpack Compose (`DekaOrb.kt`) with radial pulses and particle orbits.

2. **Bilingual Conversational AI (Hindi & English)**:
   - ChatGPT-like messaging interface (`ChatScreen.kt`).
   - Natural Hindi (Devanagari / Hinglish) and English support.
   - Contextual chat history, response regeneration, copy to clipboard, and instant voice playback.

3. **Android Voice Assistant & Wake Phrase**:
   - `DekaVoiceManager.kt` leveraging Android `SpeechRecognizer` with multi-language packages (`hi-IN`, `en-IN`, `en-US`).
   - "Hey Deka" / "हे डेका" wake phrase detector.
   - Android `TextToSpeech` with speed, pitch, and locale control.

4. **Android App & Intent Integration**:
   - `AppLauncherHelper.kt` handles safe intent launching for WhatsApp, YouTube, Gmail, Maps, Camera, Phone dialer, and Chrome.
   - Document picker integration using Android Storage Access Framework (`ACTION_OPEN_DOCUMENT`).
   - Security: Sensitive actions prompt the user before execution.

5. **Settings & Privacy**:
   - Switch language (Automatic Hindi+English, Hindi primary, English primary).
   - Voice on/off switch, speech rate slider.
   - Chat history management (delete single chat, clear all).
   - Privacy disclosure and Android battery optimization guidance.
