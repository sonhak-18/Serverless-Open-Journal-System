-- ========================================================
-- Seed Data untuk Cloudflare D1 Sektansia Press (JTAAP)
-- ========================================================

-- 1. Inisialisasi Pengaturan Jurnal
INSERT OR REPLACE INTO journal_settings (
  id, name, name_en, short_name, accredited_text, publisher, institution,
  address, e_issn, p_issn, doi_prefix, publication_frequency, license,
  license_url, show_indexing_block, show_tools_block, show_issn_block,
  email, whatsapp_number, whatsapp_display, whatsapp_message,
  turnitin_max_similarity, review_time_estimate, gdrive_base_url, pdf_directory_path
) VALUES (
  'default',
  'Jurnal Terbuka Audit, Akuntansi, dan Pajak',
  'Journal of Open Audit, Accounting, and Taxation',
  'JTAAP',
  'Open Access Scientific Peer-Reviewed Journal',
  'Sektansia Press',
  'Komunitas Riset Sektansia (Sektansia Research Community)',
  'Jl. R.E. Martadinata No. 42, Bandung 40115, Jawa Barat, Indonesia',
  '3048-289X',
  '3048-2903',
  '10.5281/zenodo.jtaap',
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
  'https://cdn-papers.sektansia.workers.dev',
  '/JTAAP/PDFs'
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

-- 4. Inisialisasi Artikel Terbit
INSERT OR REPLACE INTO articles (
  id, slug, title, authors_json, abstract, keywords_json,
  volume, issue, year, pages, first_page, last_page,
  publish_date, received_date, accepted_date, doi,
  pdf_file_name, file_size_bytes, subject, abstract_views, pdf_downloads
) VALUES
(
  'art-1',
  'analisis-efektivitas-audit-berbasis-risiko-sektor-publik',
  'Analisis Efektivitas Audit Berbasis Risiko dalam Mendeteksi Potensi Fraud Pengadaan Barang dan Jasa Pemerintah Daerah',
  '[{"name":"Ahmad Faisal Pratama","affiliation":"Program Pascasarjana Akuntansi Sektor Publik, Universitas Gadjah Mada"},{"name":"Dr. Rina Kusuma Dewi","affiliation":"Departemen Akuntansi, Universitas Gadjah Mada"}]',
  'Penelitian ini bertujuan untuk menguji efektivitas implementasi Risk-Based Internal Audit (RBIA) dalam memitigasi dan mendeteksi anomali pada proses pengadaan barang dan jasa pada lima pemerintah daerah di Pulau Jawa. Menggunakan pendekatan kualitatif-verifikatif dengan teknik audit forensik data analitik, penelitian menemukan bahwa penilaian risiko yang dinamis pada tahap perencanaan pengadaan berhasil meningkatkan rasio deteksi potensi korupsi pengadaan hingga 34%. Hasil penelitian menyarankan standarisasi sistem continuous auditing dan peningkatan kapabilitas auditor internal aparat pengawasan intern pemerintah (APIP).',
  '["Audit Berbasis Risiko","Fraud","Pengadaan Barang dan Jasa","APIP","Akuntansi Sektor Publik"]',
  1, 1, 2026, '1-14', 1, 14,
  '2026-03-30', '2026-02-14', '2026-03-20',
  '10.5281/zenodo.jtaap.2026.1101',
  'jtaap-v1n1-01-faisal-audit-risiko.pdf',
  452000, 'Audit', 380, 145
),
(
  'art-2',
  'dampak-implementasi-coretax-administration-system-kepatuhan-wajib-pajak-badan',
  'Dampak Kesiapan Implementasi Core Tax Administration System (CTAS) terhadap Kepatuhan Sukarela Wajib Pajak Badan',
  '[{"name":"Dian Anggraini","affiliation":"Fakultas Ekonomi dan Bisnis, Universitas Indonesia"},{"name":"Prof. Irwan Syahputra","affiliation":"Pusat Studi Perpajakan Nasional, Universitas Indonesia"}]',
  'Pembaruan Sistem Inti Administrasi Perpajakan (PSIAP) atau Core Tax Administration System menjadi tonggak digitalisasi perpajakan di Indonesia. Studi empiris ini menganalisis tingkat kesiapan korporasi dan pengaruh interoperabilitas platform terhadap voluntary compliance wajib pajak badan. Melalui survei struktural terhadap 184 manajer pajak perusahaan manufaktur dan jasa di wilayah Jakarta, temuan menunjukkan bahwa perceived ease of use dan transparansi rekonsiliasi faktur pajak digital berkorelasi positif signifikan terhadap niat kepatuhan sukarela. Implikasi penelitian mendorong peningkatan edukasi teknis integrasi API sistem akuntansi internal perusahaan dengan server Direktorat Jenderal Pajak.',
  '["Core Tax System","Kepatuhan Sukarela","Wajib Pajak Badan","Digitalisasi Pajak","Akuntansi Perpajakan"]',
  1, 1, 2026, '15-28', 15, 28,
  '2026-03-30', '2026-02-18', '2026-03-22',
  '10.5281/zenodo.jtaap.2026.1102',
  'jtaap-v1n1-02-dian-coretax-kepatuhan.pdf',
  518000, 'Pajak', 420, 168
),
(
  'art-3',
  'pengaruh-pengungkapan-esg-terhadap-kualitas-laba-dan-biaya-modal',
  'Pengaruh Pengungkapan Environmental, Social, and Governance (ESG) terhadap Kualitas Laba Akuntansi dan Biaya Modal Ekuitas',
  '[{"name":"Rian Aditya Nugroho","affiliation":"Jurusan Akuntansi, Universitas Diponegoro"},{"name":"Dr. Maya Indraswari","affiliation":"Jurusan Akuntansi, Universitas Diponegoro"}]',
  'Transparansi laporan keberlanjutan kian menjadi fokus utama pemangku kepentingan pasar modal. Riset ini mengeksplorasi hubungan antara skor pengungkapan ESG (Environmental, Social, Governance) terhadap kualitas laba yang diukur melalui discretionary accruals, serta dampaknya terhadap cost of equity capital pada perusahaan indeks LQ45 periode 2022-2025. Hasil regresi data panel fixed effects mengindikasikan bahwa keterbukaan informasi pilar tata kelola (governance) dan lingkungan (environmental) mampu menurunkan praktik perataan laba oportunistik, yang berimplikasi pada penurunan premi risiko yang diminta oleh investor.',
  '["ESG Disclosure","Kualitas Laba","Biaya Modal Ekuitas","Sustainability Reporting","Tata Kelola Perusahaan"]',
  1, 1, 2026, '29-44', 29, 44,
  '2026-03-30', '2026-02-25', '2026-03-26',
  '10.5281/zenodo.jtaap.2026.1103',
  'jtaap-v1n1-03-rian-kualitas-laba-esg.pdf',
  488000, 'Akuntansi', 315, 112
);
