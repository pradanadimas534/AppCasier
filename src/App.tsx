import React, { useState } from 'react';
import { ToastBanner } from './components/ToastBanner';
import { KasirProvider, useKasir } from './context/KasirContext';
import { DownloadScreen } from './screens/DownloadScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';

const AuthGate: React.FC = () => {
  const { authChecked, isLoggedIn } = useKasir();
  const [showDownloadPage, setShowDownloadPage] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    return path === '/download' || params.get('page') === 'download';
  });

  const openDownload = () => {
    try {
      window.history.pushState({}, '', '/download');
    } catch {
      // ignore inside file:// or WebView if pushState restricted
    }
    setShowDownloadPage(true);
  };

  const closeDownload = () => {
    try {
      window.history.pushState({}, '', '/');
    } catch {
      // ignore
    }
    setShowDownloadPage(false);
  };

  if (showDownloadPage) {
    return (
      <>
        <DownloadScreen onBackToApp={closeDownload} />
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
        <HomeScreen onOpenDownloadPage={openDownload} />
      ) : (
        <LoginScreen onOpenDownloadPage={openDownload} />
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
