# Sektansia Press: Platform Jurnal Ilmiah (JTAAP)

Platform web publikasi jurnal ilmiah modern berbasis **Astro + Tailwind CSS** yang dirancang untuk di-host 100% tanpa biaya di **Cloudflare Pages**, terintegrasi dengan **Cloudflare D1** (SQLite Relasional di Edge), **Cloudflare Workers KV** (Global Edge Cache & Real-Time Metrics), dan penyimpanan file PDF terdistribusi via **Cloudflare Worker Google Drive Index**.

Diterbitkan oleh **Komunitas Riset Sektansia Press** untuk mengelola naskah ilmiah pada rumpun keilmuan Audit, Akuntansi, dan Perpajakan.

---

## Fitur Utama

1. **Classic OJS 2-Column Layout:** Struktur visual 100% presisi mengikuti standar Open Journal Systems (proporsi 68% naskah, 32% sidebar standarisasi, tombol PDF abu-abu khas, dan nomor halaman rata kanan).
2. **100% GUI Admin Dashboard (/admin):** Pengelolaan lengkap tanpa perlu mengedit file kode secara manual. Mengatur naskah artikel, susunan dewan redaksi, reviewer, toggle platform pengindeksan, WhatsApp/Email redaksi, serta URL Google Drive Index langsung lewat antarmuka grafis.
3. **Cloudflare D1 & Workers KV Integration:** Penyimpanan relasional terdistribusi di edge Cloudflare (D1) yang dipadukan dengan Workers KV untuk sub-millisecond page caching dan pelacakan metrik *Abstract Views* serta *PDF Downloads* secara real-time.
4. **Google Scholar Metadata Ready:** Meta tag sitasi akademik otomatis (`citation_title`, `citation_author`, `citation_pdf_url`, `citation_volume`, `citation_issue`, dll.) terisi otomatis untuk pengindeksan cepat mesin pencari ilmiah.
5. **Penyimpanan Naskah Google Drive CDN:** Terhubung ke Cloudflare Worker Google Drive Index untuk menyajikan file PDF berkecepatan tinggi tanpa membebani limit storage hosting.
6. **Widget Sitasi Interaktif:** Penulis dan pembaca dapat menyalin kutipan sitasi ilmiah (APA 7th, IEEE, Harvard) dengan satu klik ke clipboard.
7. **Privasi & Kebijakan Biaya Publikasi (APC):** Tidak ada klaim promosi berlebihan. Konfirmasi pembiayaan naskah dan korespondensi dilakukan secara tertutup dan profesional via WhatsApp/Email redaksi.

---

## Konfigurasi Cloudflare (D1 & KV)

Platform ini memiliki fallback in-memory otomatis saat dijalankan di lingkungan lokal, namun untuk deployment produksi di Cloudflare Pages, jalankan langkah berikut:

### 1. Buat Database D1
```bash
npx wrangler d1 create sektansia-db
```
Salin `database_id` yang dihasilkan ke file `wrangler.toml` pada bagian:
```toml
[[d1_databases]]
binding = "DB"
database_name = "sektansia-db"
database_id = "MASUKKAN_DATABASE_ID_ANDA"
```

### 2. Inisialisasi Skema D1
Eksekusi file skema SQL ke database D1 produksi Anda:
```bash
# Untuk database remote (Cloudflare Cloud):
npx wrangler d1 execute sektansia-db --remote --file=./schema.sql

# Untuk pengujian lokal D1:
npx wrangler d1 execute sektansia-db --local --file=./schema.sql
```

### 3. Buat Workers KV Namespace
```bash
npx wrangler kv:namespace create CACHE
```
Salin `id` yang dihasilkan ke file `wrangler.toml` pada bagian:
```toml
[[kv_namespaces]]
binding = "KV"
id = "MASUKKAN_KV_NAMESPACE_ID_ANDA"
```

---

## Panel Administrasi (GUI)

- **URL:** `http://localhost:4321/admin` (atau `https://domain-anda.pages.dev/admin`)
- **Default PIN:** `admin123`

### Tab yang Tersedia di Admin:
1. **Penerbitan Naskah:** Formulir input artikel baru (Judul, Penulis, Afiliasi, Email, Abstrak, Keywords, Volume, Nomor, Halaman, DOI, Nama File PDF, Bidang Fokus).
2. **Daftar Naskah:** Tinjau dan hapus naskah yang telah terbit.
3. **Dewan Redaksi:** Tambah dan hapus susunan Pemimpin Redaksi (*Editor-in-Chief*), Dewan Editor (*Editorial Board*), dan Mitra Bestari (*Peer Reviewers*).
4. **Kontak & Pengaturan:** Ubah nomor WhatsApp redaksi, Email korespondensi, lisensi publikasi, dan URL basis Google Drive Index.
5. **Platform Pengindeksan:** Aktifkan atau sembunyikan logo dan tautan eksternal pengindeks (Google Scholar, Garuda, Dimensions, Crossref, Neliti, WorldCat, ROAD) pada sidebar publik.

---

## Menjalankan Secara Lokal

```bash
# 1. Masuk ke direktori
cd sektansia-press

# 2. Instal dependensi
npm install

# 3. Jalankan server pengembangan
npm run dev
```
Buka browser di `http://localhost:4321`.

---

## Cara Deploy ke Cloudflare Pages

### Melalui Dashboard Cloudflare Pages:
1. Push repositori ini ke akun GitHub atau GitLab Anda.
2. Masuk ke dashboard Cloudflare: **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Pilih repositori `sektansia-press`.
4. Pengaturan Build:
   - **Framework preset:** `None` / `Astro`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Setelah build pertama selesai, buka menu **Settings** > **Functions** di proyek Pages Anda:
   - Sambungkan **D1 Database Bindings**: Nama binding `DB`, pilih database `sektansia-db`.
   - Sambungkan **KV Namespace Bindings**: Nama binding `KV`, pilih namespace `CACHE`.
6. Lakukan deploy ulang (*Retry deployment*). Web publik dan panel admin kini 100% aktif di edge Cloudflare.

---

## Integrasi dengan Google Drive Index

1. Deploy script Cloudflare Worker Google Drive Index ke akun Cloudflare Anda.
2. Buat folder naskah di Google Drive (misalnya `/JTAAP/PDFs/`).
3. Unggah file PDF dengan nama file yang konsisten (misalnya `jtaap-v1n1-01-faisal-audit-risiko.pdf`).
4. Masukkan URL Worker Anda ke pengaturan di menu `/admin` pada kolom **Google Drive Index URL**.
5. Semua tombol unduhan PDF pada portal publik akan langsung mengalirkan naskah dari Google Drive melalui CDN Cloudflare.
