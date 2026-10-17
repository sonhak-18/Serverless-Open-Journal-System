-- ========================================================
-- Seed Data untuk Cloudflare D1 JTEBA
-- ========================================================

-- 1. Inisialisasi Pengaturan Jurnal
INSERT OR REPLACE INTO journal_settings (
  id, name, name_en, short_name, accredited_text, publisher, institution,
  address, e_issn, p_issn, doi_prefix, publication_frequency, license,
  license_url, show_indexing_block, show_tools_block, show_issn_block,
  email, whatsapp_number, whatsapp_display, whatsapp_message,
  turnitin_max_similarity, review_time_estimate, gdrive_base_url, pdf_directory_path,
  logo_url, favicon_url, template_url
) VALUES (
  'default',
  'Jurnal Terbuka Ekonomi, Bisnis, dan Akuntabilitas',
  'Open Journal of Economics, Business, and Accountability',
  'JTEBA',
  'Open Access Scientific Peer-Reviewed Journal',
  'Organisasi Riset dan Publikasi Ilmiah Praniti',
  'Organisasi Riset dan Publikasi Ilmiah Praniti',
  'Indonesia',
  'Dalam Proses Pengajuan',
  'Dalam Proses Pengajuan',
  '10.00000',
  'Terbit 4 Kali Setahun (Maret, Juni, September, Desember)',
  'Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)',
  'https://creativecommons.org/licenses/by-sa/4.0/',
  1, 1, 0,
  'redaksi@praniti.or.id',
  '628981822777',
  '+62 898-182-2777',
  'Halo Redaksi JTEBA, saya ingin mengajukan manuskrip artikel ilmiah untuk proses review dan penerbitan.',
  20,
  '3 sampai 7 Hari Kerja',
  'https://cdn.example.com/one',
  '',
  '/images/logo.png',
  '/favicon.png',
  '/template-jteba.docx'
);

-- 2. Inisialisasi Pangkalan Data Pengindeks
INSERT OR REPLACE INTO indexing_platforms (id, name, category, url, status, description, show_in_sidebar, sort_order) VALUES
('idx-1', 'Google Scholar', 'International', 'https://scholar.google.com', 'Indexed', 'Pengindeks internasional karya ilmiah dan sitasi akademik terbesar.', 1, 1),
('idx-2', 'Garuda (Garba Rujukan Digital)', 'National', 'https://garuda.kemdikbud.go.id', 'In Process', 'Portal rujukan publikasi ilmiah nasional Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi RI.', 1, 2),
('idx-3', 'Crossref (DOI)', 'International', 'https://search.crossref.org', 'Indexed', 'Registrasi Digital Object Identifier (DOI) resmi untuk seluruh naskah terbitan.', 1, 3),
('idx-4', 'Dimensions', 'International', 'https://www.dimensions.ai', 'Indexed', 'Basis data sitasi dan metrik penelitian global terintegrasi.', 1, 4),
('idx-5', 'SINTA (Science and Technology Index)', 'National', 'https://sinta.kemdikbud.go.id', 'Evaluation', 'Indeks sitasi dan evaluasi kinerja jurnal ilmiah nasional Kemdikbudristek.', 0, 5),
('idx-6', 'BASE (Bielefeld Academic Search Engine)', 'International', 'https://www.base-search.net', 'Indexed', 'Salah satu mesin pencari akademis internasional terbesar di dunia yang dikelola Universitas Bielefeld.', 0, 6),
('idx-7', 'Scilit', 'International', 'https://www.scilit.net', 'Indexed', 'Pangkalan data ilmiah komprehensif berbasis pencarian otomatis dari Crossref dan PubMed.', 0, 7);

-- 3. Inisialisasi Dewan Redaksi & Reviewer (Kosong untuk Fresh Install dari Nol)
-- Data Dewan Redaksi dan Mitra Bestari dapat ditambahkan langsung melalui Panel Admin (/admin).

-- 4. Inisialisasi Artikel Terbit (Kosong untuk Fresh Install dari Nol)
-- Naskah artikel dapat ditambahkan langsung melalui Panel Admin (/admin).
