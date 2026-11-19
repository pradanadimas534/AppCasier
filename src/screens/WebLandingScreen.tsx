import React, { useState } from 'react';
import { useKasir } from '../context/KasirContext';
import './kasirku-landing.css';

export const WebLandingScreen: React.FC<{
  onOpenDownloadPage?: () => void;
}> = () => {
  const { login, loginError, showToast } = useKasir();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    const ok = await login();
    if (!ok) {
      setLoginLoading(false);
      showToast(loginError || 'Login gagal, coba lagi', 'error');
    }
  };

  const closeMenu = () => setMenuOpen(false);
  const currentYear = new Date().getFullYear();

  return (
    <div className="kasirku-landing">
      <header className="site-header" id="top">
        <div className="container nav-wrap">
          <a className="brand" href="#top" aria-label="Kasirku Beranda">
            <img src="/assets/logo.svg" alt="" width="43" height="43" />
            <span>
              <strong>Kasirku</strong>
              <small>POS Bengkel &amp; Retail</small>
            </span>
          </a>

          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`main-nav ${menuOpen ? 'open' : ''}`} id="main-nav">
            <a className="active" href="#top" onClick={closeMenu}>
              Beranda
            </a>
            <a href="#fitur" onClick={closeMenu}>
              Fitur
            </a>
            <a href="#keunggulan" onClick={closeMenu}>
              Keunggulan
            </a>
            <a href="#cara-kerja" onClick={closeMenu}>
              Cara Kerja
            </a>
            <a href="#kontak" onClick={closeMenu}>
              Kontak
            </a>
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              disabled={loginLoading}
              onClick={handleLogin}
              className="btn btn-outline btn-small"
            >
              {loginLoading ? 'Masuk...' : 'Masuk'}
            </button>
            <a
              className="btn btn-primary btn-small"
              href="/kasirku-latest.apk"
              download="Kasirku.apk"
            >
              Coba Gratis <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-orb orb-one" />
          <div className="hero-orb orb-two" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="spark">✦</span> Solusi Kasir Modern untuk Bengkel
                &amp; Retail
              </div>
              <h1>
                Kelola Bengkel &amp; Penjualan Retail <em>Lebih Mudah</em>
              </h1>
              <p className="hero-lead">
                Aplikasi POS lengkap untuk bengkel, layanan servis, penjualan
                retail (minuman, oli, sparepart), dan manajemen stok dalam satu
                sistem.
              </p>
              <div className="hero-actions">
                <a
                  className="btn btn-primary btn-large"
                  href="/kasirku-latest.apk"
                  download="Kasirku.apk"
                >
                  Coba Sekarang Gratis <span aria-hidden="true">→</span>
                </a>
                <a className="btn btn-play btn-large" href="#fitur">
                  <span className="play-icon">▶</span> Lihat Fitur
                </a>
              </div>
              <div className="trust-row">
                <div className="trust-item">
                  <span className="trust-icon">↯</span>
                  <span>
                    <b>Setup Cepat</b>
                    <small>Tanpa instalasi rumit</small>
                  </span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">☁</span>
                  <span>
                    <b>Berbasis Web</b>
                    <small>Akses dari mana saja</small>
                  </span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">♧</span>
                  <span>
                    <b>Data Terjaga</b>
                    <small>Tersinkron di akun</small>
                  </span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-glow" />
              <img
                src="/assets/kasirku-dashboard-devices.png"
                alt="Preview dashboard Kasirku pada laptop dan aplikasi mobile"
                width="1648"
                height="928"
              />
              <div className="floating-note">
                <span className="note-dot" />
                <span>
                  <b>Semua operasional</b>
                  <small>Dalam satu dashboard</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="proof-strip" aria-label="Ringkasan manfaat">
          <div className="container proof-grid">
            <div>
              <strong>01</strong>
              <span>
                <b>Transaksi</b>
                <small>Catat penjualan lebih praktis</small>
              </span>
            </div>
            <div>
              <strong>02</strong>
              <span>
                <b>Layanan</b>
                <small>Kelola pekerjaan servis</small>
              </span>
            </div>
            <div>
              <strong>03</strong>
              <span>
                <b>Persediaan</b>
                <small>Pantau stok barang retail</small>
              </span>
            </div>
            <div>
              <strong>04</strong>
              <span>
                <b>Laporan</b>
                <small>Pantau performa usaha</small>
              </span>
            </div>
          </div>
        </section>

        <section className="section features-section" id="fitur">
          <div className="container">
            <div className="section-heading">
              <span className="section-kicker">✦ Fitur Unggulan</span>
              <h2>
                Semua Kebutuhan Bengkel &amp; Retail dalam{' '}
                <em>Satu Aplikasi</em>
              </h2>
              <p>
                Dirancang untuk membantu operasional harian lebih rapi, efisien,
                dan mudah dipantau.
              </p>
            </div>
            <div className="feature-grid">
              <article className="feature-card">
                <div className="feature-icon coral">▣</div>
                <h3>Kasir Cepat &amp; Mudah</h3>
                <p>
                  Proses transaksi layanan maupun penjualan retail dengan alur
                  yang praktis.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon blue">⌁</div>
                <h3>Manajemen Layanan</h3>
                <p>
                  Kelola layanan servis, paket pekerjaan, dan harga secara
                  fleksibel.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon orange">◇</div>
                <h3>Stok Retail</h3>
                <p>
                  Kelola stok minuman, oli, sparepart, dan berbagai barang retail
                  lainnya.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon green">▥</div>
                <h3>Laporan Lengkap</h3>
                <p>
                  Pantau penjualan, layanan, stok, dan performa bisnis melalui
                  laporan.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon purple">♙</div>
                <h3>Multi Pengguna</h3>
                <p>
                  Atur akses sesuai peran seperti admin, kasir, mekanik, dan
                  owner.
                </p>
              </article>
              <article className="feature-card">
                <div className="feature-icon sky">☁</div>
                <h3>Akses Fleksibel</h3>
                <p>
                  Gunakan aplikasi melalui browser desktop maupun perangkat
                  mobile.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section advantage-section" id="keunggulan">
          <div className="container advantage-grid">
            <div className="advantage-copy">
              <span className="section-kicker">Kenapa Kasirku?</span>
              <h2>
                Operasional lebih tertata. <em>Bisnis lebih terkendali.</em>
              </h2>
              <p>
                Kurangi pencatatan yang tercecer. Satukan transaksi, layanan,
                produk, dan persediaan agar aktivitas usaha lebih mudah dipantau.
              </p>
              <ul className="check-list">
                <li>
                  <span>✓</span> Informasi transaksi lebih mudah ditelusuri
                </li>
                <li>
                  <span>✓</span> Data produk dan stok berada dalam satu tempat
                </li>
                <li>
                  <span>✓</span> Ringkasan aktivitas membantu evaluasi usaha
                </li>
                <li>
                  <span>✓</span> Tampilan dirancang nyaman di desktop dan mobile
                </li>
              </ul>
              <button
                type="button"
                onClick={handleLogin}
                className="text-link"
              >
                Jelajahi Aplikasi <span>→</span>
              </button>
            </div>

            <div className="benefit-panel">
              <div className="panel-top">
                <span className="panel-label">
                  Satu sistem untuk aktivitas harian
                </span>
                <span className="live-pill">
                  <i /> Terintegrasi
                </span>
              </div>
              <div className="benefit-main">
                <div className="benefit-symbol">✦</div>
                <div>
                  <b>Kontrol usaha dari satu tempat</b>
                  <small>Mulai dari kasir hingga laporan</small>
                </div>
              </div>
              <div className="mini-stat-grid">
                <div className="mini-stat">
                  <span className="mini-icon pink">▣</span>
                  <b>Kasir</b>
                  <small>Transaksi penjualan</small>
                </div>
                <div className="mini-stat">
                  <span className="mini-icon blue">⌁</span>
                  <b>Layanan</b>
                  <small>Aktivitas servis</small>
                </div>
                <div className="mini-stat">
                  <span className="mini-icon orange">◇</span>
                  <b>Stok</b>
                  <small>Barang retail</small>
                </div>
                <div className="mini-stat">
                  <span className="mini-icon green">▥</span>
                  <b>Laporan</b>
                  <small>Ringkasan usaha</small>
                </div>
              </div>
              <div className="panel-footer">
                <span className="avatar-stack">
                  <i>A</i>
                  <i>K</i>
                  <i>M</i>
                </span>
                <span>Dirancang untuk kolaborasi tim operasional</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section workflow-section" id="cara-kerja">
          <div className="container">
            <div className="section-heading">
              <span className="section-kicker">Alur Sederhana</span>
              <h2>
                Mulai kelola usaha dalam <em>beberapa langkah</em>
              </h2>
              <p>Alur penggunaan yang mudah dipahami oleh tim operasional.</p>
            </div>
            <div className="steps-grid">
              <div className="step-card">
                <span className="step-number">01</span>
                <div className="step-icon">↗</div>
                <h3>Masuk Aplikasi</h3>
                <p>Buka Kasirku melalui web atau perangkat yang digunakan.</p>
              </div>
              <div className="step-card">
                <span className="step-number">02</span>
                <div className="step-icon">▣</div>
                <h3>Kelola Aktivitas</h3>
                <p>Catat transaksi, layanan, produk, dan pergerakan stok.</p>
              </div>
              <div className="step-card">
                <span className="step-number">03</span>
                <div className="step-icon">▥</div>
                <h3>Pantau Laporan</h3>
                <p>Lihat ringkasan aktivitas untuk membantu keputusan usaha.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section" id="kontak">
          <div className="container cta-box">
            <div className="cta-decoration" />
            <div className="cta-content">
              <span className="section-kicker light">Saatnya lebih praktis</span>
              <h2>Siap mengelola bengkel &amp; retail dengan lebih mudah?</h2>
              <p>
                Mulai gunakan Kasirku untuk membantu aktivitas operasional harian
                bisnis Anda.
              </p>
              <div className="cta-actions">
                <a
                  className="btn btn-white btn-large"
                  href="/kasirku-latest.apk"
                  download="Kasirku.apk"
                >
                  Download Aplikasi <span>→</span>
                </a>
                <button
                  type="button"
                  disabled={loginLoading}
                  onClick={handleLogin}
                  className="btn btn-glass btn-large"
                >
                  {loginLoading ? 'Memproses Login...' : 'Masuk Versi Web'}
                </button>
              </div>
            </div>
            <div className="cta-stamp">
              Kasirku
              <br />
              <small>POS Bengkel &amp; Retail</small>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-main">
          <a className="brand footer-brand" href="#top">
            <img src="/assets/logo.svg" alt="" width="40" height="40" />
            <span>
              <strong>Kasirku</strong>
              <small>POS Bengkel &amp; Retail</small>
            </span>
          </a>
          <p>
            Solusi praktis untuk membantu pengelolaan transaksi, layanan, dan
            stok retail.
          </p>
          <div className="footer-links">
            <a href="#fitur">Fitur</a>
            <a href="#keunggulan">Keunggulan</a>
            <a href="#cara-kerja">Cara Kerja</a>
            <button type="button" onClick={handleLogin}>
              Aplikasi
            </button>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {currentYear} Kasirku. Semua hak dilindungi.</span>
          <span>Dibuat untuk operasional yang lebih mudah.</span>
        </div>
      </footer>

      {loginLoading && (
        <div className="fixed inset-0 bg-black/35 z-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
