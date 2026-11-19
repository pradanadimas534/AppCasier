import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.kasir',
  appName: 'Kasirku',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '19959687372-ssoq87ktac1ngl3kc5bbgl2iei2douta.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
