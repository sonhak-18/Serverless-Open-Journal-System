export interface Author {
  name: string;
  affiliation: string;
  email?: string;
  orcid?: string;
}

export interface Article {
  slug: string;
  title: string;
  authors: Author[];
  abstract: string;
  keywords: string[];
  volume: number;
  issue: number;
  year: number;
  pages: string;
  firstPage: number;
  lastPage: number;
  publishDate: string; // Format ISO: YYYY-MM-DD
  receivedDate: string;
  acceptedDate: string;
  doi: string;
  pdfFileName: string;
  fileSizeBytes: number;
  subject: 'Audit' | 'Akuntansi' | 'Pajak';
  references?: string[];
}

export interface Issue {
  volume: number;
  issue: number;
  year: number;
  monthRange: string;
  title: string;
  description: string;
  publishDate: string;
  isCurrent: boolean;
}

export const issues: Issue[] = [
  {
    volume: 1,
    issue: 1,
    year: 2026,
    monthRange: 'Januari - Maret 2026',
    title: 'Volume 1 Nomor 1 (2026): Edisi Perdana Riset Terapan Audit dan Perpajakan',
    description: 'Terbitan reguler yang memuat artikel orisinal mengenai efektivitas audit berbasis risiko, kepatuhan wajib pajak badan, dan tata kelola pelaporan keuangan digital.',
    publishDate: '2026-03-30',
    isCurrent: true,
  },
];

export const articles: Article[] = [
  {
    slug: 'analisis-efektivitas-audit-berbasis-risiko-sektor-publik',
    title: 'Analisis Efektivitas Audit Berbasis Risiko dalam Mendeteksi Potensi Fraud Pengadaan Barang dan Jasa Pemerintah Daerah',
    authors: [
      {
        name: 'Ahmad Faisal Pratama',
        affiliation: 'Program Pascasarjana Akuntansi Sektor Publik, Universitas Gadjah Mada',
        email: 'faisal.pratama@mail.ugm.ac.id',
      },
      {
        name: 'Prof. Dr. Irwan Hidayat, M.Si., Ak.',
        affiliation: 'Pusat Studi Akuntansi Forensik dan Tata Kelola Keuangan Negara',
        email: 'irwan.hidayat@ugm.ac.id',
      },
    ],
    abstract: 'Penelitian ini mengevaluasi penerapan pendekatan audit berbasis risiko (Risk-Based Audit/RBA) oleh Aparat Pengawasan Intern Pemerintah (APIP) dalam mengidentifikasi titik rawan kecurangan pada proses pengadaan barang dan jasa pemerintah daerah. Menggunakan metode kualitatif deskriptif dengan pendekatan studi kasus pada dua entitas inspektorat daerah, pengumpulan data dilakukan melalui wawancara mendalam, telaah kertas kerja audit, dan analisis matriks profil risiko. Temuan riset menunjukkan bahwa integrasi penilaian risiko inheren pada tahap perencanaan mampu meningkatkan akurasi deteksi anomali harga perkiraan sendiri (HPS) dan rekayasa spesifikasi teknis sebesar 34%. Kendati demikian, keterbatasan kompetensi auditor dalam teknik audit berbantuan komputer (TABK) masih menjadi kendala utama dalam penelusuran transaksi digital perbankan penyedia.',
    keywords: ['Audit Berbasis Risiko', 'Fraud Pengadaan', 'APIP', 'Kertas Kerja Audit', 'Tata Kelola Keuangan Daerah'],
    volume: 1,
    issue: 1,
    year: 2026,
    pages: '1-14',
    firstPage: 1,
    lastPage: 14,
    publishDate: '2026-03-30',
    receivedDate: '2026-02-15',
    acceptedDate: '2026-03-22',
    doi: 'https://doi.org/10.00000/jtaap.v1i1.1',
    pdfFileName: 'jtaap-v1n1-01-faisal-audit-risiko.pdf',
    fileSizeBytes: 428000,
    subject: 'Audit',
  },
  {
    slug: 'pengaruh-digitalisasi-administrasi-perpajakan-terhadap-kepatuhan',
    title: 'Pengaruh Implementasi Sistem Inti Administrasi Perpajakan (Coretax) terhadap Kepatuhan Sukarela Wajib Pajak Badan di Wilayah Jawa Barat',
    authors: [
      {
        name: 'Dian Kusuma Wardani',
        affiliation: 'Fakultas Ekonomi dan Bisnis, Universitas Padjadjaran',
        email: 'dian.kusuma@unpad.ac.id',
      },
      {
        name: 'Haryono Tri Wibowo, S.E., M.Ak.',
        affiliation: 'Konsultan Pajak Terdaftar dan Peneliti Kebijakan Fiskal Terapan',
      },
    ],
    abstract: 'Modernisasi sistem administrasi perpajakan melalui peluncuran Core Tax Administration System (Coretax) dirancang untuk menyederhanakan kewajiban pelaporan dan memperluas integrasi basis data wajib pajak. Studi empiris ini menguji dampak persepsi kemudahan penggunaan, keandalan sistem interkoneksi, dan keadilan prosedural terhadap kepatuhan sukarela 185 Wajib Pajak Badan di area KPP Madya. Analisis data menggunakan Structural Equation Modeling berbasis Partial Least Squares (PLS-SEM). Hasil estimasi membuktikan bahwa kemudahan pelaporan SPT terintegrasi berkorelasi positif signifikan terhadap kepatuhan pelaporan tepat waktu (p < 0,01), sementara transparansi riwayat pemeriksaan menurunkan resistensi pelaporan rekonsiliasi fiskal tahunan.',
    keywords: ['Coretax', 'Kepatuhan Wajib Pajak Badan', 'Administrasi Perpajakan', 'Rekonsiliasi Fiskal', 'PLS-SEM'],
    volume: 1,
    issue: 1,
    year: 2026,
    pages: '15-28',
    firstPage: 15,
    lastPage: 28,
    publishDate: '2026-03-30',
    receivedDate: '2026-02-18',
    acceptedDate: '2026-03-25',
    doi: 'https://doi.org/10.00000/jtaap.v1i1.2',
    pdfFileName: 'jtaap-v1n1-02-dian-coretax-kepatuhan.pdf',
    fileSizeBytes: 512000,
    subject: 'Pajak',
  },
  {
    slug: 'kualitas-laba-dan-pengungkapan-esg-pada-perusahaan-manufaktur',
    title: 'Determinan Kualitas Laba: Peran Mediasi Pengungkapan Environmental, Social, and Governance (ESG) dan Moderasi Komite Audit',
    authors: [
      {
        name: 'Rian Maulana Akbar',
        affiliation: 'Departemen Akuntansi, Universitas Airlangga',
        email: 'rian.maulana@feb.unair.ac.id',
      },
      {
        name: 'Dr. Nurul Fadilah, S.E., M.Si.',
        affiliation: 'Laboratorium Pelaporan Keuangan dan Keberlanjutan Korporasi, Universitas Airlangga',
      },
    ],
    abstract: 'Penelitian ini bertujuan untuk menganalisis keterkaitan antara praktik pengungkapan ESG terhadap persistensi laba dan manipulasi akrual diskresioner pada 72 emiten subsektor manufaktur yang terdaftar di Bursa Efek Indonesia periode 2022 hingga 2025. Dengan menggunakan model modifikasi Jones untuk mengukur discretionary accruals, riset menemukan bahwa perusahaan dengan skor pengungkapan keberlanjutan yang komprehensif memperlihatkan tingkat manajemen laba akrual yang lebih rendah secara substansial. Selain itu, frekuensi rapat komite audit terbukti memperkuat efek mitigasi terhadap praktik perataan laba oportunistik, membuktikan urgensi pengawasan ganda tata kelola.',
    keywords: ['Kualitas Laba', 'Discretionary Accruals', 'Pengungkapan ESG', 'Komite Audit', 'Laporan Keberlanjutan'],
    volume: 1,
    issue: 1,
    year: 2026,
    pages: '29-44',
    firstPage: 29,
    lastPage: 44,
    publishDate: '2026-03-30',
    receivedDate: '2026-02-22',
    acceptedDate: '2026-03-27',
    doi: 'https://doi.org/10.00000/jtaap.v1i1.3',
    pdfFileName: 'jtaap-v1n1-03-rian-kualitas-laba-esg.pdf',
    fileSizeBytes: 604000,
    subject: 'Akuntansi',
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticlesByIssue(volume: number, issue: number): Article[] {
  return articles.filter((a) => a.volume === volume && a.issue === issue);
}

export function getCurrentIssue(): Issue {
  return issues.find((i) => i.isCurrent) || issues[0];
}
