import { Capacitor } from '@capacitor/core';

export const CURRENT_APP_VERSION = '1.0.0';
export const CURRENT_BUILD_NUMBER = 1;

/**
 * Jika Anda sudah men-deploy ke Vercel, aplikasi APK di HP akan otomatis
 * memeriksa update ke GitHub Releases (`pradanadimas534/AppCasier`)
 * dan ke endpoint `version.json`.
 */
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

export function compareSemver(a: string, b: string): number {
  const cleanA = a.replace(/^[^0-9]*/, '').split('.').map((n) => parseInt(n, 10) || 0);
  const cleanB = b.replace(/^[^0-9]*/, '').split('.').map((n) => parseInt(n, 10) || 0);
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
  localVersion = CURRENT_APP_VERSION,
  localBuild = CURRENT_BUILD_NUMBER
): boolean {
  const cmp = compareSemver(remoteVersion, localVersion);
  if (cmp > 0) return true;
  if (cmp < 0) return false;
  return remoteBuild > localBuild;
}

export async function fetchLatestVersionInfo(): Promise<AppVersionInfo> {
  // 1. Ambil metadata dasar dari /version.json (lokal atau Vercel)
  let baseInfo: AppVersionInfo = {
    version: CURRENT_APP_VERSION,
    buildNumber: CURRENT_BUILD_NUMBER,
    releasedAt: new Date().toISOString(),
    apkUrl: '/kasirku-latest.apk',
    githubReleaseUrl: GITHUB_RELEASES_PAGE,
    sizeMb: '5.5 MB',
    minAndroid: 'Android 7.0+ (Nougat)',
    notes: [
      'Rilis penuh Kasirku berbasis React + Capacitor Android',
      'Dukungan Cek Update Aplikasi langsung dari dalam APK',
    ],
    hasUpdate: false,
  };

  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      const data = (await res.json()) as Partial<AppVersionInfo>;
      baseInfo = {
        ...baseInfo,
        ...data,
        notes: Array.isArray(data.notes) ? data.notes : baseInfo.notes,
      };
    }
  } catch {
    // Ignore local version.json fetch error
  }

  // 2. Cek GitHub Releases API untuk melihat apakah ada build APK terbaru dari CI/CD
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
      // Tag dari GitHub Actions bisa berbentuk "v1.0.2" atau "build-12"
      const buildMatch = tag.match(/build-(\d+)/i);
      const semverMatch = tag.match(/v?(\d+\.\d+\.\d+)/);

      const remoteBuild = buildMatch
        ? parseInt(buildMatch[1], 10)
        : baseInfo.buildNumber;
      const remoteVersion = semverMatch ? semverMatch[1] : baseInfo.version;

      if (apkAsset?.browser_download_url) {
        // Jika berada di dalam APK Native, selalu arahkan ke URL absolut GitHub Release
        // atau gunakan apkAsset jika di web
        if (Capacitor.isNativePlatform()) {
          baseInfo.apkUrl = apkAsset.browser_download_url;
        }
        if (apkAsset.size) {
          baseInfo.sizeMb = `${(apkAsset.size / (1024 * 1024)).toFixed(1)} MB`;
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
      if (gh.body && gh.body.trim()) {
        const parsedLines = gh.body
          .split('\n')
          .map((l) => l.replace(/^[-*•]\s*/, '').trim())
          .filter((l) => l.length > 0 && !l.startsWith('#'))
          .slice(0, 6);
        if (parsedLines.length > 0) {
          baseInfo.notes = parsedLines;
        }
      }
    }
  } catch {
    // Jika offline atau GitHub API rate-limited, gunakan baseInfo dari version.json
  }

  // Jika sedang jalan di dalam APK Android dan apkUrl masih relatif ('/kasirku-latest.apk'),
  // arahkan fallback download ke GitHub Releases terbaru agar browser Android bisa mengunduh
  if (Capacitor.isNativePlatform() && baseInfo.apkUrl.startsWith('/')) {
    baseInfo.apkUrl = `${GITHUB_RELEASES_PAGE}/download/app-release.apk`;
  }

  baseInfo.hasUpdate = isNewerVersion(baseInfo.version, baseInfo.buildNumber);
  return baseInfo;
}
