import { Capacitor } from '@capacitor/core';

export const DEFAULT_APP_VERSION = '1.1.0';
export const DEFAULT_BUILD_NUMBER = 37;

export const VERCEL_BASE_URL = 'https://appcasier.vercel.app';
export const GITHUB_REPO = 'pradanadimas534/AppCasier';
export const GITHUB_LATEST_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
export const GITHUB_RELEASES_PAGE = `https://github.com/${GITHUB_REPO}/releases/latest`;

export interface AppVersionInfo {
  version: string;
  buildNumber: number;
  releasedAt: string;
  apkUrl: string;
  githubReleaseUrl: string;
  sizeMb: string;
  minAndroid: string;
  notes: string[];
  hasUpdate: boolean;
}

export function getInstalledVersion(): { version: string; buildNumber: number } {
  // Selalu gunakan versi asli yang tertanam di dalam binary APK/build ini
  return { version: DEFAULT_APP_VERSION, buildNumber: DEFAULT_BUILD_NUMBER };
}

export function compareSemver(a: string, b: string): number {
  const cleanA = a
    .replace(/^[^0-9]*/, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
  const cleanB = b
    .replace(/^[^0-9]*/, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    const va = cleanA[i] ?? 0;
    const vb = cleanB[i] ?? 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

export function isNewerVersion(
  remoteVersion: string,
  remoteBuild: number,
  localVersion?: string,
  localBuild?: number
): boolean {
  const installed = getInstalledVersion();
  const curVer = localVersion ?? installed.version;
  const curBuild = localBuild ?? installed.buildNumber;

  const cmp = compareSemver(remoteVersion, curVer);
  if (cmp > 0) return true;
  if (cmp < 0) return false;
  return remoteBuild > curBuild;
}

/**
 * Membersihkan baris changelog otomatis dari GitHub (seperti "**Full Changelog**: https://...")
 * agar tampilan di popup bersih dan mudah dibaca pengguna.
 */
export function sanitizeReleaseNotes(rawBody: string, fallbackNotes: string[]): string[] {
  if (!rawBody || !rawBody.trim()) return fallbackNotes;
  const lines = rawBody
    .split('\n')
    .map((l) => l.replace(/^[-*•#>\s]+/, '').trim())
    .filter((l) => {
      if (!l) return false;
      const lower = l.toLowerCase();
      if (lower.includes('full changelog')) return false;
      if (lower.startsWith('http://') || lower.startsWith('https://')) return false;
      if (lower.includes('github.com/')) return false;
      return true;
    })
    .slice(0, 5);

  return lines.length > 0 ? lines : fallbackNotes;
}

export async function fetchLatestVersionInfo(): Promise<AppVersionInfo> {
  const installed = getInstalledVersion();

  let baseInfo: AppVersionInfo = {
    version: installed.version,
    buildNumber: installed.buildNumber,
    releasedAt: new Date().toISOString(),
    apkUrl: '/kasirku-latest.apk',
    githubReleaseUrl: GITHUB_RELEASES_PAGE,
    sizeMb: '5.5 MB',
    minAndroid: 'Android 7.0+ (Nougat)',
    notes: [
      'Pembaruan instan 1-klik langsung di dalam aplikasi tanpa perlu download APK ulang',
      'Peningkatan stabilitas Kasir, Scanner Barcode, dan Sinkronisasi Cloud',
    ],
    hasUpdate: false,
  };

  const versionJsonUrl = Capacitor.isNativePlatform()
    ? `${VERCEL_BASE_URL}/version.json?t=${Date.now()}`
    : `/version.json?t=${Date.now()}`;

  try {
    const res = await fetch(versionJsonUrl, { cache: 'no-store' });
    if (res.ok) {
      const data = (await res.json()) as Partial<AppVersionInfo>;
      baseInfo = {
        ...baseInfo,
        ...data,
        notes:
          Array.isArray(data.notes) && data.notes.length > 0
            ? data.notes
            : baseInfo.notes,
      };
    }
  } catch {
    // Ignore version.json fetch error when offline
  }

  try {
    const ghRes = await fetch(GITHUB_LATEST_API, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (ghRes.ok) {
      const gh = (await ghRes.json()) as {
        tag_name?: string;
        name?: string;
        published_at?: string;
        html_url?: string;
        body?: string;
        assets?: Array<{
          name?: string;
          browser_download_url?: string;
          size?: number;
        }>;
      };

      const apkAsset = gh.assets?.find((a) => a.name?.endsWith('.apk'));
      const tag = gh.tag_name ?? '';
      const buildMatch = tag.match(/build-(\d+)/i);
      const semverMatch = tag.match(/v?(\d+\.\d+\.\d+)/);

      const remoteBuild = buildMatch
        ? parseInt(buildMatch[1], 10)
        : baseInfo.buildNumber;
      const remoteVersion = semverMatch ? semverMatch[1] : baseInfo.version;

      if (apkAsset?.browser_download_url) {
        if (Capacitor.isNativePlatform()) {
          baseInfo.apkUrl = apkAsset.browser_download_url;
          if (apkAsset.size) {
            baseInfo.sizeMb = `${(apkAsset.size / (1024 * 1024)).toFixed(1)} MB`;
          }
        }
      }
      if (gh.published_at) {
        baseInfo.releasedAt = gh.published_at;
      }
      if (gh.html_url) {
        baseInfo.githubReleaseUrl = gh.html_url;
      }
      if (remoteBuild > baseInfo.buildNumber) {
        baseInfo.buildNumber = remoteBuild;
      }
      if (compareSemver(remoteVersion, baseInfo.version) > 0) {
        baseInfo.version = remoteVersion;
      }
      if (gh.body) {
        baseInfo.notes = sanitizeReleaseNotes(gh.body, baseInfo.notes);
      }
    }
  } catch {
    // Use baseInfo on network error
  }

  if (Capacitor.isNativePlatform() && baseInfo.apkUrl.startsWith('/')) {
    baseInfo.apkUrl = `${VERCEL_BASE_URL}${baseInfo.apkUrl}`;
  }

  baseInfo.hasUpdate = isNewerVersion(
    baseInfo.version,
    baseInfo.buildNumber,
    installed.version,
    installed.buildNumber
  );
  return baseInfo;
}
