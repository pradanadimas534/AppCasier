# Kasirku (React + Capacitor Android)

Aplikasi Kasir & Operasional Toko berbasis **React 18 + Vite + TypeScript + Tailwind CSS + Capacitor Android** dengan backend **Firebase Authentication (Google Sign-In)** dan **Cloud Firestore**.

## Fitur Utama
- **Kasir (POS):** Filter barang satuan & timbangan (gram/ons/kg), keranjang belanja interaktif, hitung otomatis kembalian, dan cetak/bagikan struk ke WhatsApp.
- **Scanner Barcode Kamera:** 3 mode pemindaian (`cart` untuk tambah langsung ke keranjang, `field` untuk input kode barcode, dan `count` untuk menghitung stok awal berulang kali).
- **Manajemen Stok & Sampah:** Ringkasan stok (Total, Menipis, Habis), tambah/edit produk inline, dan fitur Sampah (soft-delete dengan pemulihan otomatis hingga 30 hari).
- **Catatan Utang:** Pencatatan utang pelanggan, cicilan/pelunasan bertahap, serta filter status lunas/belum lunas.
- **Laporan Harian & Grafik 7 Hari:** Rekap pendapatan hari ini, rincian barang terjual, indikator keramaian toko, dan grafik transaksi 7 hari terakhir.

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
