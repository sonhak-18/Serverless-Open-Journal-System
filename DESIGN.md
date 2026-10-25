# Serverless Open Journal System Design Guidelines

## Identity
- **Publisher**: Lembaga Riset / Universitas / Asosiasi Ilmiah
- **Journal**: Jurnal Ilmiah Akses Terbuka (Open Access Scientific Journal)
- **Scope**: Multidisiplin / Sains & Teknologi Terapan / Sosial Humaniora.
- **Model**: Open Access (Bebas biaya submit & review, APC terjangkau setelah LoA).

## Personality & Tone
- **Dignified & Classic Academic**: Menampilkan integritas dan wibawa ilmiah berstandar COPE.
- **Transparent & Direct**: Alur penyerahan naskah, kebijakan peer-review double-blind, dan etika publikasi disajikan lugas dan transparan.
- **High Readability**: Tipografi tajam dengan hierarki sitasi APA 7th Edition yang terstruktur rapi.

## Color Palette
- **Primary Ink**: Deep Academic Navy (`#0f284e` / `#0a1a33`) untuk masthead, judul jurnal, dan navigasi utama.
- **Academic Accent**: Warm Gold (`#c89b3c`) dan Academic Teal (`#16707a`) untuk identitas, status badge, dan aksen penting.
- **Background**: Warm Paper Off-White (`#fbfbfa`) dan Pure White (`#ffffff`) untuk kartu konten.
- **Borders & Dividers**: Subtle Academic Slate (`#e2e8f0` dan `#cbd5e1`).
- **Body Text**: Deep Ink Charcoal (`#1e293b`), teks sekunder (`#475569`) dengan rasio kontras WCAG AA/AAA.

## Typography
- **Headings & Masthead**: Editorial Serif (`Charter`, `Merriweather`, `Georgia`, serif) untuk memberi kesan prestisius dan terbitan ilmiah klasik.
- **Body & Metadata**: Clear Sans (`Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, sans-serif) untuk kenyamanan membaca abstrak dan data bibliografi.

## Dials
- **ENERGY**: 2 (Tenang, stabil, terpercaya)
- **RHYTHM**: 2 (Terstruktur, konsisten, hierarkis)
- **MOTION**: 1 (Hanya transisi fungsional halus pada tombol dan navigasi)

## Component Design Specifications

### 1. Banner Edisi Perdana (Call for Papers Mode) vs Active Issue Card
- **Call for Papers Card**:
  - Border: `border-amber-300` dengan latar gradasi halus `bg-amber-50/60`.
  - Iconography: Ikon kalender dan pengumuman emas `text-amber-800`.
  - Tipografi: Serif headline dengan tombol aksi ganda (*Petunjuk Penulisan* & *Kirim Naskah*).
- **Active Issue Card**:
  - Border: `border-academic-border` berlatar putih bersih `bg-white` dengan bayangan lembut `shadow-xs`.
  - Metadata: Segel terbitan monospaced `Vol. X No. Y (Tahun)` dan tautan DOI resmi artikel.

### 2. Barcode GS1 EAN-13 & Validasi Status ISSN
- **Rendering Vektor SVG**:
  - Dihasilkan via `src/lib/issn.ts` dengan lebar garis presisi (proporsi bar hitam dan putih baku GS1).
  - Latar putih dengan kontras maksimal (`#000000` di atas `#ffffff`) dan tipografi monospaced di bawah garis bar untuk keterbacaan pemindai optik.
- **Badge Status ISO 3297 di Admin GUI**:
  - Valid: `bg-emerald-50 text-emerald-700 border-emerald-200`
  - Check Digit Salah: `bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse`
  - Digit Belum Lengkap: `bg-amber-50 text-amber-700 border-amber-200`

### 3. Mesin Pencarian Artikel Ilmiah (`/search`)
- **Header Form**: Form input bersih dengan ikon kaca pembesar, tombol reset, dan filter terlipat (accordion) untuk tahun dan bidang kajian (*Audit, Akuntansi, Pajak*).
- **Hasil Temuan**: Kartu naskah bergaya OJS dengan judul bersambung ke halaman detail `/article/[slug]`, daftar penulis bercetak tebal, nomor halaman, dan tombol unduh PDF cepat.

### 4. Navigasi Tab Admin GUI (Level 1 & Level 2)
- **Active Tab**: Border bawah `border-academic-navy` 2px tebal, font tebal `font-bold`, teks `text-academic-navy`.
- **Inactive Tab**: Border bawah `border-transparent`, teks netral `text-slate-600` dengan efek hover halus.
- **Persistensi**: Sinkronisasi status aktif ke `sessionStorage` dengan fallback ke hash URL (`#form-add-new-issue`).
