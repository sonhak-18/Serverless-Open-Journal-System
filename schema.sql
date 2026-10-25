-- Schema Database Cloudflare D1 / SQLite untuk Serverless Open Journal System

-- 1. Tabel Pengaturan Jurnal & Narahubung
CREATE TABLE IF NOT EXISTS journal_settings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  short_name TEXT NOT NULL,
  accredited_text TEXT NOT NULL,
  publisher TEXT NOT NULL,
  institution TEXT NOT NULL,
  address TEXT NOT NULL,
  e_issn TEXT NOT NULL,
  p_issn TEXT NOT NULL,
  doi_prefix TEXT NOT NULL,
  publication_frequency TEXT NOT NULL,
  license TEXT NOT NULL,
  license_url TEXT NOT NULL,
  show_indexing_block INTEGER DEFAULT 1,
  show_tools_block INTEGER DEFAULT 1,
  show_issn_block INTEGER DEFAULT 1,
  show_editorial_team INTEGER DEFAULT 1,
  has_active_issue INTEGER DEFAULT 0,
  email TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  whatsapp_display TEXT NOT NULL,
  whatsapp_message TEXT NOT NULL,
  turnitin_max_similarity INTEGER DEFAULT 20,
  review_time_estimate TEXT NOT NULL,
  gdrive_base_url TEXT NOT NULL,
  pdf_directory_path TEXT NOT NULL,
  logo_url TEXT DEFAULT '/images/logo.png',
  favicon_url TEXT DEFAULT '/favicon.png',
  template_url TEXT DEFAULT '/template-manuskrip.docx',
  announcement_title TEXT DEFAULT 'Call for Papers: Volume 1 Nomor 1 (2026)',
  announcement_content TEXT DEFAULT 'Dewan Redaksi mengundang akademisi, peneliti, dan praktisi untuk mengirimkan naskah orisinal.',
  announcement_active INTEGER DEFAULT 1,
  announcement_date TEXT DEFAULT '2026-03-01',
  current_volume INTEGER DEFAULT 1,
  current_issue INTEGER DEFAULT 1,
  current_year INTEGER DEFAULT 2026,
  current_period TEXT DEFAULT 'Maret 2026',
  current_theme TEXT DEFAULT 'Edisi Perdana: Inovasi Sains Terbuka dan Transformasi Riset Berkelanjutan',
  current_cover_url TEXT DEFAULT ''
);

-- 2. Tabel Dewan Redaksi & Reviewer
CREATE TABLE IF NOT EXISTS editorial_members (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'eic' | 'editor' | 'reviewer'
  name TEXT NOT NULL,
  role TEXT,
  affiliation TEXT NOT NULL,
  email TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 3. Tabel Artikel Ilmiah
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  authors_json TEXT NOT NULL, -- Array of {name, affiliation, email}
  abstract TEXT NOT NULL,
  keywords_json TEXT NOT NULL, -- Array of strings
  volume INTEGER NOT NULL,
  issue INTEGER NOT NULL,
  year INTEGER NOT NULL,
  pages TEXT NOT NULL,
  first_page INTEGER NOT NULL,
  last_page INTEGER NOT NULL,
  publish_date TEXT NOT NULL,
  received_date TEXT NOT NULL,
  accepted_date TEXT NOT NULL,
  doi TEXT NOT NULL,
  pdf_file_name TEXT NOT NULL,
  file_size_bytes INTEGER DEFAULT 450000,
  subject TEXT NOT NULL,
  abstract_views INTEGER DEFAULT 0,
  pdf_downloads INTEGER DEFAULT 0,
  references_json TEXT DEFAULT '[]'
);

-- 4. Tabel Pangkalan Data Pengindeks
CREATE TABLE IF NOT EXISTS indexing_platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT NOT NULL,
  show_in_sidebar INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  icon_url TEXT
);

-- 5. Tabel Edisi & Terbitan (Volume / Issue Archives)
CREATE TABLE IF NOT EXISTS journal_issues (
  id TEXT PRIMARY KEY,
  volume INTEGER NOT NULL,
  issue INTEGER NOT NULL,
  year INTEGER NOT NULL,
  period TEXT NOT NULL,
  theme TEXT,
  cover_url TEXT DEFAULT '',
  is_current INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

-- 6. Tabel Pengaturan Portal Institusi (Multi-Jurnal)
CREATE TABLE IF NOT EXISTS portal_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  org_name TEXT NOT NULL,
  org_name_en TEXT NOT NULL,
  slogan_id TEXT NOT NULL,
  slogan_en TEXT NOT NULL,
  description TEXT NOT NULL,
  domain_display TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  address TEXT NOT NULL,
  logo_url TEXT DEFAULT '/images/logo.png',
  favicon_url TEXT DEFAULT '/favicon.png',
  call_for_papers_active INTEGER DEFAULT 1,
  flagship_journal_name TEXT NOT NULL,
  flagship_journal_en TEXT NOT NULL,
  flagship_journal_url TEXT NOT NULL,
  flagship_journal_emblem_url TEXT DEFAULT '/favicon.png',
  missions_json TEXT
);

-- 7. Tabel Pendaftaran Naskah Masuk (Online Submissions)
CREATE TABLE IF NOT EXISTS journal_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reg_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  affiliation TEXT NOT NULL,
  city TEXT,
  country TEXT DEFAULT 'Indonesia',
  scope_cluster TEXT NOT NULL,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  supplementary_file_name TEXT,
  status TEXT DEFAULT 'submitted',
  created_at TEXT NOT NULL
);
