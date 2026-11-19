import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, GOOGLE_SERVER_CLIENT_ID } from './firebase';

class AuthService {
  lastError = '';
  private initialized = false;

  private ensureInit() {
    if (this.initialized) return;
    this.initialized = true;
    try {
      GoogleAuth.initialize({
        clientId: GOOGLE_SERVER_CLIENT_ID,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    } catch {
      // Safe fallback when running in plain browser without plugin init
    }
  }

  onUserChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  get currentUser(): User | null {
    return auth.currentUser;
  }

  get uid(): string {
    return auth.currentUser?.uid ?? '';
  }

  get userName(): string {
    return auth.currentUser?.displayName ?? '';
  }

  get userEmail(): string {
    return auth.currentUser?.email ?? '';
  }

  get userPhoto(): string {
    return auth.currentUser?.photoURL ?? '';
  }

  get isLoggedIn(): boolean {
    return auth.currentUser !== null;
  }

  async signIn(): Promise<boolean> {
    this.lastError = '';
    this.ensureInit();

    try {
      if (Capacitor.isNativePlatform()) {
        const googleUser = await GoogleAuth.signIn();
        const idToken = googleUser?.authentication?.idToken;
        const accessToken = googleUser?.authentication?.accessToken;
        if (!idToken) {
          this.lastError = 'Google tidak mengembalikan ID token.';
          return false;
        }
        const credential = GoogleAuthProvider.credential(idToken, accessToken);
        await signInWithCredential(auth, credential);
        return true;
      } else {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await signInWithPopup(auth, provider);
        return true;
      }
    } catch (err: unknown) {
      this.lastError = this.formatError(err);
      console.error('Login gagal:', err);
      return false;
    }
  }

  async signOut(): Promise<void> {
    this.ensureInit();
    try {
      if (Capacitor.isNativePlatform()) {
        await GoogleAuth.signOut();
      }
    } catch {
      // Ignore if not signed into GoogleAuth natively
    }
    await firebaseSignOut(auth);
  }

  private formatError(err: unknown): string {
    const raw = err instanceof Error ? `${(err as { code?: string }).code ?? ''} ${err.message}` : String(err);
    const detail = raw.toLowerCase();

    if (detail.includes('api_exception: 10') || detail.includes('developer_error') || detail.includes('10:')) {
      return (
        'Konfigurasi Google Sign-In Android belum lengkap. ' +
        'Tambahkan SHA-1 dan SHA-256 aplikasi di Firebase Console, ' +
        'lalu unduh google-services.json terbaru dan build ulang aplikasi.'
      );
    }
    if (detail.includes('sign_in_canceled') || detail.includes('popup-closed-by-user') || detail.includes('12501')) {
      return 'Login Google dibatalkan.';
    }
    if (detail.includes('network_error') || detail.includes('network-request-failed')) {
      return 'Tidak dapat terhubung ke Google/Firebase. Cek koneksi internet.';
    }
    if (detail.includes('account-exists-with-different-credential')) {
      return 'Email ini sudah terdaftar dengan metode login lain.';
    }
    if (detail.includes('operation-not-allowed')) {
      return 'Provider Google belum diaktifkan di Firebase Authentication.';
    }
    return `Login gagal: ${raw}`;
  }
}

export const authService = new AuthService();
