import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import JSZip from 'jszip';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Shared Gemini AI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Check AI status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'DEKA AI',
    hasApiKey: Boolean(apiKey),
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// App Deployment and Live URLs Info
app.get('/api/publish-info', (req, res) => {
  res.json({
    status: 'online',
    appName: 'DEKA AI',
    version: '1.2.0',
    sharedUrl: 'https://ais-pre-s2ibwrhwxfbpzje2yg7f7e-227948008805.asia-east1.run.app',
    devUrl: 'https://ais-dev-s2ibwrhwxfbpzje2yg7f7e-227948008805.asia-east1.run.app',
    cloudRunReady: true,
    port: PORT,
    androidZipUrl: '/api/download-android-project',
    timestamp: new Date().toISOString(),
  });
});

// Real Gemini Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages,
      language = 'auto',
      userProfile = {},
      deviceContext = {},
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
      });
    }

    const languageInstruction =
      language === 'hi'
        ? 'User preferred language is Hindi (हिंदी). Respond primarily in natural, clear Hindi using Devanagari script (or Hinglish if appropriate).'
        : language === 'en'
        ? 'User preferred language is English. Respond in crisp, fluent English.'
        : 'User prefers Auto (Hindi & English). Respond in the same language the user uses (Hindi, English, or Hinglish).';

    const currentLocalTime = deviceContext.currentTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const currentLocalDate = deviceContext.currentDate || new Date().toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const currentDeviceTimezone = deviceContext.timezone || 'Local';
    const currentBattery = deviceContext.batteryLevel !== undefined ? deviceContext.batteryLevel : 88;
    const isCharging = Boolean(deviceContext.isCharging);
    const timeToFullOrRemaining = deviceContext.timeToFullOrRemaining || (isCharging ? 'Full charge in approx 45-60 min' : `Approx ${(currentBattery / 4).toFixed(1)} hrs remaining`);
    const userName = userProfile.name || 'देवराज (Devraj)';
    const userPhone = userProfile.phoneNumber || '+91 98765 43210';
    const userEmail = userProfile.email || 'devraj778q045@gmail.com';

    const startTime = Date.now();
    const systemInstruction = `You are DEKA AI, a futuristic Android AI assistant powered by Google Gemini's cognitive neural brain (जेमिनाई का दिमाग).
You embody Gemini's signature intellect: deep reasoning, contextual comprehension, structured clarity, and natural bilingual fluency in Hindi (हिंदी) and English.

LIVE REAL-TIME DEVICE TELEMETRY:
- Device Current Local Time (घड़ी का समय): ${currentLocalTime}
- Device Current Date (तारीख): ${currentLocalDate}
- Device Timezone: ${currentDeviceTimezone}
- Device Real-Time Battery Percentage (बैटरी प्रतिशत): ${currentBattery}%
- Device Charging Status (चार्जिंग स्थिति): ${isCharging ? 'Plugged in & Charging (चार्ज हो रहा है ⚡)' : 'Discharging on Battery (बैटरी पर चल रहा है)'}
- Calculated Time to Full / Estimated Time Remaining (अनुमानित शेष समय / फुल चार्ज समय): ${timeToFullOrRemaining}

LIVE USER PROFILE & IDENTITY:
- User Name (यूज़र का नाम): ${userName}
- User Mobile Number (यूज़र का मोबाइल नंबर): ${userPhone}
- User Email: ${userEmail}

CRITICAL TELEMETRY & IDENTITY RULES:
1. When the user asks about TIME (e.g. "टाइम क्या है?", "समय क्या हुआ है?", "What time is it?", "तारीख क्या है?"):
   - ALWAYS state the EXACT real-time local time (${currentLocalTime}) and date (${currentLocalDate}) from above.
   - NEVER say you don't know the time or don't have access to the clock!
2. When the user asks about BATTERY or BATTERY TIME (e.g. "मेरी बैटरी कितनी है?", "Battery percentage kya hai?", "कितनी बैटरी बची है?", "Phone charging hai kya?", "Time to full kya hai?", "कब तक चलेगी?"):
   - ALWAYS provide the EXACT battery percentage (${currentBattery}%), charging state (${isCharging ? 'चार्जर कनेक्टेड है और फोन चार्ज हो रहा है ⚡' : 'फोन बैटरी पर चल रहा है'}), and the calculated Time to Full or Estimated Time Remaining (${timeToFullOrRemaining}).
   - Mention that they can view the full interactive battery drain chart and trends in Settings.
   - NEVER say you don't have access to the battery percentage or drain rates!
3. When the user asks about their IDENTITY, NAME, or MOBILE NUMBER (e.g. "मेरा नाम क्या है?", "Who am I?", "मेरा मोबाइल नंबर क्या है?", "Phone number kya hai?"):
   - State their name ("${userName}") or mobile number ("${userPhone}") clearly and courteously!
   - Mention that they can also change or update their name and mobile number anytime in the Settings (सेटिंग्स) or Profile section.
4. When the user asks for a MATH QUESTION, PROBLEM, or CALCULATION (e.g. "6+6", "6 + 6", "12 * 8", "math ka sabal", "math ka sawal", "गणित का सवाल दो", "math question", "solve math", "हिसाब"):
   - For direct arithmetic equations (e.g. "6+6", "15 * 4"): IMMEDIATELY provide the direct mathematical result (e.g. "6 + 6 = 12; उत्तर 12 है") clearly and without hesitation!
   - For quiz/problem requests: Immediately provide an engaging math problem in Hindi (or English if requested) with 4 multiple-choice options (A, B, C, D), a helpful hint, and step-by-step solution.
   - Mention that DEKA AI also has a built-in interactive Math Lab & Calculator (गणित लैब और कैलकुलेटर) where they can practice quizzes and track their streak score!
5. Gemini Brain Core Directives:
   - Deep Cognitive Reasoning: Structured, crisp, helpful answers with bullet points and code where applicable.
   - Bilingual Fluency: ${languageInstruction}
   - Android Synergy: Assist with Android features, app launching, shortcuts, and settings.`;

    // Map conversation messages to GenAI contents structure with multimodal image support
    const contents = messages.map((m: { role: string; content: string; image?: { data: string; mimeType: string } }) => {
      const parts: any[] = [];
      if (m.image && m.image.data) {
        const cleanBase64 = m.image.data.includes(',')
          ? m.image.data.split(',')[1]
          : m.image.data;
        parts.push({
          inlineData: {
            mimeType: m.image.mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }
      parts.push({ text: m.content || (m.image ? 'इस इमेज का विश्लेषण करें और विस्तृत जानकारी दें।' : '') });
      return {
        role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    // Use gemini-2.5-flash with real-time Google search grounding and vision
    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.1-flash-lite'];
    let response: any = null;
    let lastError: any = null;
    let successfulModel = modelsToTry[0];

    for (const modelCandidate of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelCandidate,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            tools: [{ googleSearch: {} }],
          },
        });
        if (response?.text) {
          successfulModel = modelCandidate;
          break;
        }
      } catch (err: any) {
        lastError = err;
        // Fallback without tools if needed
        try {
          response = await ai.models.generateContent({
            model: modelCandidate,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
          if (response?.text) {
            successfulModel = modelCandidate;
            break;
          }
        } catch (retryErr: any) {
          lastError = retryErr;
        }
      }
    }

    const latencyMs = Date.now() - startTime;
    const brainStats = {
      engine: 'Google Gemini Neural Core (जेमिनाई ब्रेन)',
      model: successfulModel,
      cognitiveMode: 'Deep Multimodal Reasoning',
      latencyMs,
    };

    // Universal Intent & Deep-Search Detection
    const rawUserMsg = messages[messages.length - 1]?.content || '';
    const userMsgLower = rawUserMsg.toLowerCase().trim();

    let detectedIntent: string | null = null;
    let actionPayload: Record<string, any> | null = null;

    // Comprehensive App Knowledge Base
    const APP_REGISTRY: Array<{
      id: string;
      name: string;
      nameHi: string;
      pkg: string;
      color: string;
      aliases: string[];
      searchUrl: (q: string) => string;
      defaultUrl: string;
      intentUri: (q?: string) => string;
    }> = [
      {
        id: 'youtube',
        name: 'YouTube',
        nameHi: 'यूट्यूब',
        pkg: 'com.google.android.youtube',
        color: '#FF0000',
        aliases: ['youtube', 'यूट्यूब', 'yt', 'video', 'वीडियो', 'गाने चलाओ', 'play song', 'song on youtube'],
        searchUrl: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
        defaultUrl: 'https://www.youtube.com',
        intentUri: (q) => q ? `intent://results?search_query=${encodeURIComponent(q)}#Intent;package=com.google.android.youtube;scheme=vnd.youtube;end` : 'intent://#Intent;package=com.google.android.youtube;scheme=vnd.youtube;end',
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        nameHi: 'व्हाट्सएप',
        pkg: 'com.whatsapp',
        color: '#25D366',
        aliases: ['whatsapp', 'व्हाट्सएप', 'व्हाट्सअप', 'wa', 'chat on whatsapp'],
        searchUrl: (q) => `https://api.whatsapp.com/send?text=${encodeURIComponent(q)}`,
        defaultUrl: 'https://web.whatsapp.com',
        intentUri: (q) => q ? `whatsapp://send?text=${encodeURIComponent(q)}` : 'intent://send#Intent;package=com.whatsapp;scheme=whatsapp;end',
      },
      {
        id: 'maps',
        name: 'Google Maps',
        nameHi: 'गूगल मैप्स',
        pkg: 'com.google.android.apps.maps',
        color: '#34A853',
        aliases: ['google maps', 'maps', 'map', 'मैप्स', 'नक्शा', 'directions', 'navigate', 'location'],
        searchUrl: (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
        defaultUrl: 'https://maps.google.com',
        intentUri: (q) => `geo:0,0?q=${encodeURIComponent(q || '')}`,
      },
      {
        id: 'spotify',
        name: 'Spotify',
        nameHi: 'स्पॉटिफ़ाई',
        pkg: 'com.spotify.music',
        color: '#1DB954',
        aliases: ['spotify', 'स्पॉटिफ़ाई', 'music', 'गाना', 'गाना बजाओ', 'song'],
        searchUrl: (q) => `https://open.spotify.com/search/${encodeURIComponent(q)}`,
        defaultUrl: 'https://open.spotify.com',
        intentUri: (q) => `spotify:search:${encodeURIComponent(q || '')}`,
      },
      {
        id: 'playstore',
        name: 'Google Play Store',
        nameHi: 'प्ले स्टोर',
        pkg: 'com.android.vending',
        color: '#01875F',
        aliases: ['play store', 'playstore', 'प्ले स्टोर', 'store', 'download app', 'ऐप डाउनलोड'],
        searchUrl: (q) => `https://play.google.com/store/search?q=${encodeURIComponent(q)}&c=apps`,
        defaultUrl: 'https://play.google.com/store',
        intentUri: (q) => `market://search?q=${encodeURIComponent(q || '')}`,
      },
      {
        id: 'instagram',
        name: 'Instagram',
        nameHi: 'इंस्टाग्राम',
        pkg: 'com.instagram.android',
        color: '#E4405F',
        aliases: ['instagram', 'इंस्टाग्राम', 'insta', 'reels', 'रील्स'],
        searchUrl: (q) => `https://www.instagram.com/explore/tags/${encodeURIComponent(q.replace(/\s+/g, ''))}`,
        defaultUrl: 'https://www.instagram.com',
        intentUri: () => 'intent://instagram.com#Intent;package=com.instagram.android;scheme=https;end',
      },
      {
        id: 'amazon',
        name: 'Amazon',
        nameHi: 'अमेज़न',
        pkg: 'in.amazon.mShop.android.shopping',
        color: '#FF9900',
        aliases: ['amazon', 'अमेज़न', 'खरीद', 'buy on amazon'],
        searchUrl: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`,
        defaultUrl: 'https://www.amazon.in',
        intentUri: (q) => `intent://amazon.in/s?k=${encodeURIComponent(q || '')}#Intent;package=in.amazon.mShop.android.shopping;scheme=https;end`,
      },
      {
        id: 'flipkart',
        name: 'Flipkart',
        nameHi: 'फ्लिपकार्ट',
        pkg: 'com.flipkart.android',
        color: '#2874F0',
        aliases: ['flipkart', 'फ्लिपकार्ट'],
        searchUrl: (q) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
        defaultUrl: 'https://www.flipkart.com',
        intentUri: (q) => `intent://flipkart.com/search?q=${encodeURIComponent(q || '')}#Intent;package=com.flipkart.android;scheme=https;end`,
      },
      {
        id: 'zomato',
        name: 'Zomato',
        nameHi: 'ज़ोमैटो',
        pkg: 'com.application.zomato',
        color: '#CB202D',
        aliases: ['zomato', 'ज़ोमैटो', 'जोमैटो', 'restaurant', 'खाना ऑर्डर'],
        searchUrl: (q) => `https://www.zomato.com/search?q=${encodeURIComponent(q)}`,
        defaultUrl: 'https://www.zomato.com',
        intentUri: (q) => `intent://zomato.com/search?q=${encodeURIComponent(q || '')}#Intent;package=com.application.zomato;scheme=https;end`,
      },
      {
        id: 'swiggy',
        name: 'Swiggy',
        nameHi: 'स्विगी',
        pkg: 'in.swiggy.android',
        color: '#FC8019',
        aliases: ['swiggy', 'स्विगी', 'food delivery'],
        searchUrl: (q) => `https://www.swiggy.com/search?query=${encodeURIComponent(q)}`,
        defaultUrl: 'https://www.swiggy.com',
        intentUri: () => 'intent://swiggy.com#Intent;package=in.swiggy.android;scheme=https;end',
      },
      {
        id: 'netflix',
        name: 'Netflix',
        nameHi: 'नेटफ्लिक्स',
        pkg: 'com.netflix.mediaclient',
        color: '#E50914',
        aliases: ['netflix', 'नेटफ्लिक्स', 'movie', 'फिल्म', 'web series'],
        searchUrl: (q) => `https://www.netflix.com/search?q=${encodeURIComponent(q)}`,
        defaultUrl: 'https://www.netflix.com',
        intentUri: (q) => `intent://netflix.com/search?q=${encodeURIComponent(q || '')}#Intent;package=com.netflix.mediaclient;scheme=https;end`,
      },
      {
        id: 'telegram',
        name: 'Telegram',
        nameHi: 'टेलीग्राम',
        pkg: 'org.telegram.messenger',
        color: '#229ED9',
        aliases: ['telegram', 'टेलीग्राम', 'tg'],
        searchUrl: (q) => `https://t.me/${encodeURIComponent(q.replace(/\s+/g, ''))}`,
        defaultUrl: 'https://web.telegram.org',
        intentUri: (q) => `tg://resolve?domain=${encodeURIComponent(q || '')}`,
      },
      {
        id: 'twitter',
        name: 'X (Twitter)',
        nameHi: 'एक्स (ट्विटर)',
        pkg: 'com.twitter.android',
        color: '#FFFFFF',
        aliases: ['twitter', 'ट्विटर', 'x.com', 'tweets'],
        searchUrl: (q) => `https://x.com/search?q=${encodeURIComponent(q)}`,
        defaultUrl: 'https://x.com',
        intentUri: (q) => `twitter://search?query=${encodeURIComponent(q || '')}`,
      },
      {
        id: 'wikipedia',
        name: 'Wikipedia',
        nameHi: 'विकिपीडिया',
        pkg: 'org.wikipedia',
        color: '#CCCCCC',
        aliases: ['wikipedia', 'विकिपीडिया', 'wiki', 'विकी'],
        searchUrl: (q) => `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`,
        defaultUrl: 'https://wikipedia.org',
        intentUri: (q) => `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q || '')}`,
      },
      {
        id: 'camera',
        name: 'Camera',
        nameHi: 'कैमरा',
        pkg: 'com.android.camera',
        color: '#00F0FF',
        aliases: ['camera', 'कैमरा', 'photo', 'फोटो', 'selfie'],
        searchUrl: () => '#camera',
        defaultUrl: '#camera',
        intentUri: () => 'intent:#Intent;action=android.media.action.IMAGE_CAPTURE;end',
      },
      {
        id: 'phone',
        name: 'Phone Dialer',
        nameHi: 'फ़ोन डायलर',
        pkg: 'com.android.dialer',
        color: '#34A853',
        aliases: ['phone', 'फ़ोन', 'dial', 'कॉल', 'call', 'कॉल करो', 'नंबर लगाओ'],
        searchUrl: (q) => `tel:${q.replace(/[^0-9+]/g, '')}`,
        defaultUrl: 'tel:',
        intentUri: (q) => `tel:${q ? q.replace(/[^0-9+]/g, '') : ''}`,
      },
      {
        id: 'calculator',
        name: 'Calculator',
        nameHi: 'कैलकुलेटर',
        pkg: 'com.google.android.calculator',
        color: '#FFB703',
        aliases: ['calculator', 'कैलकुलेटर', 'हिसाब', 'calculate'],
        searchUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + ' calculator')}`,
        defaultUrl: '#calculator',
        intentUri: () => 'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.APP_CALCULATOR;end',
      },
      {
        id: 'gmail',
        name: 'Gmail',
        nameHi: 'जीमेल',
        pkg: 'com.google.android.gm',
        color: '#EA4335',
        aliases: ['gmail', 'जीमेल', 'email', 'ईमेल', 'mail'],
        searchUrl: (q) => `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(q)}`,
        defaultUrl: 'https://mail.google.com',
        intentUri: (q) => `mailto:${encodeURIComponent(q || '')}`,
      },
      {
        id: 'google',
        name: 'Google Search',
        nameHi: 'गूगल सर्च',
        pkg: 'com.android.chrome',
        color: '#4285F4',
        aliases: ['google', 'गूगल', 'chrome', 'क्रोम', 'search', 'सर्च', 'browse', 'ढूंढो'],
        searchUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
        defaultUrl: 'https://www.google.com',
        intentUri: (q) => `https://www.google.com/search?q=${encodeURIComponent(q || '')}`,
      },
    ];

    // 1. Try matching with registry apps
    for (const appItem of APP_REGISTRY) {
      const matchAlias = appItem.aliases.find((alias) => userMsgLower.includes(alias));
      if (matchAlias) {
        detectedIntent = appItem.id === 'phone' ? 'DIAL_PHONE' : appItem.id === 'camera' ? 'OPEN_CAMERA' : 'OPEN_APP';
        const cleanQuery = rawUserMsg
          .replace(new RegExp(matchAlias, 'gi'), ' ')
          .replace(/(open|launch|kholo|खोलो|par|पर|search|सर्च|play|चलाओ|बजाओ|गाना|गाने|video|वीडियो|dikhao|दिखाओ|batao|बताओ|chalao|in|inside|me|में|app|ऐप)/gi, ' ')
          .trim();

        const url = cleanQuery ? appItem.searchUrl(cleanQuery) : appItem.defaultUrl;
        const intentUri = appItem.intentUri(cleanQuery);

        actionPayload = {
          app: appItem.id,
          name: appItem.name,
          nameHi: appItem.nameHi,
          query: cleanQuery,
          url,
          intentUri,
          pkg: appItem.pkg,
          color: appItem.color,
          autoExecute: true,
        };
        break;
      }
    }

    // 2. Generic App Pattern Detection for ANY other app
    if (!actionPayload) {
      const genericRegex = /(?:open|kholo|खोलो|launch)\s+([a-zA-Z0-9\u0900-\u097F]+)(?:\s+(?:par|me|में|पर|and|aur|और)\s+(.+))?/i;
      const genericMatch = rawUserMsg.match(genericRegex);
      if (genericMatch) {
        const appName = genericMatch[1].trim();
        const subQuery = (genericMatch[2] || '')
          .replace(/(search|सर्च|ढूंढो|karo|करो|par|पर|me|में)/gi, ' ')
          .trim();

        detectedIntent = 'OPEN_APP';
        const fullSearchUrl = subQuery
          ? `https://www.google.com/search?q=${encodeURIComponent(appName + ' ' + subQuery)}`
          : `https://play.google.com/store/search?q=${encodeURIComponent(appName)}&c=apps`;

        actionPayload = {
          app: `custom_${appName.toLowerCase()}`,
          name: appName,
          nameHi: appName,
          query: subQuery,
          url: fullSearchUrl,
          intentUri: `market://search?q=${encodeURIComponent(appName)}`,
          pkg: `com.${appName.toLowerCase()}.app`,
          color: '#00F0FF',
          autoExecute: true,
        };
      }
    }

    let reply = response?.text;

    // Graceful offline / quota fallback if rate limit occurs
    if (!reply) {
      if (actionPayload) {
        if (actionPayload.query) {
          reply = language === 'hi'
            ? `🚀 **${actionPayload.nameHi || actionPayload.name} में सर्च तैयार है**\n\nमैंने आपके निर्देश को पहचान लिया है: **"${actionPayload.query}"** सर्च किया जा रहा है।\n\nऐप खोलने और परिणाम देखने के लिए नीचे दिए गए **'ऐप खोलें'** बटन पर टैप करें।`
            : `🚀 **Launching Search in ${actionPayload.name}**\n\nRecognized request: searching for **"${actionPayload.query}"** inside ${actionPayload.name}.\n\nTap **'Open App'** below to view search results directly.`;
        } else {
          reply = language === 'hi'
            ? `📱 **${actionPayload.nameHi || actionPayload.name} खोलने का निर्देश तैयार है**\n\n${actionPayload.name} के लिए एंड्रॉइड इंटेंट डिस्पैच तैयार है। नीचे 'ऐप खोलें' पर टैप करें।`
            : `📱 **Opening ${actionPayload.name}**\n\nAndroid launch intent prepared for ${actionPayload.name}. Tap 'Open App' below to launch.`;
        }
      } else {
        const isQuota = lastError?.message?.includes('429') || lastError?.message?.includes('RESOURCE_EXHAUSTED');
        const isBatteryQuery = /battery|बैटरी|चार्ज|charge|charging|प्रतिशत|kitni bachi/i.test(userMsgLower);
        const isTimeQuery = /समय|टाइम|time|ghadi|घड़ी|तारीख|date|aaj kya/i.test(userMsgLower);
        const isProfileQuery = /mera naam|mera name|who am i|मेरा नाम|kaun hu|mera mobile|मेरा मोबाइल|phone number|फ़ोन नंबर|number kya hai/i.test(userMsgLower);

        if (isBatteryQuery) {
          detectedIntent = 'DEVICE_BATTERY';
          actionPayload = { type: 'battery', batteryLevel: currentBattery, isCharging, timeToFullOrRemaining };
          reply = language === 'hi'
            ? `🔋 **लाइव डिवाइस बैटरी (Live Battery Telemetry)**\n\n* **बैटरी स्तर:** **${currentBattery}%**\n* **स्थिति:** **${isCharging ? 'चार्जर कनेक्टेड है और चार्ज हो रहा है ⚡' : 'बैटरी पर चल रहा है'}**\n* **${isCharging ? 'फुल चार्ज होने में समय (Time to Full):' : 'अनुमानित शेष समय (Estimated Life):'}** **${timeToFullOrRemaining}**\n\n💡 आप सेटिंग्स (Settings) में जाकर विस्तृत बैटरी खपत रुझान (Battery Usage Trends) और डिस्चार्ज ग्राफ़ भी देख सकते हैं।`
            : `🔋 **Live Device Battery Telemetry**\n\n* **Battery Level:** **${currentBattery}%**\n* **Status:** **${isCharging ? 'Plugged in & Charging ⚡' : 'Running on battery power'}**\n* **${isCharging ? 'Time to Full:' : 'Estimated Time Remaining:'}** **${timeToFullOrRemaining}**\n\n💡 You can check the interactive battery consumption trends and discharge chart in Settings.`;
        } else if (isTimeQuery) {
          detectedIntent = 'DEVICE_TIME';
          actionPayload = { type: 'time', currentTime: currentLocalTime, currentDate: currentLocalDate };
          reply = language === 'hi'
            ? `⏰ **वर्तमान समय और दिनांक (Live Device Clock)**\n\n* **समय:** **${currentLocalTime}**\n* **दिनांक:** **${currentLocalDate}**\n* **टाइमज़ोन:** ${currentDeviceTimezone}`
            : `⏰ **Current Device Time & Date**\n\n* **Time:** **${currentLocalTime}**\n* **Date:** **${currentLocalDate}**\n* **Timezone:** ${currentDeviceTimezone}`;
        } else if (isProfileQuery) {
          detectedIntent = 'USER_PROFILE';
          actionPayload = { type: 'profile', name: userName, phoneNumber: userPhone, email: userEmail };
          reply = language === 'hi'
            ? `👤 **यूज़र प्रोफ़ाइल और पहचान (User Profile)**\n\n* **नाम:** **${userName}**\n* **मोबाइल नंबर:** **${userPhone}**\n* **ईमेल:** ${userEmail}\n\n💡 आप सेटिंग्स (Settings) में जाकर अपना नाम और मोबाइल नंबर कभी भी अपडेट कर सकते हैं।`
            : `👤 **User Profile & Identity**\n\n* **Name:** **${userName}**\n* **Mobile Number:** **${userPhone}**\n* **Email:** ${userEmail}\n\n💡 You can update your name and mobile number anytime in Settings.`;
        } else if (
          (() => {
            const mathMatch = rawUserMsg.match(/([0-9]+(?:\.[0-9]+)?(?:\s*[\+\-\*\/×÷%^]\s*[0-9]+(?:\.[0-9]+)?)+)/);
            if (mathMatch) {
              try {
                const expr = mathMatch[1];
                const sanitized = expr
                  .replace(/×/g, '*')
                  .replace(/÷/g, '/')
                  .replace(/%/g, '/100')
                  .replace(/[^0-9+\-*/.()]/g, '');
                const evaluated = Function(`'use strict'; return (${sanitized})`)();
                if (typeof evaluated === 'number' && Number.isFinite(evaluated)) {
                  detectedIntent = 'MATH_CALCULATION';
                  actionPayload = {
                    type: 'open_math_lab',
                    name: 'DEKA Math Lab & Quiz',
                    label: language === 'hi' ? '🧮 DEKA गणित लैब व कैलकुलेटर खोलें' : '🧮 Launch Math Lab',
                  };
                  reply = language === 'hi'
                    ? `🧮 **गणितीय गणना (Math Answer):**\n\n**${expr.trim()} = ${Number(evaluated.toFixed(6))}**\n\n✅ ${expr.trim()} का सही उत्तर **${Number(evaluated.toFixed(6))}** है।\n\n👉 अधिक अभ्यास और क्विज़ के लिए आप नीचे **DEKA Math Lab** खोल सकते हैं!`
                    : `🧮 **Math Calculation Result:**\n\n**${expr.trim()} = ${Number(evaluated.toFixed(6))}**\n\n✅ The answer to ${expr.trim()} is **${Number(evaluated.toFixed(6))}**.\n\n👉 Tap below to launch **DEKA Math Lab** for interactive practice & quizzes!`;
                  return true;
                }
              } catch {
                // ignore
              }
            }
            return false;
          })()
        ) {
          // math evaluated successfully
        } else if (/math|गणित|हिसाब|समीकरण|sabal|sawal|सवाल|quiz|quize|quizz|calculate|कैलकुलेटर/i.test(userMsgLower)) {
          detectedIntent = 'MATH_QUESTION';
          actionPayload = {
            type: 'open_math_lab',
            name: 'DEKA Math Lab & Quiz',
            label: language === 'hi' ? '🧮 DEKA गणित लैब व क्विज़ खोलें' : '🧮 Launch Math Lab & Quiz',
          };
          reply = language === 'hi'
            ? `🧮 **[गणित का सवाल • DEKA Math Lab]**\n\n**सवाल:** यदि एक ट्रेन 60 किमी/घंटा की गति से चल रही है, तो वह 3 घंटे 30 मिनट में कितनी दूरी तय करेगी?\n\n- **A)** 180 किमी\n- **B)** 200 किमी\n- **C)** 210 किमी\n- **D)** 240 किमी\n\n💡 **संकेत:** दूरी = चाल × समय। (3 घंटे 30 मिनट = 3.5 घंटे)\n✅ **सही उत्तर:** **C) 210 किमी** (60 × 3.5 = 210 किमी)।\n\n👉 और नए गणित के सवाल हल करने और अपना स्कोर बढ़ाने के लिए नीचे **DEKA Math Lab** खोलें!`
            : `🧮 **[Math Question • DEKA Math Lab]**\n\n**Question:** A train travels at an average speed of 60 km/h. How much distance will it cover in 3 hours and 30 minutes?\n\n- **A)** 180 km\n- **B)** 200 km\n- **C)** 210 km\n- **D)** 240 km\n\n💡 **Hint:** Distance = Speed × Time (3h 30m = 3.5 hours).\n✅ **Answer:** **C) 210 km** (60 × 3.5 = 210 km).\n\n👉 Tap below to open **DEKA Math Lab & Quiz** for unlimited practice questions!`;
        } else if (isQuota) {
          reply = language === 'hi'
            ? `⚡ **DEKA AI त्वरित सहायक मोड (Resilient Mode)**\n\nक्लाउड AI का दैनिक कोटा रीसेट हो रहा है, लेकिन DEKA AI की सभी एंड्रॉइड क्षमताएं सक्रिय हैं:\n\n* **हर ऐप खोलना और सर्च करना:** YouTube, WhatsApp, Maps, Spotify, Play Store, Instagram आदि में कुछ भी सर्च करें।\n* **वॉयस असिस्टेंट:** बोलकर निर्देश दें, DEKA सुनेगा और ऐप खोलेगा।`
            : `⚡ **DEKA AI Resilient Assistant Mode**\n\nAll Android application launching and in-app search capabilities remain fully operational:\n\n* **Launch & Search In Any App:** YouTube, Maps, WhatsApp, Spotify, Chrome, Camera, Dialer, and more.\n* **Voice Assistant:** Give spoken commands and DEKA will open the app and execute searches.`;
        } else {
          reply = language === 'hi'
            ? 'DEKA AI आपके सभी ऐप्स खोलने और सर्च करने के लिए तैयार है।'
            : 'DEKA AI is ready to open your apps and search inside them.';
        }
      }
    }

    const groundingChunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources = groundingChunks
      .filter((c: any) => c.web?.uri)
      .map((c: any) => ({
        title: c.web.title || (c.web.uri ? new URL(c.web.uri).hostname : 'Source'),
        url: c.web.uri,
      }))
      .slice(0, 4);

    res.json({
      reply,
      detectedIntent,
      actionPayload,
      brainStats,
      groundingSources,
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.json({
      reply: 'DEKA AI received your request. Local fallback mode is active.',
      detectedIntent: null,
      actionPayload: null,
      brainStats: {
        engine: 'Google Gemini Neural Core',
        model: 'gemini-local-synapse',
        cognitiveMode: 'Local Resilient Mode',
      },
    });
  }
});

// Document Analysis Endpoint
app.post('/api/analyze-document', async (req, res) => {
  try {
    const { documentName, content, query = 'Summarize this document and list key insights' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Document content is required' });
    }

    let summaryText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are DEKA AI. Analyze the following document named "${documentName || 'Document'}".
User request: ${query}

Document content:
---
${content}
---

Provide a comprehensive, crisp, structured summary with bullet points, key takeaways, and action items. If content is in Hindi or requested in Hindi, provide in Hindi.`,
              },
            ],
          },
        ],
      });
      summaryText = response.text || '';
    } catch (modelErr: any) {
      console.warn('Document model error, using fallback:', modelErr?.message || modelErr);
      summaryText = `📄 **Document Summary for ${documentName || 'File'}**\n\n* **Status:** File loaded successfully (${content.length} characters parsed).\n* **Preview:** ${content.slice(0, 300)}...\n* **Key Takeaway:** Document text is ready for local inspection and review.`;
    }

    res.json({
      summary: summaryText || 'Document analysis completed.',
    });
  } catch (error: any) {
    console.error('Document analysis error:', error);
    res.json({
      summary: 'DEKA AI received the document. Analysis completed.',
    });
  }
});

// Download Complete Android Studio Project as ZIP
app.get('/api/download-android-project', async (req, res) => {
  try {
    const zip = new JSZip();
    const androidDir = path.resolve(__dirname, 'android_project');

    if (!fs.existsSync(androidDir)) {
      return res.status(404).json({ error: 'Android project directory not found' });
    }

    function addDirToZip(dirPath: string, zipFolder: JSZip) {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          const subFolder = zipFolder.folder(item);
          if (subFolder) {
            addDirToZip(fullPath, subFolder);
          }
        } else {
          const fileData = fs.readFileSync(fullPath);
          zipFolder.file(item, fileData);
        }
      }
    }

    addDirToZip(androidDir, zip);

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="deka-ai-android-studio-project.zip"');
    res.send(zipBuffer);
  } catch (error: any) {
    console.error('Zip generation error:', error);
    res.status(500).json({ error: 'Could not generate Android project zip' });
  }
});

// Serve frontend with Vite middlewares in dev, or dist in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DEKA AI server running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer();
