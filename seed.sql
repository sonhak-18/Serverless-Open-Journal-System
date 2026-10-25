-- Seed Data Awal untuk Cloudflare D1 Serverless Open Journal System

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
  'Jurnal Sains dan Teknologi Terbuka',
  'Open Journal of Science and Technology',
  'JOST',
  'Open Access Scientific Peer-Reviewed Journal',
  'Lembaga Publikasi Ilmiah & Riset',
  'Fakultas / Program Studi / Asosiasi Akademik',
  'Indonesia',
  '0000-0000 (Dalam Proses)',
  '0000-0000 (Dalam Proses)',
  '10.00000',
  'Terbit 4 Kali Setahun (Maret, Juni, September, Desember)',
  'Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)',
  'https://creativecommons.org/licenses/by-sa/4.0/',
  1, 1, 0,
  'redaksi@jurnal-anda.ac.id',
  '6281234567890',
  '+62 812-3456-7890',
  'Halo Dewan Redaksi, saya ingin mengajukan manuskrip artikel ilmiah untuk proses review dan penerbitan.',
  20,
  '3 sampai 7 Hari Kerja',
  'https://cdn.example.com/one',
  '',
  '/images/logo.png',
  '/favicon.png',
  '/template-manuskrip.docx'
);

-- 2. Inisialisasi Pengaturan Portal Institusi
INSERT OR REPLACE INTO portal_settings (
  id, org_name, org_name_en, slogan_id, slogan_en, description, domain_display,
  email, whatsapp, address, logo_url, favicon_url, call_for_papers_active,
  flagship_journal_name, flagship_journal_en, flagship_journal_url, flagship_journal_emblem_url, missions_json
) VALUES (
  'default',
  'Portal Publikasi Ilmiah Terbuka',
  'Open Science Publication Portal',
  'Mendorong Keterbukaan Pengetahuan dan Integritas Riset Ilmiah',
  'Fostering Open Access, Research Integrity, and Academic Collaboration',
  'Portal publikasi berkala ilmiah akses terbuka (Open Access) independen yang menjunjung tinggi keterbukaan ilmu, integritas akademik, dan tata kelola penelaahan sejawat berstandar internasional.',
  'jurnal.institusi-anda.ac.id',
  'redaksi@jurnal-anda.ac.id',
  '+62 812-3456-7890',
  'Kampus / Lembaga Riset dan Publikasi Ilmiah, Indonesia',
  '/images/logo.png',
  '/favicon.png',
  1,
  'Jurnal Sains dan Teknologi Terbuka',
  'Open Journal of Science and Technology',
  '/index/journal',
  '/favicon.png',
  '["Menyelenggarakan publikasi berkala ilmiah bermutu tinggi berbasis penelaahan sejawat yang taat asas terhadap etika publikasi COPE.","Mendorong akses terbuka universal agar karya penelitian dapat dimanfaatkan secara luas tanpa batasan biaya.","Memfasilitasi diseminasi hasil riset unggulan di bidang sains, teknologi, dan terapan lintas disiplin."]'
);

-- 3. Inisialisasi Pangkalan Data Pengindeks
INSERT OR REPLACE INTO indexing_platforms (id, name, category, url, status, description, show_in_sidebar, sort_order) VALUES
('idx-1', 'Google Scholar', 'International', 'https://scholar.google.com', 'Indexed', 'Pengindeks internasional karya ilmiah dan pelacakan metrik sitasi akademik global.', 1, 1),
('idx-2', 'Garuda (Garba Rujukan Digital)', 'National', 'https://garuda.kemdikbud.go.id', 'In Process', 'Portal rujukan publikasi ilmiah nasional Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi RI.', 1, 2),
('idx-3', 'Crossref (DOI)', 'International', 'https://search.crossref.org', 'Indexed', 'Registrasi Digital Object Identifier (DOI) resmi untuk seluruh naskah terbitan.', 1, 3),
('idx-4', 'Dimensions', 'International', 'https://www.dimensions.ai', 'Indexed', 'Basis data sitasi dan metrik penelitian global terintegrasi.', 1, 4),
('idx-5', 'SINTA (Science and Technology Index)', 'National', 'https://sinta.kemdikbud.go.id', 'Evaluation', 'Indeks sitasi dan evaluasi kinerja jurnal ilmiah nasional Kemdikbudristek.', 0, 5),
('idx-6', 'BASE (Bielefeld Academic Search Engine)', 'International', 'https://www.base-search.net', 'Indexed', 'Salah satu mesin pencari akademis internasional terbesar di dunia yang dikelola Universitas Bielefeld.', 0, 6),
('idx-7', 'Scilit', 'International', 'https://www.scilit.net', 'Indexed', 'Pangkalan data ilmiah komprehensif berbasis pencarian otomatis dari Crossref dan PubMed.', 0, 7);
