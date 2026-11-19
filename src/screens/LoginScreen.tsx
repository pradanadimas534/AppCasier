import React, { useState } from 'react';
import { useKasir } from '../context/KasirContext';

export const LoginScreen: React.FC = () => {
  const { login, loginError, showToast } = useKasir();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const ok = await login();
    if (!ok) {
      setLoading(false);
      showToast(loginError || 'Login gagal, coba lagi', 'error');
    }
  };

  return (
    <div className="relative h-full w-full overflow-y-auto bg-gradient-to-br from-brand-soft to-brand-deep text-white">
      <div className="min-h-full max-w-md mx-auto px-7 py-10 flex flex-col items-center justify-between">
        {/* Top Brand */}
        <div className="text-center pt-2">
          <h1 className="font-lobster text-[50px] leading-[1.1] text-white">
            Kasir Toko
          </h1>
          <p className="font-inter text-[18px] text-white/90 mt-1">
            Kasir &amp; Operasional
          </p>
        </div>

        {/* Center Illustration */}
        <div className="my-6 flex items-center justify-center">
          <img
            src="/assets/images/basket.png"
            alt="Ilustrasi Keranjang Kasir"
            className="w-[220px] h-auto object-contain select-none"
          />
        </div>

        {/* Welcome & Google Login Button */}
        <div className="w-full flex flex-col items-center">
          <h2 className="font-inter font-bold text-[28px] text-white text-center">
            Selamat datang!
          </h2>
          <p className="font-inter text-[15px] text-white/90 text-center mt-2">
            Login untuk melanjutkan ke aplikasi kasir
          </p>

          <button
            type="button"
            disabled={loading}
            onClick={handleLogin}
            className="mt-6 w-full h-[58px] rounded-[30px] bg-[#FBECEC] shadow-md flex items-center justify-center gap-3 active:scale-[0.99] transition disabled:opacity-60"
          >
            <span className="w-[22px] h-[22px] rounded-full bg-white flex items-center justify-center font-inter font-bold text-[15px] text-[#4285F4] leading-none">
              G
            </span>
            <span
              className={`font-inter font-medium text-[14px] ${
                loading ? 'text-[#9A9A9A]' : 'text-app-ink'
              }`}
            >
              Login dengan Google
            </span>
          </button>
        </div>

        {/* Footer Terms */}
        <div className="text-center pt-8 pb-2">
          <p className="font-inter text-[13px] text-white/90">
            Dengan login, Anda setuju dengan
          </p>
          <p className="font-inter font-semibold text-[13px] text-white mt-0.5">
            Syarat &amp; Ketentuan dan Kebijakan Privasi
          </p>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/35 z-50 flex items-center justify-center">
          <div className="w-13 h-13 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
