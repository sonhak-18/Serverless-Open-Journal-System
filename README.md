# Sektansia Press — Platform Jurnal Ilmiah (JTAAP)

Platform web publikasi jurnal ilmiah modern berbasis **Astro + Tailwind CSS** yang dirancang khusus untuk di-host 100% tanpa biaya di **Cloudflare Pages**, dengan penyimpanan file PDF terdistribusi via **Cloudflare Worker Google Drive Index**.

## Fitur Utama
1. **Diamond Open Access:** Bebas biaya submission & publishing (APC: Rp 0) untuk penulis dan pembaca.
2. **Alur Review & Submit Cepat:** Integrasi pengajuan naskah langsung ke WhatsApp dan Email resmi tanpa birokrasi sistem login OJS yang berbelit.
3. **Google Scholar Ready:** Dilengkapi meta tag sitasi akademik otomatis (`citation_title`, `citation_author`, `citation_pdf_url`, `citation_volume`, `citation_issue`, dll.).
4. **Penyimpanan Naskah Terdistribusi:** Siap dihubungkan ke Cloudflare Worker Google Drive Index (`cdn-papers.sektansia.workers.dev`).
5. **Widget Sitasi Interaktif:** Salin format sitasi (APA 7th, IEEE, Harvard) dengan satu klik ke clipboard.
6. **Performa Edge:** Skor 100 di Google PageSpeed, tanpa beban database MySQL dan kebal eksploitasi PHP.

---

## Struktur Konfigurasi

### 1. Mengubah Data Jurnal & Kontak Redaksi
Buka file `src/config/journal.ts`:
```ts
export const journalConfig = {
  name: 'Jurnal Terbuka Audit, Akuntansi, dan Pajak',
  shortName: 'JTAAP',
  publisher: 'Sektansia Press',
  submission: {
    email: 'redaksi@sektansia.org',
    whatsappNumber: '6281234567890', // Ubah nomor WhatsApp di sini
    whatsappDisplay: '+62 812-3456-7890',
  },
  storage: {
    // Masukkan URL Google Drive Index kamu setelah dideploy di Cloudflare Workers:
    gdriveIndexBaseUrl: 'https://cdn-papers.sektansia.workers.dev',
    pdfDirectoryPath: '/JTAAP/PDFs',
  }
};
```

### 2. Menambah Artikel Baru
Buka file `src/data/articles.ts`, lalu tambahkan data naskah pada array `articles`:
```ts
{
  slug: 'judul-naskah-artikel-kamu',
  title: 'Judul Lengkap Naskah Ilmiah',
  authors: [
    { name: 'Nama Penulis 1', affiliation: 'Universitas...' },
  ],
  abstract: 'Teks abstrak lengkap...',
  keywords: ['Kata Kunci 1', 'Kata Kunci 2'],
  volume: 1,
  issue: 1,
  year: 2026,
  pages: '45-58',
  firstPage: 45,
  lastPage: 58,
  publishDate: '2026-04-15',
  receivedDate: '2026-03-10',
  acceptedDate: '2026-04-01',
  doi: '10.5281/zenodo.jtaap.2026.1104',
  pdfFileName: 'jtaap-v1n1-04-penulis-judul.pdf',
  fileSizeBytes: 450000,
  subject: 'Audit', // 'Audit' | 'Akuntansi' | 'Pajak'
}
```

---

## Cara Menjalankan Secara Lokal

```bash
# 1. Masuk ke folder proyek
cd sektansia-press

# 2. Pasang dependensi
npm install

# 3. Jalankan server lokal
npm run dev
```
Buka browser di `http://localhost:4321`.

---

## Cara Deploy ke Cloudflare Pages

### Opsi A: Melalui Dashboard Cloudflare Pages (Rekomendasi)
1. Push repositori `sektansia-press` ini ke akun GitHub/GitLab kamu.
2. Buka dashboard Cloudflare: **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Pilih repositori `sektansia-press`.
4. Pengaturan Build:
   - **Framework preset:** `Astro`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Klik **Save and Deploy**. Web akan aktif dalam ~1 menit dengan custom domain atau subdomain `.pages.dev`.

### Opsi B: Melalui Wrangler CLI
```bash
npm run build
npx wrangler pages deploy dist --project-name sektansia-press
```

---

## Integrasi dengan Google Drive Index

1. Deploy repo Cloudflare Worker [Google Drive Index](https://gitlab.com/GoogleDriveIndex/Google-Drive-Index.git) ke akun Cloudflare kamu.
2. Buat folder di Google Drive (misal `/JTAAP/PDFs/`).
3. Upload file PDF naskah dengan nama yang sama seperti di `articles.ts` (contoh: `jtaap-v1n1-01-faisal-audit-risiko.pdf`).
4. Salin URL Worker kamu ke `src/config/journal.ts` pada bagian `storage.gdriveIndexBaseUrl`.
5. Semua tombol "Unduh PDF" di web akan otomatis menarik file langsung dari Google Drive kamu melalui Cloudflare Edge CDN.
