# Kasirku (React + Capacitor Android)

Aplikasi Kasir & Operasional Toko berbasis **React 18 + Vite + TypeScript + Tailwind CSS + Capacitor Android** dengan backend **Firebase Authentication (Google Sign-In)** dan **Cloud Firestore**.

## Fitur Utama
- **Kasir (POS):** Filter barang satuan & timbangan (gram/ons/kg), keranjang belanja interaktif, hitung otomatis kembalian, dan cetak/bagikan struk ke WhatsApp.
- **Scanner Barcode Kamera:** 3 mode pemindaian (`cart` untuk tambah langsung ke keranjang, `field` untuk input kode barcode, dan `count` untuk menghitung stok awal berulang kali).
- **Manajemen Stok & Sampah:** Ringkasan stok (Total, Menipis, Habis), tambah/edit produk inline, dan fitur Sampah (soft-delete dengan pemulihan otomatis hingga 30 hari).
- **Catatan Utang:** Pencatatan utang pelanggan, cicilan/pelunasan bertahap, serta filter status lunas/belum lunas.
- **Laporan Harian & Grafik 7 Hari:** Rekap pendapatan hari ini, rincian barang terjual, indikator keramaian toko, dan grafik transaksi 7 hari terakhir.
- **Distribusi APK & Cek Update Mandiri (Vercel + GitHub Releases):** Halaman khusus `/download` untuk mengunduh `.apk` terbaru dari Vercel serta tombol **Cek Update Aplikasi** langsung di dalam aplikasi tanpa perlu biaya Google Play Store.

## Cara Deploy Halaman Download & Update ke Vercel (Gratis)
1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **Add New Project** &rarr; pilih repository **`pradanadimas534/AppCasier`** &rarr; klik **Deploy** (pengaturan Vite sudah otomatis terdeteksi).
3. Setelah deploy selesai, halaman download `.apk` bisa langsung diakses di:
   - `https://<domain-vercel-anda>.vercel.app/download` (atau lewat tombol **Download Aplikasi Android (.apk)** di halaman Login).
4. **Cara merilis update versi baru ke pengguna:**
   - Ubah `CURRENT_APP_VERSION` / `CURRENT_BUILD_NUMBER` di `src/services/updateService.ts` dan `public/version.json`.
   - Build APK baru (`npm run build && npx cap sync android && cd android && ./gradlew assembleRelease`) lalu salin ke `public/kasirku-latest.apk` (atau cukup `git push` karena GitHub Actions otomatis mem-build dan merilis APK terbaru ke GitHub Releases).
   - Aplikasi `.apk` yang sudah terpasang di HP pengguna akan otomatis mendeteksi versi baru tersebut dan memunculkan tombol **Download Update**.

## Perintah Development & Build APK

### 1. Menjalankan di Browser (Development)
```bash
npm install
npm run dev
```

### 2. Menjalankan Unit Test
```bash
npm test
```

### 3. Build Web Bundle & Sinkronisasi ke Android
```bash
npm run build
npx cap sync android
```

### 4. Build File `.apk` (Android)
Pastikan **JDK 17** dan **Android SDK** terpasang, lalu jalankan:
```bash
cd android
./gradlew assembleDebug assembleRelease
```

Hasil file `.apk` akan tersedia di:
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`
