# Implementation Plan: Cloud Run Deployment & Battery Time Synchronization Fixes

Resolve the Cloud Run publishing URL errors, add a dedicated Live Web Link & Deployment Management modal with APK export, and calibrate real-time battery drain/charging clock time calculations across the DEKA AI assistant.

---

## 1. Executive Summary

This plan addresses both user requests:
1. **Cloud Run Publishing & Live Public URL Resolution**:
   - Provide a persistent **Publishing & Live Links Hub** inside the app with instant access to the official live web application URLs (`Shared App URL`, `Development App URL`), direct Android Studio source project ZIP download (`/api/download-android-project`), and step-by-step guidance for Cloud Run custom domain / service verification.
   - Optimize `server.ts` and `package.json` production build configurations to ensure Cloud Run container health checks (`PORT`, `0.0.0.0` host binding, `/api/health`, and static asset serving) pass with zero errors.
2. **Battery Time Remaining & Clock Time Synchronization**:
   - Calibrate the real-time **Time to Full** and **Estimated Time Remaining** models in `src/components/BatteryUsageChart.tsx` and `src/components/SettingsModal.tsx` to automatically sync with the user's local timezone (12h/24h), dynamic battery drain rates, and Battery Saver bonus estimations.
   - Ensure the offline AI assistant and status bar consistently reflect the synchronized time remaining and full-charge target time.

---

## 2. Architecture & Domain Design

### Visual Design & Spatial Hierarchy (Mobile-First Touch Architecture)
Following the `frontend-design` constitution and mobile touch guidelines (`10_mobile_touch_apps.md`):
- **Publish & Share Hub**: An elegant modal (`PublishModal.tsx` / `ShareModal.tsx`) accessible from the top status header and the side drawer with:
  - Copyable production live URL (`https://ais-pre-s2ibwrhwxfbpzje2yg7f7e-227948008805.asia-east1.run.app`)
  - Direct 1-tap download trigger for the Android Studio Kotlin source project ZIP (`/api/download-android-project`)
  - Visual status pill showing Server Online / Cloud Run Ready with active green pulse
  - Step-by-step instructions for Android APK compilation via `./gradlew assembleRelease`
- **Battery & Time Calibrator**:
  - Calibrated time-to-full/remaining hero section in `BatteryUsageChart.tsx`
  - Zero-pill metadata design with high-contrast font typography (Plus Jakarta Sans and JetBrains Mono)
  - 44px minimum touch targets on all interactive buttons, copy actions, and range selectors

---

## 3. User Journey

1. **Viewing & Sharing the Live URL**:
   - User taps the new **"Publish & Share"** icon or drawer menu item in DEKA AI.
   - The modal reveals the active Public Live Web App URL, allowing 1-tap copying, QR code / quick-launch preview, and Android Studio project ZIP download.
2. **Deploying / Publishing without Errors**:
   - The Cloud Run service container boots cleanly with `PORT=8080` (or `process.env.PORT`), binds to `0.0.0.0`, responds to `/api/health` instantly, and serves the prebuilt Vite SPA assets from `/dist`.
3. **Checking Battery Time & System Clock**:
   - In Settings -> Battery Trends, the user sees calibrated metrics:
     - When charging: Exact time remaining until 100% full (e.g., `42 min`) and the projected clock completion time (e.g., `Full by ~02:05 PM Today`).
     - When discharging: Exact time remaining until depletion (e.g., `6 hr 15 min`) and target time (e.g., `Runs until ~07:35 PM Today`).
     - Real-time instant reaction when toggling Battery Saver mode.

---

## 4. Implementation Phases

### Phase 1: Cloud Run Production Serving & Health Endpoint Optimization
- Verify `server.ts` production fallback and static file serving from `dist/`:
  - Ensure `/api/health` always returns HTTP 200 with JSON payload for Cloud Run container liveness probes.
  - Verify `app.listen(PORT, '0.0.0.0')` handles dynamic ports injected by Cloud Run (`process.env.PORT`).
  - Add explicit Cache-Control headers for static assets while keeping `/index.html` non-cached for seamless updates.

### Phase 2: Live Links & Publish Management Modal (`PublishModal.tsx`)
- Create a dedicated `PublishModal.tsx` component in `src/components/`:
  - Displays the active public URL: `https://ais-pre-s2ibwrhwxfbpzje2yg7f7e-227948008805.asia-east1.run.app` with a "Copy Link" button.
  - Direct download card for `deka-ai-android-studio-project.zip` generated via `/api/download-android-project`.
  - Step-by-step instructions for Cloud Run deployment and building Android APK in Android Studio.
  - Integration with the side drawer (`Sidebar.tsx`) and header status bar.

### Phase 3: Battery Time Remaining & Timezone Calibration
- In `src/components/BatteryUsageChart.tsx`:
  - Refine the time calculations to eliminate edge-case NaN or infinite values on zero drain rate.
  - Synchronize clock calculations with `Intl.DateTimeFormat` using the active user device timezone and `is24Hour` format preference.
  - Display dual bilingual labels (Hindi & English) for full charge and battery drain projections.
- In `src/App.tsx`:
  - Connect `isPublishModalOpen` state and ensure header / sidebar actions trigger it.

---

## 5. Verification Plan

### Automated Checks
- Run `npm run lint` (`tsc --noEmit`) to verify 0 TypeScript errors.
- Run `compile_applet` (`npm run build`) to verify the production client build compiles cleanly.
- Verify server response via `curl http://localhost:3000/api/health`.

### User Verification Steps
1. Tap the **"Publish & Live URL"** button in DEKA AI:
   - Check that the public URL is displayed and can be copied in 1 tap.
   - Test downloading the Android project ZIP file.
2. Open **Settings -> Battery Usage Trends**:
   - Verify that **Time to Full** or **Estimated Time Remaining** shows realistic hours/minutes.
   - Verify that the target clock time matches the current system time plus estimated duration.
   - Toggle **Battery Saver** and observe immediate projection adjustment.
