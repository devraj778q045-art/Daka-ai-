/**
 * DEKA AI — Universal Android App & In-App Search Engine
 * Supports opening ANY installed app, searching anything inside it,
 * with multi-tiered fallback (Direct App Intent, Deep Link, Web App, Play Store).
 */

export interface AppDefinition {
  id: string;
  name: string;
  nameHi: string;
  category: 'social' | 'media' | 'utility' | 'shopping' | 'system' | 'custom';
  packageName: string;
  iconName: string;
  color: string;
  description: string;
  descriptionHi: string;
  searchPlaceholder: string;
  searchPlaceholderHi: string;
  getSearchUrl: (query: string) => string;
  getDefaultUrl: () => string;
  getIntentUri: (query?: string) => string;
}

export const UNIVERSAL_APPS: AppDefinition[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    nameHi: 'यूट्यूब',
    category: 'media',
    packageName: 'com.google.android.youtube',
    iconName: 'Youtube',
    color: '#FF0000',
    description: 'Watch video tutorials, music & livestreams',
    descriptionHi: 'वीडियो, गाने, ट्यूटोरियल और लाइव स्ट्रीम',
    searchPlaceholder: 'Search videos, songs, creators...',
    searchPlaceholderHi: 'गाने, वीडियो या चैनल सर्च करें...',
    getSearchUrl: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
    getDefaultUrl: () => 'https://www.youtube.com',
    getIntentUri: (q) => q 
      ? `intent://results?search_query=${encodeURIComponent(q)}#Intent;package=com.google.android.youtube;scheme=vnd.youtube;end`
      : 'intent://#Intent;package=com.google.android.youtube;scheme=vnd.youtube;end',
  },
  {
    id: 'google',
    name: 'Google / Chrome',
    nameHi: 'गूगल / क्रोम',
    category: 'utility',
    packageName: 'com.android.chrome',
    iconName: 'Globe',
    color: '#4285F4',
    description: 'Search the entire web, news, and knowledge',
    descriptionHi: 'संपूर्ण वेब, समाचार और ज्ञान खोजें',
    searchPlaceholder: 'Search anything on Google...',
    searchPlaceholderHi: 'गूगल पर कुछ भी सर्च करें...',
    getSearchUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    getDefaultUrl: () => 'https://www.google.com',
    getIntentUri: (q) => `intent://search?q=${encodeURIComponent(q || '')}#Intent;package=com.android.chrome;scheme=https;end`,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    nameHi: 'व्हाट्सएप',
    category: 'social',
    packageName: 'com.whatsapp',
    iconName: 'MessageCircle',
    color: '#25D366',
    description: 'Chat, call, and share messages',
    descriptionHi: 'चैट, कॉल और संदेश भेजें',
    searchPlaceholder: 'Type message to send or search...',
    searchPlaceholderHi: 'भेजने के लिए संदेश या नंबर लिखें...',
    getSearchUrl: (q) => `https://api.whatsapp.com/send?text=${encodeURIComponent(q)}`,
    getDefaultUrl: () => 'https://web.whatsapp.com',
    getIntentUri: (q) => q
      ? `whatsapp://send?text=${encodeURIComponent(q)}`
      : 'intent://send#Intent;package=com.whatsapp;scheme=whatsapp;end',
  },
  {
    id: 'maps',
    name: 'Google Maps',
    nameHi: 'गूगल मैप्स',
    category: 'utility',
    packageName: 'com.google.android.apps.maps',
    iconName: 'MapPin',
    color: '#34A853',
    description: 'Find places, live directions & navigation',
    descriptionHi: 'स्थान खोजें, नेविगेशन और लाइव ट्रैफिक',
    searchPlaceholder: 'Search places, cities, routes...',
    searchPlaceholderHi: 'स्थान, शहर या रास्ता सर्च करें...',
    getSearchUrl: (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
    getDefaultUrl: () => 'https://maps.google.com',
    getIntentUri: (q) => `geo:0,0?q=${encodeURIComponent(q || '')}`,
  },
  {
    id: 'spotify',
    name: 'Spotify',
    nameHi: 'स्पॉटिफ़ाई',
    category: 'media',
    packageName: 'com.spotify.music',
    iconName: 'Music',
    color: '#1DB954',
    description: 'Stream songs, podcasts & artists',
    descriptionHi: 'गाने, पॉडकास्ट और प्लेलिस्ट सुनें',
    searchPlaceholder: 'Search songs, artists, playlists...',
    searchPlaceholderHi: 'गाने, गायक या प्लेलिस्ट खोजें...',
    getSearchUrl: (q) => `https://open.spotify.com/search/${encodeURIComponent(q)}`,
    getDefaultUrl: () => 'https://open.spotify.com',
    getIntentUri: (q) => `spotify:search:${encodeURIComponent(q || '')}`,
  },
  {
    id: 'playstore',
    name: 'Google Play Store',
    nameHi: 'प्ले स्टोर',
    category: 'system',
    packageName: 'com.android.vending',
    iconName: 'Download',
    color: '#01875F',
    description: 'Install and discover Android apps & games',
    descriptionHi: 'एंड्रॉइड ऐप्स और गेम्स डाउनलोड करें',
    searchPlaceholder: 'Search apps or games...',
    searchPlaceholderHi: 'ऐप्स या गेम्स खोजें...',
    getSearchUrl: (q) => `https://play.google.com/store/search?q=${encodeURIComponent(q)}&c=apps`,
    getDefaultUrl: () => 'https://play.google.com/store',
    getIntentUri: (q) => `market://search?q=${encodeURIComponent(q || '')}`,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    nameHi: 'इंस्टाग्राम',
    category: 'social',
    packageName: 'com.instagram.android',
    iconName: 'Camera',
    color: '#E4405F',
    description: 'Explore reels, creators, and hashtags',
    descriptionHi: 'रील्स, क्रिएटर और हैशटैग देखें',
    searchPlaceholder: 'Search tags, profiles, reels...',
    searchPlaceholderHi: 'टैग्स, प्रोफाइल या रील्स खोजें...',
    getSearchUrl: (q) => `https://www.instagram.com/explore/tags/${encodeURIComponent(q.replace(/\s+/g, ''))}`,
    getDefaultUrl: () => 'https://www.instagram.com',
    getIntentUri: (q) => `intent://instagram.com#Intent;package=com.instagram.android;scheme=https;end`,
  },
  {
    id: 'amazon',
    name: 'Amazon Shopping',
    nameHi: 'अमेज़न',
    category: 'shopping',
    packageName: 'in.amazon.mShop.android.shopping',
    iconName: 'ShoppingBag',
    color: '#FF9900',
    description: 'Shop electronics, fashion, and deals',
    descriptionHi: 'इलेक्ट्रॉनिक्स, फैशन और सामान खरीदें',
    searchPlaceholder: 'Search products to buy...',
    searchPlaceholderHi: 'खरीदने के लिए सामान खोजें...',
    getSearchUrl: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`,
    getDefaultUrl: () => 'https://www.amazon.in',
    getIntentUri: (q) => `intent://amazon.in/s?k=${encodeURIComponent(q || '')}#Intent;package=in.amazon.mShop.android.shopping;scheme=https;end`,
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    nameHi: 'फ्लिपकार्ट',
    category: 'shopping',
    packageName: 'com.flipkart.android',
    iconName: 'ShoppingBag',
    color: '#2874F0',
    description: 'Browse online shopping offers & discounts',
    descriptionHi: 'ऑनलाइन शॉपिंग ऑफर और सामान खोजें',
    searchPlaceholder: 'Search products on Flipkart...',
    searchPlaceholderHi: 'फ्लिपकार्ट पर उत्पाद खोजें...',
    getSearchUrl: (q) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
    getDefaultUrl: () => 'https://www.flipkart.com',
    getIntentUri: (q) => `intent://flipkart.com/search?q=${encodeURIComponent(q || '')}#Intent;package=com.flipkart.android;scheme=https;end`,
  },
  {
    id: 'zomato',
    name: 'Zomato',
    nameHi: 'ज़ोमैटो',
    category: 'shopping',
    packageName: 'com.application.zomato',
    iconName: 'Utensils',
    color: '#CB202D',
    description: 'Order food delivery & find top restaurants',
    descriptionHi: 'खाना ऑर्डर करें और रेस्टोरेंट खोजें',
    searchPlaceholder: 'Search dishes, pizza, burgers...',
    searchPlaceholderHi: 'पिज़्ज़ा, बिरयानी या रेस्टोरेंट खोजें...',
    getSearchUrl: (q) => `https://www.zomato.com/search?q=${encodeURIComponent(q)}`,
    getDefaultUrl: () => 'https://www.zomato.com',
    getIntentUri: (q) => `intent://zomato.com/search?q=${encodeURIComponent(q || '')}#Intent;package=com.application.zomato;scheme=https;end`,
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    nameHi: 'स्विगी',
    category: 'shopping',
    packageName: 'in.swiggy.android',
    iconName: 'Utensils',
    color: '#FC8019',
    description: 'Fast food and Instamart grocery delivery',
    descriptionHi: 'खाना और इंस्टामार्ट किराना डिलीवरी',
    searchPlaceholder: 'Search food or grocery items...',
    searchPlaceholderHi: 'खाना या ग्रॉसरी का सामान खोजें...',
    getSearchUrl: (q) => `https://www.swiggy.com/search?query=${encodeURIComponent(q)}`,
    getDefaultUrl: () => 'https://www.swiggy.com',
    getIntentUri: () => `intent://swiggy.com#Intent;package=in.swiggy.android;scheme=https;end`,
  },
  {
    id: 'gmail',
    name: 'Gmail',
    nameHi: 'जीमेल',
    category: 'utility',
    packageName: 'com.google.android.gm',
    iconName: 'Mail',
    color: '#EA4335',
    description: 'Search inbox & compose emails',
    descriptionHi: 'ईमेल खोजें और नया मेल भेजें',
    searchPlaceholder: 'Search emails or send to...',
    searchPlaceholderHi: 'ईमेल खोजें या प्राप्तकर्ता लिखें...',
    getSearchUrl: (q) => `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(q)}`,
    getDefaultUrl: () => 'https://mail.google.com',
    getIntentUri: (q) => `mailto:${encodeURIComponent(q || '')}`,
  },
  {
    id: 'netflix',
    name: 'Netflix',
    nameHi: 'नेटफ्लिक्स',
    category: 'media',
    packageName: 'com.netflix.mediaclient',
    iconName: 'Film',
    color: '#E50914',
    description: 'Stream movies, series & documentaries',
    descriptionHi: 'फिल्में और वेब सीरीज देखें',
    searchPlaceholder: 'Search movies, TV shows, actors...',
    searchPlaceholderHi: 'फिल्में या वेब सीरीज खोजें...',
    getSearchUrl: (q) => `https://www.netflix.com/search?q=${encodeURIComponent(q)}`,
    getDefaultUrl: () => 'https://www.netflix.com',
    getIntentUri: (q) => `intent://netflix.com/search?q=${encodeURIComponent(q || '')}#Intent;package=com.netflix.mediaclient;scheme=https;end`,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    nameHi: 'टेलीग्राम',
    category: 'social',
    packageName: 'org.telegram.messenger',
    iconName: 'Send',
    color: '#229ED9',
    description: 'Fast, secure messaging & channels',
    descriptionHi: 'सुरक्षित संदेश और चैनल खोजें',
    searchPlaceholder: 'Search Telegram channels or users...',
    searchPlaceholderHi: 'चैनल या संपर्क खोजें...',
    getSearchUrl: (q) => `https://t.me/${encodeURIComponent(q.replace(/\s+/g, ''))}`,
    getDefaultUrl: () => 'https://web.telegram.org',
    getIntentUri: (q) => `tg://resolve?domain=${encodeURIComponent(q || '')}`,
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    nameHi: 'एक्स (ट्विटर)',
    category: 'social',
    packageName: 'com.twitter.android',
    iconName: 'Hash',
    color: '#FFFFFF',
    description: 'Real-time trending topics & news',
    descriptionHi: 'ताजा खबरें और ट्रेंडिंग विषय',
    searchPlaceholder: 'Search tweets, hashtags, news...',
    searchPlaceholderHi: 'ट्वीट्स, हैशटैग या समाचार खोजें...',
    getSearchUrl: (q) => `https://x.com/search?q=${encodeURIComponent(q)}`,
    getDefaultUrl: () => 'https://x.com',
    getIntentUri: (q) => `twitter://search?query=${encodeURIComponent(q || '')}`,
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    nameHi: 'विकिपीडिया',
    category: 'utility',
    packageName: 'org.wikipedia',
    iconName: 'BookOpen',
    color: '#CCCCCC',
    description: 'Free encyclopedia knowledge repository',
    descriptionHi: 'विश्वकोश और संपूर्ण ज्ञान भंडार',
    searchPlaceholder: 'Search any topic, person, or history...',
    searchPlaceholderHi: 'कोई भी विषय या इतिहास खोजें...',
    getSearchUrl: (q) => `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`,
    getDefaultUrl: () => 'https://wikipedia.org',
    getIntentUri: (q) => `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q || '')}`,
  },
  {
    id: 'phone',
    name: 'Phone Dialer',
    nameHi: 'फ़ोन डायलर',
    category: 'system',
    packageName: 'com.android.dialer',
    iconName: 'PhoneCall',
    color: '#34A853',
    description: 'Direct phone calling and dial pad',
    descriptionHi: 'फोन कॉल और डायलर',
    searchPlaceholder: 'Enter phone number or contact...',
    searchPlaceholderHi: 'फ़ोन नंबर या संपर्क दर्ज करें...',
    getSearchUrl: (q) => `tel:${q.replace(/[^0-9+]/g, '')}`,
    getDefaultUrl: () => 'tel:',
    getIntentUri: (q) => `tel:${q ? q.replace(/[^0-9+]/g, '') : ''}`,
  },
  {
    id: 'camera',
    name: 'Device Camera',
    nameHi: 'कैमरा',
    category: 'system',
    packageName: 'com.android.camera',
    iconName: 'Camera',
    color: '#00F0FF',
    description: 'Live lens view and snapshot capture',
    descriptionHi: 'लाइव कैमरा लेंस और फोटो कैप्चर',
    searchPlaceholder: 'Capture mode...',
    searchPlaceholderHi: 'कैमरा मोड...',
    getSearchUrl: () => '#camera',
    getDefaultUrl: () => '#camera',
    getIntentUri: () => 'intent:#Intent;action=android.media.action.IMAGE_CAPTURE;end',
  },
  {
    id: 'calculator',
    name: 'Calculator',
    nameHi: 'कैलकुलेटर',
    category: 'utility',
    packageName: 'com.google.android.calculator',
    iconName: 'Calculator',
    color: '#FFB703',
    description: 'Fast math, calculations, and conversions',
    descriptionHi: 'गणित, हिसाब और त्वरित गणना',
    searchPlaceholder: 'Enter equation (e.g. 25 * 4)...',
    searchPlaceholderHi: 'समीकरण दर्ज करें (उदा. 4500 / 12)...',
    getSearchUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + ' calculator')}`,
    getDefaultUrl: () => '#calculator',
    getIntentUri: () => 'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.APP_CALCULATOR;end',
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    nameHi: 'कैलेंडर',
    category: 'utility',
    packageName: 'com.google.android.calendar',
    iconName: 'Calendar',
    color: '#4285F4',
    description: 'Schedule events, reminders & meetings',
    descriptionHi: 'इवेंट, रिमाइंडर और बैठकें शेड्यूल करें',
    searchPlaceholder: 'Search events or date...',
    searchPlaceholderHi: 'तारीख या रिमाइंडर खोजें...',
    getSearchUrl: (q) => `https://calendar.google.com/calendar/r/search?q=${encodeURIComponent(q)}`,
    getDefaultUrl: () => 'https://calendar.google.com',
    getIntentUri: () => 'content://com.android.calendar/time',
  },
];

/**
 * Universal Fallback for ANY OTHER APP named by the user!
 * "यह हर एक ऐप खोल पाए और उसमें कोई भी चीज सर्च मार"
 */
export function createDynamicAppTarget(appName: string, query: string = ''): AppDefinition {
  const cleanAppName = appName.trim();
  const slug = cleanAppName.toLowerCase().replace(/[^a-z0-9]/g, '');

  return {
    id: `custom_${slug}`,
    name: cleanAppName,
    nameHi: cleanAppName,
    category: 'custom',
    packageName: `com.${slug || 'android'}.app`,
    iconName: 'Sparkles',
    color: '#00F0FF',
    description: `Custom Android App: ${cleanAppName}`,
    descriptionHi: `कस्टम एंड्रॉइड ऐप: ${cleanAppName}`,
    searchPlaceholder: `Search in ${cleanAppName}...`,
    searchPlaceholderHi: `${cleanAppName} में खोजें...`,
    getSearchUrl: (q) => {
      if (q) {
        return `https://www.google.com/search?q=${encodeURIComponent(`${cleanAppName} ${q}`)}`;
      }
      return `https://play.google.com/store/search?q=${encodeURIComponent(cleanAppName)}&c=apps`;
    },
    getDefaultUrl: () => `https://play.google.com/store/search?q=${encodeURIComponent(cleanAppName)}&c=apps`,
    getIntentUri: (q) => {
      if (q) {
        return `intent://#Intent;action=android.intent.action.WEB_SEARCH;S.query=${encodeURIComponent(cleanAppName + ' ' + q)};end`;
      }
      return `market://search?q=${encodeURIComponent(cleanAppName)}`;
    },
  };
}

/**
 * Universal Intelligent Intent & Search Parser
 * Extracts both target app and in-app search query from ANY user text.
 */
export function parseAppAndSearchQuery(userText: string): {
  detectedApp: AppDefinition;
  searchQuery: string;
  isSpecificApp: boolean;
} {
  const text = userText.trim();
  const textLower = text.toLowerCase();

  // 1. Check known apps in registry
  for (const app of UNIVERSAL_APPS) {
    const names = [
      app.name.toLowerCase(),
      app.nameHi.toLowerCase(),
      app.id.toLowerCase(),
    ];
    // Add known aliases
    if (app.id === 'youtube') names.push('yt', 'यूट्यूब', 'वीडियो');
    if (app.id === 'whatsapp') names.push('wa', 'व्हाट्सएप', 'व्हाट्सअप');
    if (app.id === 'google') names.push('chrome', 'क्रोम', 'गूगल', 'search', 'सर्च');
    if (app.id === 'maps') names.push('map', 'मैप्स', 'नक्शा', 'location');
    if (app.id === 'spotify') names.push('स्पॉटिफ़ाई', 'music', 'गाना', 'गाने');
    if (app.id === 'playstore') names.push('प्ले स्टोर', 'play store', 'store');
    if (app.id === 'instagram') names.push('insta', 'इंस्टाग्राम', 'रील्स', 'reels');
    if (app.id === 'amazon') names.push('अमेज़न');
    if (app.id === 'flipkart') names.push('फ्लिपकार्ट');
    if (app.id === 'zomato') names.push('ज़ोमैटो', 'जोमैटो');
    if (app.id === 'swiggy') names.push('स्विगी');
    if (app.id === 'calculator') names.push('कैलकुलेटर', 'हिसाब');
    if (app.id === 'camera') names.push('कैमरा', 'photo', 'फोटो');
    if (app.id === 'phone') names.push('dial', 'कॉल', 'call', 'फोन');

    const matchedName = names.find((n) => textLower.includes(n));
    if (matchedName) {
      // Clean query: remove the app name and intent trigger words
      const cleanedQuery = text
        .replace(new RegExp(matchedName, 'gi'), ' ')
        .replace(/(खोलें|खोलो|ओपन|open|सर्च|search|ढूंढो|दिखाओ|बताओ|चलाओ|लगाओ|बजाओ|पर|में|me|par|karo|करो|app|ऐप)/gi, ' ')
        .trim();

      return {
        detectedApp: app,
        searchQuery: cleanedQuery,
        isSpecificApp: true,
      };
    }
  }

  // 2. Generic App Pattern Detection (e.g. "[App Name] खोलो और [Query] सर्च करो")
  // Regex pattern for Hindi and English app opening
  const genericMatch = text.match(
    /(?:open|launch|kholo|खोलो)\s+([a-zA-Z0-9\u0900-\u097F]+)(?:\s+(?:par|me|में|पर|and|aur|और)\s+(.+))?/i
  ) || text.match(
    /([a-zA-Z0-9\u0900-\u097F]+)\s+(?:ऐप|app)\s+(?:खोलो|kholo|open)(?:\s+(?:aur|and|और)\s+(.+))?/i
  );

  if (genericMatch) {
    const rawAppName = genericMatch[1]?.trim();
    const rawQuery = (genericMatch[2] || '')
      .replace(/(सर्च|search|ढूंढो|karo|करो|पर|में|me|par)/gi, '')
      .trim();

    if (rawAppName && rawAppName.length > 1) {
      const dynamicApp = createDynamicAppTarget(rawAppName, rawQuery);
      return {
        detectedApp: dynamicApp,
        searchQuery: rawQuery,
        isSpecificApp: true,
      };
    }
  }

  // 3. Fallback: Default to Google Search for the entire query
  return {
    detectedApp: UNIVERSAL_APPS[1], // Google
    searchQuery: text,
    isSpecificApp: false,
  };
}

/**
 * Robust App Launch Execution
 * Executes the launch intent seamlessly across desktop web, mobile web, Android APK, and iframes.
 */
export async function executeAppLaunch(
  app: AppDefinition,
  query: string = '',
  options: { openInNewTab?: boolean; forceWeb?: boolean } = {}
): Promise<{ success: boolean; targetUrl: string; method: string }> {
  const targetUrl = query.trim() ? app.getSearchUrl(query.trim()) : app.getDefaultUrl();
  const intentUri = app.getIntentUri(query.trim());

  // Special System Handlers
  if (app.id === 'camera' && targetUrl === '#camera') {
    return { success: true, targetUrl: '#camera', method: 'system_camera' };
  }
  if (app.id === 'calculator' && targetUrl === '#calculator') {
    return { success: true, targetUrl: '#calculator', method: 'system_calculator' };
  }
  if (targetUrl.startsWith('tel:')) {
    window.location.href = targetUrl;
    return { success: true, targetUrl, method: 'system_dialer' };
  }

  // On Android mobile devices, navigating to standard intent or HTTPS triggers the native app automatically
  const isAndroid = /android/i.test(navigator.userAgent);

  // Method 1: Invisible anchor click (most reliable against popup blockers & iframe restrictions)
  try {
    const link = document.createElement('a');
    link.href = isAndroid && !options.forceWeb && intentUri ? intentUri : targetUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Method 2: Fallback window.open if anchor was handled
    setTimeout(() => {
      try {
        const popup = window.open(targetUrl, '_blank', 'noopener,noreferrer');
        if (popup) popup.focus();
      } catch {
        // Ignored
      }
    }, 100);

    return {
      success: true,
      targetUrl,
      method: isAndroid ? 'android_intent' : 'web_tab',
    };
  } catch (err) {
    // Method 3: Direct window.open fallback
    try {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return { success: true, targetUrl, method: 'window_open' };
    } catch {
      window.location.href = targetUrl;
      return { success: true, targetUrl, method: 'direct_location' };
    }
  }
}
