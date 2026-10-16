# Serverless Open Journal System (OJS)

Platform web publikasi jurnal ilmiah modern berbasis **Astro + Tailwind CSS** yang dirancang untuk di-host 100% tanpa biaya di **Cloudflare Pages**, terintegrasi dengan **Cloudflare D1** (SQLite Relasional di Edge), **Cloudflare Workers KV** (Global Edge Cache & Real-Time Metrics), dan repositori penyimpanan PDF terdistribusi via **Cloudflare Repository Worker** dengan rotasi Google Service Accounts. Presisi mengikuti estetika klasik Open Journal Systems (OJS) dengan performa edge ultra-cepat.

---

## 1. Diagram Arsitektur Sistem (System Architecture)

```mermaid
flowchart TD
    subgraph Client["Pengguna & Peramban"]
        Visitor["Pembaca Naskah"]
        Admin["Dewan Redaksi / Editor"]
    end

    subgraph CloudflarePages["Cloudflare Pages: Portal Jurnal (jurnal.example.com)"]
        AstroApp["Astro SSR Application"]
        D1DB["Cloudflare D1 (SQLite Edge)"]
        KVStore["Workers KV (Cache & Metrik)"]
        AdminGUI["Panel Redaksi GUI (/admin)"]
    end

    subgraph RepositoryCDN["Cloudflare Worker: Repositori Dokumen (cdn.example.com)"]
        WorkerRouter["Worker Router & Streamer"]
        AdminAPI["Private Admin API (/api/admin/files)"]
        SARotation["Rotasi 100 Google Service Accounts (RS256 JWT)"]
    end

    subgraph GoogleDrive["Google Cloud Storage"]
        DriveFolder["Google Drive Storage<br/>(Folder Naskah Publikasi)"]
    end

    Visitor -->|"1. Akses Halaman Artikel"| AstroApp
    AstroApp <-->|"2. Query Data Artikel & Pengaturan"| D1DB
    AstroApp <-->|"3. Counter Baca & Unduh Real-Time"| KVStore
    Visitor -->|"4. Buka /one/[file].pdf"| WorkerRouter
    WorkerRouter -->|"5. Alirkan PDF (inline stream HTTP 206)"| Visitor

    Admin -->|"A. Kelola Artikel & Metadata"| AdminGUI
    AdminGUI -->|"B. Simpan Perubahan"| D1DB
    AdminGUI -->|"C. Muat Berkas Drive (Live Sync)"| AdminAPI
    AdminAPI -->|"D. Minta Token via Service Account"| SARotation
    SARotation -->|"E. Query Berkas Drive"| DriveFolder
    DriveFolder -->|"F. Kembalikan Berkas ke Admin"| AdminGUI
```

---

## 2. Diagram Alur Baca & Unduh Dokumen (PDF Reader Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Reader as Pembaca
    participant Portal as Portal Jurnal (jurnal.example.com)
    participant CDN as Repository Worker (cdn.example.com)
    participant Drive as Google Drive Storage

    Reader->>Portal: Klik tombol "UNDUH / BACA PDF"
    Portal->>CDN: GET /one/JTAAP_V1N1_01_artikel.pdf
    alt Akses Direktori / Beranda CDN
        CDN-->>Portal: HTTP 302 Redirect ke https://jurnal.example.com
    else Tautan Menggunakan Parameter Lama (?a=view)
        CDN-->>Portal: HTTP 302 Redirect (Membuang parameter ?a=view)
    else Unduh Langsung (?download=true)
        CDN->>Drive: Ambil Naskah
        Drive-->>CDN: Aliran Data PDF
        CDN-->>Reader: HTTP 200 (Content-Disposition: attachment)
    else Tampilan Standar (Baca PDF)
        CDN->>Drive: Ambil Naskah (Range Request HTTP 206)
        Drive-->>CDN: Aliran Data PDF
        CDN-->>Reader: HTTP 200/206 (Content-Disposition: inline, Type: application/pdf)
        Note over Reader: Browser Otomatis Mengaktifkan Native PDF Viewer
    end
```

---

## 3. Fitur Utama

1. **Classic OJS 2-Column Layout:** Struktur visual 100% presisi mengikuti standar Open Journal Systems (proporsi 68% naskah, 32% sidebar standarisasi, tombol PDF khas, dan nomor halaman rata kanan).
2. **Native Browser PDF Viewer:** Naskah dibuka menggunakan engine PDF bawaan browser (Chrome, Edge, Firefox, Safari) yang dilengkapi *thumbnail page*, seleksi teks, *smooth scroll*, tombol cetak, dan unduh tanpa beban script pihak ketiga yang lambat.
3. **Sequential Multi-Drive Routing:** Alamat naskah mencerminkan urutan drive penyimpanan yang elegan (`/one/`, `/two/`, `/three/`), dengan tetap mendukung kompatibilitas format lama (`/0:/`).
4. **100% GUI Admin Dashboard (/admin):** Pengelolaan lengkap tanpa perlu mengedit file kode secara manual:
   * Tambah & terbitkan naskah baru.
   * Kelola dewan redaksi, reviewer, dan profil jurnal.
   * **Manajemen Berkas Google Drive (Live):** Melihat daftar seluruh file PDF di Google Drive secara langsung, menyalin tautan resmi, dan memilih berkas untuk form penerbitan.
5. **Rotasi 100 Service Accounts (GCP):** Repositori dokumen bebas dari batasan kuota unduhan akun tunggal karena ditenagai oleh 100 service accounts Google Cloud Platform yang berotasi otomatis.
6. **Google Scholar Metadata Ready:** Meta tag sitasi akademik otomatis (`citation_title`, `citation_author`, `citation_pdf_url`, `citation_volume`, `citation_issue`, dll.) terisi otomatis untuk pengindeksan mesin pencari ilmiah.
7. **Privasi Data Penuh:** Halaman direktori CDN tertutup total untuk publik. Pengunjung hanya dapat membaca berkas naskah resmi yang tautannya tersedia di portal.

---

## 4. Struktur Proyek

```text
sektansia-press/
├── repository-worker/          # Script Cloudflare Worker Repositori Dokumen
│   ├── worker.js              # Core Worker: Service Accounts, Router /one/, & Admin API
│   ├── wrangler.toml          # Konfigurasi deployment worker jttap
│   └── README.md              # Dokumentasi teknis repositori worker
├── src/
│   ├── components/            # Komponen UI OJS (Header, Sidebar, ArticleItem, dll.)
│   ├── config/                # Konfigurasi utama jurnal & generator URL
│   ├── data/                  # Data in-memory fallback
│   ├── lib/                   # Integrasi Cloudflare D1 & Workers KV
│   └── pages/                 # Routing halaman Astro (/admin, /article, /current, dll.)
├── schema.sql                 # Skema tabel database D1
├── seed.sql                   # Data awal penerbitan naskah
└── wrangler.toml              # Konfigurasi Cloudflare Pages
```

---

## 5. Cara Menjalankan Secara Lokal

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

## 6. Cara Deploy

### Sekali Deploy Semua (Portal + CDN Worker):
```bash
npm run deploy
```
*Perintah ini otomatis men-deploy CDN Worker terlebih dahulu, melakukan build Astro, lalu men-deploy Portal Jurnal ke Cloudflare Pages.*

---

### Deploy Terpisah (Opsional):

**A. Deploy Portal Jurnal Saja (Cloudflare Pages):**
```bash
npm run deploy:portal
```

**B. Deploy CDN Repositori Saja (Cloudflare Worker):**
```bash
npm run deploy:cdn
```

---

## 7. Panel Administrasi Redaksi

* **URL:** `http://localhost:4321/admin` (atau `https://jurnal.example.com/admin`)
* **Default Username:** `admin` | **Default Password:** `admin123`
* **Branding & Identitas Visual (Tab Profil Jurnal):** Mengatur URL Logo Header, URL Favicon Tab Browser, dan URL Tautan Unduh Template Manuskrip Word (.docx) secara langsung via GUI tanpa perlu build ulang.
* **Manajemen Berkas Drive (Tab Google Drive Index):** Klik tombol **"Muat Berkas Drive"** untuk melihat seluruh berkas yang ada di Google Drive secara langsung dan memilihnya ke formulir penerbitan naskah.

---

## 8. Panduan Setup CDN Repositori Dokumen & Service Accounts

Repositori dokumen naskah didukung oleh Cloudflare Worker yang menghubungkan penyimpanan Google Drive dengan pembaca jurnal menggunakan rotasi Service Account otomatis dan Native Browser PDF Viewer.

### A. Prasyarat yang Dibutuhkan
1. **Google Drive Storage**:
   * Sebuah folder Google Drive biasa atau Google Shared Drive tempat menyimpan file PDF artikel jurnal.
   * Ambil **ID Folder** dari tautan peramban: `https://drive.google.com/drive/folders/[FOLDER_ID]`.
2. **Kredensial Service Account (GCP)**:
   * 1 akun (atau hingga 100 akun untuk rotasi kuota tinggi) file JSON Service Account dari Google Cloud Console dengan API Google Drive aktif.
3. **Akun Cloudflare & Domain Aktif**:
   * Domain publik aktif di Cloudflare (contoh: `example.com`).
   * DNS atau Custom Domain untuk CDN dokumen (contoh: `cdn.example.com`).

---

### B. Langkah 1: Generate Service Account GCP

#### Metode 1: Membuat 1 Akun Service Account (Manual / Standar)
1. Buka [Google Cloud Console](https://console.cloud.google.com/) dan buat project baru.
2. Masuk ke **APIs & Services** > **Library**, cari **Google Drive API** lalu klik **Enable**.
3. Masuk ke **IAM & Admin** > **Service Accounts**, klik **Create Service Account** (beri nama bebas, misal `jurnal-repo`).
4. Klik akun yang dibuat > tab **Keys** > **Add Key** > **Create new key** > pilih format **JSON**.
5. Simpan file `.json` yang terunduh, lalu buka untuk melihat alamat `client_email`.
6. **Beri Akses Folder:** Buka Google Drive > klik kanan folder naskah > **Bagikan (Share)** > undang `client_email` sebagai **Pelihat (Viewer)**.

#### Metode 2: Membuat 100 Akun Service Account (Batch / Kuota Tinggi)
Untuk rotasi kuota otomatis dan pencegahan limit unduhan (750 GB/hari per akun), buat 100 Service Accounts via **Google Cloud Shell**:
1. Buka Cloud Shell di kanan atas console Google Cloud.
2. Jalankan perintah otomatisasi:
   ```bash
   PROJECT_ID=$(gcloud config get-value project)
   gcloud services enable drive.googleapis.com
   mkdir -p sa_keys && cd sa_keys

   for i in $(seq -w 1 100); do
     SA_NAME="sa-$i"
     gcloud iam service-accounts create "$SA_NAME" --display-name="SA $i"
     gcloud iam service-accounts keys create "$SA_NAME.json" \
       --iam-account="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
   done

   jq -s '.' sa-*.json > all_service_accounts.json
   ```
3. Unduh file `all_service_accounts.json` dari menu Cloud Shell.
4. **Trik Berbagi Folder ke 100 Akun via Google Groups:**
   * Buka [Google Groups](https://groups.google.com/), buat grup (misal: `jurnal-repo-team@googlegroups.com`).
   * Masukkan 100 email Service Account ke anggota grup.
   * Di Google Drive, cukup bagikan folder naskah ke **satu email grup** tersebut sebagai **Pelihat (Viewer)**.

---

### C. Langkah 2: Pasang Kredensial ke Worker
1. Salin file array JSON Service Account ke:
   ```text
   repository-worker/serviceaccounts.json
   ```
   *(File ini sudah otomatis diabaikan oleh `.gitignore` sehingga tidak akan bocor ke GitHub).*
2. Buka [`repository-worker/worker.js`](file:///d:/Gits/Private/sektansia-press/repository-worker/worker.js) dan sesuaikan:
   * `id`: Ganti `YOUR_GOOGLE_DRIVE_FOLDER_ID` dengan ID Folder Drive Anda.
   * `admin_token`: Ganti `your-secret-admin-token` dengan token rahasia pilihan Anda.
   * `PORTAL_URL`: Ganti dengan URL domain portal jurnal Anda (misal `https://jurnal.example.com`).

---

### D. Langkah 3: Deploy & Pasang Custom Domain
1. Deploy worker CDN dari komputer lokal:
   ```bash
   npm run deploy:cdn
   ```
2. Di dashboard Cloudflare:
   * Masuk ke **Workers & Pages** > pilih worker `jurnal-repository-worker`.
   * Buka **Settings** > **Domains & Routes** > klik **Add Custom Domain**.
   * Masukkan domain CDN (misal: `cdn.example.com`).
3. Di panel redaksi `/admin` portal jurnal (Tab Google Drive Index):
   * Masukkan URL CDN: `https://cdn.example.com/one`.
   * Klik tombol **Muat Berkas Drive** untuk memeriksa berkas secara langsung.

---

### E. Konfigurasi Lanjutan CDN (Direct Link, Pengalihan, Unduh & Hotlink)

1. **Pengalihan Otomatis ke Web Utama (Direct Link Redirection):**
   * Setiap akses langsung ke root CDN (`/`, `/one`, `/two/`, atau path yang berakhiran slash `/`) otomatis dialihkan (HTTP 302 Redirect) ke portal web utama (`PORTAL_URL`).
   * Halaman 404 menampilkan tautan langsung kembali ke web portal utama.
   * Konfigurasikan URL portal utama di `repository-worker/wrangler.toml`:
     ```toml
     [vars]
     MAIN_PORTAL_URL = "https://jurnal.example.com"
     ```
2. **Mode Penampil PDF vs Paksa Unduh Berkas:**
   * **Inline Stream (Standar):** `https://cdn.example.com/one/artikel.pdf` (Browser otomatis membuka Native PDF Viewer bawaan).
   * **Paksa Unduh (Download):** Tambahkan `?download=true` (contoh: `https://cdn.example.com/one/template-jurnal.docx?download=true`) agar browser langsung memunculkan dialog unduh.
   * Tautan lawas dengan parameter `?a=view` otomatis dibersihkan dengan HTTP 302 Redirect.
3. **Proteksi Akses & Anti-Hotlink (CORS):**
   * Di `repository-worker/worker.js`, ganti `cors_domain: "*"` menjadi domain web jurnal Anda (contoh: `cors_domain: "https://jurnal.example.com"`) untuk membatasi pemanggilan berkas hanya dari website resmi Anda.
4. **Hosting Template Manuskrip, Logo & Favicon Langsung di Google Drive CDN:**
   * Anda dapat meletakkan file template Word (`template-jurnal.docx`), file logo (`logo.png`), dan favicon (`favicon.png`) di folder Google Drive yang sama dengan PDF naskah.
   * Pasang tautan CDN-nya di Panel Admin (`/admin` > Profil Jurnal) untuk mengubah logo, favicon, atau template naskah secara instan tanpa menyentuh kode.

---

## 9. Setup Database Cloudflare D1 & Workers KV

Platform ini menggunakan SQLite relasional di edge (**Cloudflare D1**) untuk persistensi data artikel dan pengaturan redaksi, serta **Cloudflare Workers KV** untuk penghitung metrik (*views* & *downloads*) real-time dan cache performa tinggi.

> **Catatan:** Platform ini memiliki *fallback in-memory* otomatis. Saat dijalankan secara lokal (`npm run dev`), aplikasi tetap dapat berjalan langsung tanpa setup database terlebih dahulu.

### A. Langkah 1: Buat Database D1
Jalankan perintah berikut di terminal:
```bash
npx wrangler d1 create jurnal-db
```
Wrangler akan mengembalikan informasi database Anda. Salin `database_id` yang didapat ke file `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "jurnal-db"
database_id = "MASUKKAN_DATABASE_ID_ANDA"
```

---

### B. Langkah 2: Eksekusi Skema Tabel (schema.sql & seed.sql)
Jalankan migrasi skema tabel dan data awal naskah ke database D1 produksi Anda:
```bash
# 1. Eksekusi struktur tabel relasional (artikel, redaksi, pengaturan)
npx wrangler d1 execute jurnal-db --remote --file=./schema.sql

# 2. Eksekusi data awal contoh naskah publikasi
npx wrangler d1 execute jurnal-db --remote --file=./seed.sql
```
*(Untuk pengujian database lokal, Anda dapat mengganti flag `--remote` menjadi `--local`).*

---

### C. Langkah 3: Buat Workers KV Namespace
Jalankan perintah berikut untuk membuat penyimpanan cache dan counter metrik:
```bash
npx wrangler kv:namespace create CACHE
```
Salin nilai `id` yang didapat ke file `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "KV"
id = "MASUKKAN_KV_NAMESPACE_ID_ANDA"
```

---

### D. Langkah 4: Sambungkan Bindings di Cloudflare Pages Dashboard
Agar website di Cloudflare Pages dapat terhubung ke D1 dan KV di lingkungan produksi:
1. Masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages**.
2. Pilih proyek Pages Anda.
3. Buka menu **Settings** > **Functions**.
4. Di bagian **D1 Database Bindings**, klik **Add binding**:
   * **Variable name:** `DB`
   * **D1 database:** Pilih `jurnal-db`
5. Di bagian **KV Namespace Bindings**, klik **Add binding**:
   * **Variable name:** `KV`
   * **KV namespace:** Pilih `CACHE`
6. Simpan pengaturan dan lakukan deploy ulang (`npm run deploy:portal`). Seluruh naskah, konfigurasi jurnal, dan counter metrik kini 100% aktif dan persisten di edge Cloudflare.
