export interface IndexingPlatform {
  name: string;
  category: 'National' | 'International' | 'Repository';
  url: string;
  logoText: string;
  status: 'Indexed' | 'In Process' | 'Evaluation';
  description: string;
  showInSidebar: boolean;
}

export interface JournalConfig {
  name: string;
  nameEn: string;
  shortName: string;
  accreditedText: string;
  publisher: string;
  institution: string; // Komunitas / Organisasi Riset
  address: string;
  eIssn: string;
  pIssn: string;
  doiPrefix: string;
  publicationFrequency: string;
  language: string;
  license: string;
  licenseUrl: string;
  features: {
    showIndexingBlock: boolean; // Bisa dimatikan atau dinyalakan
    showToolsBlock: boolean;
    showIssnBlock: boolean;
  };
  submission: {
    email: string;
    whatsappNumber: string; // Format: 628xxxxxxxxxx
    whatsappDisplay: string;
    whatsappDefaultMessage: string;
    turnitinMaxSimilarity: number;
    reviewTimeEstimate: string;
  };
  announcement?: {
    title: string;
    content: string;
    active: boolean;
    date: string;
  };
  currentIssue?: {
    volume: number;
    issue: number;
    year: number;
    period: string;
    theme: string;
    coverUrl?: string;
  };
  storage: {
    gdriveIndexBaseUrl: string;
    pdfDirectoryPath: string;
  };
  editorial: {
    editorInChief: {
      name: string;
      affiliation: string;
      email: string;
    };
    editors: Array<{
      name: string;
      role: string;
      affiliation: string;
    }>;
    reviewers: Array<{
      name: string;
      affiliation: string;
    }>;
  };
  indexing: IndexingPlatform[];
}

export const journalConfig: JournalConfig = {
  name: 'Jurnal Terbuka Audit, Akuntansi, dan Pajak',
  nameEn: 'Journal of Open Audit, Accounting, and Taxation',
  shortName: 'JTAAP',
  accreditedText: 'Open Access Scientific Peer-Reviewed Journal',
  publisher: 'Sektansia Press',
  institution: 'Komunitas Riset Sektansia (Sektansia Research Community)',
  address: 'Jl. R.E. Martadinata No. 42, Bandung 40115, Jawa Barat, Indonesia',
  eIssn: '3048-289X',
  pIssn: '3048-2903',
  doiPrefix: '10.5281/zenodo.jtaap',
  publicationFrequency: 'Terbit 4 Kali Setahun (Maret, Juni, September, Desember)',
  language: 'Bahasa Indonesia dan Bahasa Inggris',
  license: 'Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',

  features: {
    showIndexingBlock: true, // Ubah false jika ingin menyembunyikan panel indexing di sidebar
    showToolsBlock: true,
    showIssnBlock: true,
  },

  submission: {
    email: 'redaksi@sektansia.org',
    whatsappNumber: '6281234567890',
    whatsappDisplay: '+62 812-3456-7890',
    whatsappDefaultMessage: 'Halo Redaksi JTAAP, saya ingin mengajukan manuskrip artikel ilmiah untuk proses review dan penerbitan.',
    turnitinMaxSimilarity: 20,
    reviewTimeEstimate: '3 sampai 7 Hari Kerja',
  },

  announcement: {
    title: 'Call for Papers: Volume 1 Nomor 1 (2026)',
    content: 'Redaksi JTAAP mengundang akademisi, peneliti, auditor, dan praktisi perpajakan untuk mengirimkan naskah orisinal hasil riset empiris atau kajian konseptual.',
    active: true,
    date: '2026-03-01',
  },

  currentIssue: {
    volume: 1,
    issue: 1,
    year: 2026,
    period: 'Maret 2026',
    theme: 'Edisi Perdana: Inovasi Audit, Akuntansi Keberlanjutan & Modernisasi Sistem Perpajakan',
  },

  storage: {
    gdriveIndexBaseUrl: 'https://cdn-papers.sektansia.workers.dev',
    pdfDirectoryPath: '/JTAAP/PDFs',
  },

  editorial: {
    editorInChief: {
      name: 'Dr. H. Hendra Setiawan, S.E., M.Ak., Ak., CA.',
      affiliation: 'Departemen Akuntansi & Forensik Keuangan, Sektansia Research Community',
      email: 'editor.chief@sektansia.org',
    },
    editors: [
      {
        name: 'M. Farhan Al-Ghifari, M.Sc., CFE.',
        role: 'Managing Editor (Audit & Investigasi Fraud)',
        affiliation: 'Pusat Kajian Audit Sektor Publik',
      },
      {
        name: 'Siti Rahmawati, M.Ak., BKP.',
        role: 'Associate Editor (Perpajakan & Kebijakan Fiskal)',
        affiliation: 'Lembaga Riset Perpajakan Terapan',
      },
      {
        name: 'Budi Darmawan, S.E., M.Si., Ak.',
        role: 'Associate Editor (Sistem Informasi Akuntansi)',
        affiliation: 'Laboratorium Digital Forensik Akuntansi',
      },
    ],
    reviewers: [
      {
        name: 'Prof. Dr. Irwan Hidayat, M.Si., Ak.',
        affiliation: 'Universitas Gadjah Mada',
      },
      {
        name: 'Dr. Nurul Fadilah, S.E., M.Si.',
        affiliation: 'Universitas Airlangga',
      },
      {
        name: 'Haryono Tri Wibowo, S.E., M.Ak.',
        affiliation: 'Institut Akuntan Publik Indonesia',
      },
      {
        name: 'Dr. Wahyudi Pratama, S.E., M.Sc.',
        affiliation: 'Universitas Padjadjaran',
      },
    ],
  },

  indexing: [
    {
      name: 'Google Scholar',
      category: 'International',
      url: 'https://scholar.google.com',
      logoText: 'Google Scholar',
      status: 'Indexed',
      description: 'Pengindeksan sitasi artikel dan pelacakan metrik karya ilmiah global.',
      showInSidebar: true,
    },
    {
      name: 'Garuda (Garba Rujukan Digital)',
      category: 'National',
      url: 'https://garuda.kemdikbud.go.id',
      logoText: 'GARUDA',
      status: 'In Process',
      description: 'Platform rujukan publikasi ilmiah nasional Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi.',
      showInSidebar: true,
    },
    {
      name: 'Crossref (DOI)',
      category: 'International',
      url: 'https://search.crossref.org',
      logoText: 'Crossref',
      status: 'Indexed',
      description: 'Lembaga registrasi Digital Object Identifier (DOI) resmi publikasi akademik internasional.',
      showInSidebar: true,
    },
    {
      name: 'Dimensions',
      category: 'International',
      url: 'https://www.dimensions.ai',
      logoText: 'Dimensions',
      status: 'Indexed',
      description: 'Pangkalan data riset bibliometrik dan sitasi multidisiplin global.',
      showInSidebar: true,
    },
    {
      name: 'SINTA (Science and Technology Index)',
      category: 'National',
      url: 'https://sinta.kemdikbud.go.id',
      logoText: 'SINTA',
      status: 'Evaluation',
      description: 'Portal akreditasi dan evaluasi kinerja jurnal ilmiah nasional Indonesia.',
      showInSidebar: false,
    },
    {
      name: 'BASE (Bielefeld Academic Search Engine)',
      category: 'International',
      url: 'https://www.base-search.net',
      logoText: 'BASE',
      status: 'Indexed',
      description: 'Mesin pencari riset ilmiah open access yang dikelola Perpustakaan Universitas Bielefeld.',
      showInSidebar: false,
    },
    {
      name: 'Scilit',
      category: 'International',
      url: 'https://www.scilit.net',
      logoText: 'Scilit',
      status: 'Indexed',
      description: 'Basis data komprehensif untuk publikasi ilmiah open access yang diperbarui berkala.',
      showInSidebar: false,
    },
  ],
};

export function getPdfDownloadUrl(pdfFileName: string): string {
  if (!pdfFileName) return '#';
  // Jika pdfFileName sudah merupakan URL lengkap (http/https)
  if (pdfFileName.startsWith('http://') || pdfFileName.startsWith('https://')) {
    if (!pdfFileName.includes('?')) {
      return `${pdfFileName}?a=view`;
    }
    return pdfFileName;
  }
  const base = journalConfig.storage.gdriveIndexBaseUrl.replace(/\/$/, '');
  const path = journalConfig.storage.pdfDirectoryPath.replace(/^\//, '').replace(/\/$/, '');
  if (!base) {
    return `/${pdfFileName}`;
  }
  const fullUrl = path ? `${base}/${path}/${pdfFileName}` : `${base}/${pdfFileName}`;
  return fullUrl.includes('?') ? fullUrl : `${fullUrl}?a=view`;
}

export function getWhatsAppSubmissionUrl(paperTitle?: string): string {
  const phone = journalConfig.submission.whatsappNumber;
  let text = journalConfig.submission.whatsappDefaultMessage;
  if (paperTitle) {
    text = `Halo Redaksi JTAAP, saya ingin mengajukan konfirmasi terkait naskah: "${paperTitle}".`;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function getEmailSubmissionUrl(paperTitle?: string): string {
  const email = journalConfig.submission.email;
  const subject = paperTitle 
    ? `[SUBMISSION JTAAP] - ${paperTitle}` 
    : '[SUBMISSION JTAAP] Pengajuan Naskah Artikel Ilmiah';
  const body = `Kepada Yth. Dewan Redaksi JTAAP,

Dengan ini saya mengajukan naskah artikel ilmiah untuk proses review dan penerbitan.

Judul Artikel: ${paperTitle || '[Tulis Judul Naskah]'}
Nama Penulis: 
Afiliasi/Institusi: 
Nomor WhatsApp: 

Naskah terlampir dalam format Word (.docx) atau PDF.

Hormat saya,
[Nama Penulis]`;

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
