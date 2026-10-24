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
├── 03-keputusan-editorial.html        # Keputusan revisi (D3/D4) & penolakan (D1/D2)
├── 03-keputusan-editorial.txt         # Versi teks polos (plain text)
├── 04-artikel-terbit.html             # Pengumuman publikasi resmi & DOI
├── 04-artikel-terbit.txt              # Versi teks polos (plain text)
├── /assets
│   └── logo-jteba.png                 # Berkas logo resmi JTEBA (resolusi tinggi)
└── README.md                          # Panduan pemakaian & pemetaan placeholder
```

---

## 2. Daftar & Penjelasan Template

| No | Berkas | Status / Warna | Pemicu (Trigger) | Penerima | CTA Utama |
|---|---|---|---|---|---|
| 1 | `01-tanda-terima-submission.html` | Info (Biru `#eff6ff`) | Naskah baru masuk lewat formulir submit | Penulis korespondensi | `Buka Portal JTEBA` |
| 2 | `02-loa-dan-tagihan-apc.html` | Diterima (Hijau `#f0fdf4`) + APC (Kuning `#fffbeb`) | Naskah resmi dinyatakan diterima | Penulis korespondensi | `Kirim Bukti Pembayaran` |
| 3 | `03-keputusan-editorial.html` | Revisi (Kuning `#fffbeb`) / Ditolak (Abu `#f1f5f9`) | Evaluasi reviewer / editor selesai | Penulis korespondensi | `Unggah Revisi di Portal` / `Buka Portal` |
| 4 | `04-artikel-terbit.html` | Terbit (Hijau `#f0fdf4` + Emas `#c89b3c`) | Artikel resmi tayang online & ber-DOI | Semua penulis naskah | `Lihat Artikel di Portal` |

---

## 3. Daftar Placeholder Sistem

Setiap placeholder ditulis menggunakan huruf kapital di dalam kurung siku `[NAMA_PLACEHOLDER]`. Pertahankan nama placeholder ini saat mengintegrasikan dengan sistem backend atau OJS.

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

- **Layout Berbasis Tabel:** Menggunakan struktur tabel bertingkat dengan atribut `role="presentation"` dan `border="0" cellpadding="0" cellspacing="0"`.
- **Garis Pemisah:** Garis pembatas kartu diterapkan pada elemen `<td>` (`border-bottom: 1px solid #e2e8f0;`) guna mencegah masalah rendering pada Microsoft Outlook desktop.
- **Lebar Kontainer:** Terstandarisasi 640px maksimal, dengan penyesuaian responsif fluida hingga 100% pada layar ponsel pintar di bawah 480px.
- **Kontras Warna:** Telah memenuhi rasio standar minimum WCAG AA (minimal 4.5:1 untuk teks normal dan 3.0:1 untuk teks besar).
- **Aksesibilitas Dark Mode:** Didukung melalui tag `<meta name="color-scheme" content="light dark">` dengan kontras yang tetap terjaga.
