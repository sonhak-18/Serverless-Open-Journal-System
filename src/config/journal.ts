export interface IndexingPlatform {
  name: string;
  category: 'National' | 'International' | 'Repository';
  url: string;
  logoText: string;
  status: 'Indexed' | 'In Process' | 'Evaluation';
  description: string;
  showInSidebar: boolean;
  iconUrl?: string;
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
  branding: {
    logoUrl: string;
    faviconUrl: string;
    templateUrl: string;
  };
  features: {
    showIndexingBlock: boolean; // Bisa dimatikan atau dinyalakan
    showToolsBlock: boolean;
    showIssnBlock: boolean;
    showEditorialTeam?: boolean; // Tampilkan/sembunyikan tab informasi Tim Redaksi
    hasActiveIssue?: boolean; // Status rilis: false jika belum ada naskah terbit (Call for Papers)
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
  name: 'Jurnal Terbuka Ekonomi, Bisnis, dan Akuntabilitas',
  nameEn: 'Open Journal of Economics, Business, and Accountability',
  shortName: 'JTEBA',
  accreditedText: 'Open Access Scientific Peer-Reviewed Journal',
  publisher: 'Organisasi Riset dan Publikasi Ilmiah Praniti',
  institution: 'Organisasi Riset dan Publikasi Ilmiah Praniti',
  address: 'Indonesia',
  eIssn: '2999-7127',
  pIssn: '2999-7119',
  doiPrefix: '10.00000',
  publicationFrequency: '2 Kali/Tahun (Maret & September)',
  language: 'Bahasa Indonesia dan Bahasa Inggris',
  license: 'Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',

  branding: {
    logoUrl: '/images/logo-jteba.png',
    faviconUrl: '/favicon-jteba.png',
    templateUrl: '/template-jteba.docx',
  },

  features: {
    showIndexingBlock: true,
    showToolsBlock: true,
    showIssnBlock: true,
    showEditorialTeam: true,
    hasActiveIssue: false,
  },

  submission: {
    email: 'redaksi@praniti.or.id',
    whatsappNumber: '628981822777',
    whatsappDisplay: '+62 898-182-2777',
    whatsappDefaultMessage: 'Halo Redaksi JTEBA, saya ingin mengajukan manuskrip artikel ilmiah untuk proses review dan penerbitan.',
    turnitinMaxSimilarity: 20,
    reviewTimeEstimate: '3 sampai 7 Hari Kerja',
  },

  announcement: {
    title: 'Call for Papers: Volume 1 Nomor 1 (2026)',
    content: 'Redaksi JTEBA mengundang akademisi, peneliti, praktisi, dan profesional untuk mengirimkan naskah orisinal hasil riset empiris atau telaah literatur kritis di bidang akuntansi keberlanjutan & ESG, perpajakan & kebijakan fiskal, auditing & tata kelola, serta dinamika ekonomi & bisnis terapan.',
    active: true,
    date: '2026-03-01',
  },

  currentIssue: {
    volume: 1,
    issue: 1,
    year: 2026,
    period: 'Maret 2026',
    theme: 'Edisi Perdana: Akuntabilitas Keberlanjutan, Tata Kelola Fiskal & Transformasi Bisnis Hijau',
  },

  storage: {
    gdriveIndexBaseUrl: 'https://cdn.example.com/one',
    pdfDirectoryPath: '',
  },

  editorial: {
    editorInChief: {
      name: '',
      affiliation: '',
      email: '',
    },
    editors: [],
    reviewers: [],
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
      description: 'Organisasi registrasi Digital Object Identifier (DOI) resmi publikasi akademik internasional.',
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

export function getPdfDownloadUrl(
  pdfFileName: string,
  storageOrBase?: string | { gdriveIndexBaseUrl?: string; pdfDirectoryPath?: string },
  customPath?: string
): string {
  if (!pdfFileName) return '#';
  // Jika pdfFileName sudah merupakan URL lengkap (http/https)
  if (pdfFileName.startsWith('http://') || pdfFileName.startsWith('https://')) {
    return pdfFileName;
  }

  let baseUrl = journalConfig.storage.gdriveIndexBaseUrl;
  let dirPath = journalConfig.storage.pdfDirectoryPath;

  if (typeof storageOrBase === 'object' && storageOrBase !== null) {
    if (storageOrBase.gdriveIndexBaseUrl) baseUrl = storageOrBase.gdriveIndexBaseUrl;
    if (storageOrBase.pdfDirectoryPath !== undefined) dirPath = storageOrBase.pdfDirectoryPath;
  } else if (typeof storageOrBase === 'string') {
    baseUrl = storageOrBase;
    if (customPath !== undefined) dirPath = customPath;
  }

  const base = (baseUrl || '').replace(/\/$/, '');
  const path = (dirPath || '').replace(/^\//, '').replace(/\/$/, '');
  if (!base) {
    return `/${pdfFileName}`;
  }
  const cleanFile = pdfFileName.replace(/^\//, '');
  return path ? `${base}/${path}/${cleanFile}` : `${base}/${cleanFile}`;
}

export function getWhatsAppSubmissionUrl(paperTitle?: string, phoneOverride?: string, messageOverride?: string): string {
  const rawPhone = phoneOverride || journalConfig.submission.whatsappNumber;
  const cleanPhone = rawPhone.replace(/\D/g, '');
  let text = messageOverride || journalConfig.submission.whatsappDefaultMessage;
  if (paperTitle) {
    text = `Halo Redaksi JTEBA, saya ingin mengajukan konfirmasi terkait naskah: "${paperTitle}".`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function getEmailSubmissionUrl(paperTitle?: string, emailOverride?: string): string {
  const email = emailOverride || journalConfig.submission.email;
  const subject = paperTitle 
    ? `[SUBMISSION JTEBA] - ${paperTitle}` 
    : '[SUBMISSION JTEBA] Pengajuan Naskah Artikel Ilmiah';
  const body = `Kepada Yth. Dewan Redaksi JTEBA,

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
