# JTEBA — Panduan & Dokumentasi Template Email Resmi

Repositori ini memuat berkas template email resmi **JTEBA (Jurnal Terbuka Ekonomi, Bisnis, dan Akuntabilitas)** yang diterbitkan oleh **Organisasi Riset dan Publikasi Ilmiah Praniti**.

---

## 1. Struktur Berkas

```
/email-templates
├── 01-tanda-terima-submission.html    # Konfirmasi penerimaan naskah baru
├── 01-tanda-terima-submission.txt     # Versi teks polos (plain text)
├── 02-loa-dan-tagihan-apc.html        # Surat penerimaan (LoA) & rincian APC
├── 02-loa-dan-tagihan-apc.txt         # Versi teks polos (plain text)
│
├── 03-keputusan-editorial.html        # Template master keputusan editorial (switchable)
├── 03-keputusan-editorial.txt         # Versi teks polos master
├── 03-d1-desk-reject.html             # Varian D1: Penolakan awal / Desk Reject (Siap pakai)
├── 03-d2-tolak-review.html            # Varian D2: Penolakan setelah Peer Review (Siap pakai)
├── 03-d3-revisi-minor.html            # Varian D3: Permintaan Revisi Minor (Siap pakai)
├── 03-d4-revisi-mayor.html            # Varian D4: Permintaan Revisi Mayor (Siap pakai)
│
├── 04-artikel-terbit.html             # Pengumuman publikasi resmi & DOI
├── 04-artikel-terbit.txt              # Versi teks polos (plain text)
├── /assets
│   └── logo-jteba.png                 # Berkas logo resmi JTEBA (resolusi tinggi)
└── README.md                          # Panduan pemakaian & pemetaan placeholder
```

---

## 2. Cara Menggunakan Varian Keputusan Editorial (D1, D2, D3, D4)

Redaksi menyediakan berkas spesifik siap pakai untuk setiap jenis keputusan editorial tanpa perlu mengedit HTML manual:

| Kode Varian | Kapan Digunakan | Berkas Siap Pakai | Warna Status & Badge | Tombol CTA |
|---|---|---|---|---|
| **D1 (Desk Reject)** | Penolakan awal sebelum ke mitra bestari (karena luar cakupan / format salah / Turnitin > 20%) | [`03-d1-desk-reject.html`](03-d1-desk-reject.html) | Abu-abu (`#f1f5f9`), Badge: `DITOLAK (DESK REVIEW)` | `Buka Portal JTEBA` |
| **D2 (Tolak Review)** | Penolakan setelah proses penelaahan reviewer ganda selesai | [`03-d2-tolak-review.html`](03-d2-tolak-review.html) | Abu-abu (`#f1f5f9`), Badge: `DITOLAK` | `Buka Portal JTEBA` |
| **D3 (Revisi Minor)** | Naskah diterima dengan catatan perbaikan kecil (ejaan, referensi, grafik) | [`03-d3-revisi-minor.html`](03-d3-revisi-minor.html) | Kuning (`#fffbeb`), Badge: `REVISI MINOR` | `Unggah Revisi di Portal JTEBA` |
| **D4 (Revisi Mayor)** | Naskah butuh perbaikan mendasar (metodologi, analisis data, literatur) | [`03-d4-revisi-mayor.html`](03-d4-revisi-mayor.html) | Kuning (`#fffbeb`), Badge: `REVISI MAYOR` | `Unggah Revisi di Portal JTEBA` |

---

## 3. Daftar Placeholder Sistem

Setiap placeholder ditulis menggunakan huruf kapital di dalam kurung siku `[NAMA_PLACEHOLDER]`:

| Placeholder | Keterangan / Sumber Nilai |
|---|---|
| `[NAMA PENULIS KORESPONDENSI]` | Nama lengkap penulis utama / pengirim naskah |
| `[NAMA REKAN PENULIS]` | Nama penulis pendamping (co-authors) |
| `[INSTITUSI PENULIS]` | Afiliasi akademik, universitas, atau lembaga riset penulis |
| `[ID NASKAH]` | Kode unik registrasi naskah (contoh: `JTEBA-SUB-202610-0001`) |
| `[JUDUL NASKAH]` / `[JUDUL SINGKAT]` | Judul lengkap artikel ilmiah yang diajukan |
| `[BIDANG KAJIAN]` | Salah satu dari empat rumpun fokus JTEBA |
| `[TANGGAL MASUK]` | Tanggal berkas diunggah (format Indonesia: DD MMMM YYYY) |
| `[TANGGAL KEPUTUSAN]` | Tanggal surat keputusan diterbitkan |
| `[NAMA BERKAS NASKAH]` | Nama berkas manuskrip asli (contoh: `Manuskrip_JTEBA.docx`) |
| `[VOLUME]`, `[NOMOR]`, `[BULAN TAHUN]` | Volume, nomor issue, dan periode terbitan target |
| `[HALAMAN]` | Rentang halaman artikel pada terbitan (contoh: `1–15`) |
| `[TENGGAT REVISI]` | Batas akhir pengunggahan revisi (contoh: `14 November 2026`) |
| `[RINGKASAN ALASAN / CATATAN MITRA BESTARI, ANONIM]` | Catatan substantif telaah reviewer secara anonim |
| `[ALASAN]` / `[SARAN]` | Catatan evaluasi awal desk review / saran penyempurnaan |
| `[BATAS WAKTU PEMBAYARAN]` | Batas konfirmasi APC (contoh: `7 hari kalender sejak LoA`) |
| `[NAMA BANK]`, `[NOMOR REKENING]` | Rekening resmi perbankan penerima APC |
| `[NAMA PEMILIK REKENING]` | Nama atas nama pemilik rekening |
| `[DOI]` | Kode akhiran DOI resmi (contoh: `10.xxxx/jteba.v1i1.01`) |
| `[URL ARTIKEL]` | Tautan laman landing page artikel di portal JTEBA |
| `[SITASI APA 7]` | Format sitasi resmi mengikuti pedoman APA 7th Edition |
| `[EMAIL PENERIMA]` | Alamat email tujuan pengiriman surat |
| `[NOMOR WHATSAPP REDAKSI]` | Nomor WhatsApp resmi sekretariat redaksi |

---

## 4. Standar Teknis & Kompatibilitas Klien Email

- **Tata Letak Proporsional & Banner Status Anti-Patah:**
  - **Logo Chip:** Menggunakan berkas logo presisi yang telah dipangkas margin transparannya (*trimmed bounding box* 859x250) di dalam kotak chip putih (`padding: 8px 16px; border-radius: 6px;`) dengan proporsi seimbang terhadap masthead institusi.
  - **Judul Banner 2 Tingkat:** Memisahkan judul bahasa Indonesia (huruf kapital tebal 11.5px) dengan sub-judul bahasa Inggris (11px semi-bold) secara vertikal sehingga tidak mendesak kolom ID naskah di layar desktop maupun seluler.
  - **Badge ID Tiket Anti-Patah (`white-space: nowrap;`):** ID registrasi naskah dibungkus dalam sel tabel tiket mandiri berlatar putih dengan border lembut (`border: 1px solid [badgeBorder]; padding: 4px 10px; border-radius: 4px;`) berkode `white-space: nowrap;`. Ini menjamin teks `ID: [ID NASKAH]` tidak akan pernah terbelah atau patah dua baris di Outlook, Gmail, Apple Mail, maupun webmail lainnya.
- **Layout Berbasis Tabel:** Menggunakan struktur tabel bertingkat dengan atribut `role="presentation"` dan `border="0" cellpadding="0" cellspacing="0"`.
- **Garis Pemisah:** Garis pembatas kartu diterapkan pada elemen `<td>` (`border-bottom: 1px solid #e2e8f0;`) guna mencegah masalah rendering pada Microsoft Outlook desktop.
- **Lebar Kontainer:** Terstandarisasi 640px maksimal, dengan penyesuaian responsif fluida hingga 100% pada layar ponsel pintar di bawah 480px via `.stack-column` dan `.mobile-left`.
- **Kontras Warna:** Telah memenuhi rasio standar minimum WCAG AA (minimal 4.5:1 untuk teks normal dan 3.0:1 untuk teks besar).
- **Aksesibilitas Dark Mode:** Didukung melalui tag `<meta name="color-scheme" content="light dark">` dengan kontras yang tetap terjaga.
