-- ========================================================
-- Seed Data untuk Cloudflare D1 Sektansia Press (JTAAP)
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
  'Jurnal Terbuka Audit, Akuntansi, dan Pajak',
  'Journal of Open Audit, Accounting, and Taxation',
  'JTAAP',
  'Open Access Scientific Peer-Reviewed Journal',
  'BN Organization',
  'Bawera Nitijana Research',
  'Jl. R.E. Martadinata No. 42, Bandung 40115, Jawa Barat, Indonesia',
  '3048-289X',
  '3048-2903',
  '10.00000',
  'Terbit 4 Kali Setahun (Maret, Juni, September, Desember)',
  'Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)',
  'https://creativecommons.org/licenses/by-sa/4.0/',
  1, 1, 1,
  'redaksi@sektansia.org',
  '6281234567890',
  '+62 812-3456-7890',
  'Halo Redaksi JTAAP, saya ingin mengajukan manuskrip artikel ilmiah untuk proses review dan penerbitan.',
  20,
  '3 sampai 7 Hari Kerja',
  'https://cdn.example.com/one',
  '',
  '/images/jtaap-logo-v2.png',
  '/favicon.png',
  '/template-jtaap.docx'
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

-- 3. Inisialisasi Dewan Redaksi & Reviewer
INSERT OR REPLACE INTO editorial_members (id, type, name, role, affiliation, email, sort_order) VALUES
('eic-1', 'eic', 'Dr. H. Hendra Setiawan, S.E., M.Ak., Ak., CA.', 'Editor-in-Chief', 'Departemen Akuntansi, Universitas Padjadjaran', 'hendra.setiawan@sektansia.org', 1),
('ed-1', 'editor', 'Prof. Dr. Irfan Maulana, M.Si., Ak., CPA.', 'Managing Editor', 'Fakultas Ekonomi dan Bisnis, Universitas Indonesia', 'irfan.maulana@sektansia.org', 2),
('ed-2', 'editor', 'Dra. Nurul Hidayati, M.Sc., Ph.D.', 'Associate Editor - Taxation', 'Pusat Kajian Kebijakan Pajak & Tata Kelola Keuangan Negara', NULL, 3),
('ed-3', 'editor', 'Budi Santoso, S.E., M.Ak., BKP.', 'Section Editor - Audit & Assurance', 'Institut Akuntan Publik Indonesia (IAPI)', NULL, 4),
('rev-1', 'reviewer', 'Dr. Agus Priyono, S.E., M.Si., Ak.', NULL, 'Universitas Gadjah Mada', NULL, 5),
('rev-2', 'reviewer', 'Dr. Siti Rahmawati, S.E., M.Ak.', NULL, 'Universitas Diponegoro', NULL, 6),
('rev-3', 'reviewer', 'Wahyu Pratama, S.E., M.Sc., Ph.D.', NULL, 'Universitas Airlangga', NULL, 7);

-- 4. Inisialisasi Artikel Terbit (Kosong untuk Fresh Install dari Nol)
-- Naskah artikel dapat ditambahkan langsung melalui Panel Admin (/admin).

