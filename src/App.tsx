import React from 'react';
import { ToastBanner } from './components/ToastBanner';
import { KasirProvider, useKasir } from './context/KasirContext';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';

const AuthGate: React.FC = () => {
  const { authChecked, isLoggedIn } = useKasir();

  if (!authChecked) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {isLoggedIn ? <HomeScreen /> : <LoginScreen />}
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
