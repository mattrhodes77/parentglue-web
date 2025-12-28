import type { CapacitorConfig } from '@capacitor/cli';

// Set to your production URL for release builds
const PRODUCTION_URL = 'https://parentglue.com';

const config: CapacitorConfig = {
  appId: 'com.parentglue.app',
  appName: 'ParentGlue',
  webDir: 'public', // Fallback for assets only
  server: {
    // Production: load from live server
    url: PRODUCTION_URL,
    cleartext: false, // HTTPS only in production
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FAF7F2',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  ios: {
    scheme: 'ParentGlue',
    contentInset: 'automatic',
  },
};

export default config;
