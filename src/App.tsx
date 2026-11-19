import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { ToastBanner } from './components/ToastBanner';
import { KasirProvider, useKasir } from './context/KasirContext';
import { DownloadScreen } from './screens/DownloadScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';

const AuthGate: React.FC = () => {
  const { authChecked, isLoggedIn } = useKasir();
  const isNative = Capacitor.isNativePlatform();
  const [showDownloadPage, setShowDownloadPage] = useState(false);

  // Di Browser (Web), langsung tampilkan halaman Download APK saja (tanpa login browser).
  if (!isNative) {
    return (
      <>
        <DownloadScreen />
        <ToastBanner />
      </>
    );
  }

  if (showDownloadPage) {
    return (
      <>
        <DownloadScreen onBackToApp={() => setShowDownloadPage(false)} />
        <ToastBanner />
      </>
    );
  }

  if (!authChecked) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {isLoggedIn ? (
        <HomeScreen onOpenDownloadPage={() => setShowDownloadPage(true)} />
      ) : (
        <LoginScreen />
      )}
      <ToastBanner />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <KasirProvider>
      <AuthGate />
    </KasirProvider>
  );
};

export default App;
