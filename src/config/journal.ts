export interface JournalConfig {
  name: string;
  shortName: string;
  publisher: string;
  eIssn: string;
  pIssn: string;
  doiPrefix: string;
  publicationFrequency: string;
  language: string;
  license: string;
  licenseUrl: string;
  submission: {
    email: string;
    whatsappNumber: string; // Format: 628xxxxxxxxxx
    whatsappDisplay: string;
    whatsappDefaultMessage: string;
    turnitinMaxSimilarity: number;
    reviewTimeEstimate: string;
    apcAmount: string; // Article Processing Charge
  };
  storage: {
    // URL dasar dari Cloudflare Worker Google Drive Index kamu.
    // Contoh: 'https://gdrive-index.sektansia.workers.dev'
    // Biarkan kosong ('') atau isi URL untuk testing.
    gdriveIndexBaseUrl: string;
    // Path folder di dalam Google Drive Index tempat file PDF disimpan
    pdfDirectoryPath: string;
  };
  editorial: {
    editorInChief: {
      name: string;
      affiliation: string;
      email: string;
      scopusId?: string;
    };
    editors: Array<{
      name: string;
      role: string;
      affiliation: string;
    }>;
  };
}

export const journalConfig: JournalConfig = {
  name: 'Jurnal Terbuka Audit, Akuntansi, dan Pajak',
  shortName: 'JTAAP',
  publisher: 'Sektansia Press',
  eIssn: 'xxxx-xxxx (Proses Pengajuan)',
  pIssn: 'xxxx-xxxx (Proses Pengajuan)',
  doiPrefix: '10.xxxx/jtaap',
  publicationFrequency: '4 Kali Setahun (Maret, Juni, September, Desember)',
  language: 'Bahasa Indonesia dan Bahasa Inggris',
  license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',

  submission: {
    // Konfigurasi kontak submission yang bisa diisi pemilik jurnal
    email: 'redaksi@sektansia.org',
    whatsappNumber: '6281234567890',
    whatsappDisplay: '+62 812-3456-7890',
    whatsappDefaultMessage: 'Halo Redaksi JTAAP, saya ingin mengajukan naskah artikel ilmiah untuk proses review dan penerbitan.',
    turnitinMaxSimilarity: 20, // Persentase toleransi kemiripan
    reviewTimeEstimate: '3 hingga 7 Hari Kerja',
    apcAmount: 'Rp 0 (Diamond Open Access / Gratis Penuh)',
  },

  storage: {
    // Masukkan URL deployment Google Drive Index kamu di sini setelah siap.
    // Jika belum dideploy, sistem akan otomatis menyediakan preview atau download langsung.
    gdriveIndexBaseUrl: 'https://cdn-papers.sektansia.workers.dev',
    pdfDirectoryPath: '/JTAAP/PDFs',
  },

  editorial: {
    editorInChief: {
      name: 'Dr. H. Hendra Setiawan, S.E., M.Ak., Ak., CA.',
      affiliation: 'Departemen Akuntansi & Forensik Keuangan, Sektansia Press Academic Board',
      email: 'editor.chief@sektansia.org',
    },
    editors: [
      {
        name: 'M. Farhan Al-Ghifari, M.Sc., CFE.',
        role: 'Managing Editor (Bidang Audit & Investigasi Kecurangan)',
        affiliation: 'Pusat Kajian Audit Sektor Publik',
      },
      {
        name: 'Siti Rahmawati, M.Ak., BKP.',
        role: 'Associate Editor (Bidang Perpajakan & Kebijakan Fiskal)',
        affiliation: 'Lembaga Riset Perpajakan Terapan',
      },
      {
        name: 'Budi Darmawan, S.E., M.Si., Ak.',
        role: 'Associate Editor (Bidang Sistem Informasi Akuntansi)',
        affiliation: 'Laboratorium Digital Forensik Akuntansi',
      },
    ],
  },
};

/**
 * Helper untuk merangkai link download PDF dari Google Drive Index
 */
export function getPdfDownloadUrl(pdfFileName: string): string {
  if (!pdfFileName) return '#';
  const base = journalConfig.storage.gdriveIndexBaseUrl.replace(/\/$/, '');
  const path = journalConfig.storage.pdfDirectoryPath.replace(/^\//, '');
  if (!base || base.includes('workers.dev') === false) {
    // Jika belum diset atau masih default, arahkan ke path lokal atau URL langsung
    return `/${pdfFileName}`;
  }
  return `${base}/${path}/${pdfFileName}`;
}

/**
 * Helper untuk merangkai link chat WhatsApp submission naskah
 */
export function getWhatsAppSubmissionUrl(paperTitle?: string): string {
  const phone = journalConfig.submission.whatsappNumber;
  let text = journalConfig.submission.whatsappDefaultMessage;
  if (paperTitle) {
    text = `Halo Redaksi JTAAP, saya ingin mengajukan naskah artikel berjudul: "${paperTitle}".`;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Helper untuk link email submission
 */
export function getEmailSubmissionUrl(paperTitle?: string): string {
  const email = journalConfig.submission.email;
  const subject = paperTitle 
    ? `[SUBMISSION JTAAP] - ${paperTitle}` 
    : '[SUBMISSION JTAAP] Pengajuan Naskah Artikel Ilmiah';
  const body = `Kepada Yth. Dewan Redaksi JTAAP (Sektansia Press),

Dengan ini saya mengajukan naskah artikel ilmiah untuk proses review dan penerbitan.

Judul Artikel: ${paperTitle || '[Tulis Judul Naskah]'}
Nama Penulis Utama: 
Afiliasi/Institusi: 
Nomor Kontak/WA: 

Naskah terlampir dalam format dokumen (.docx atau .pdf).

Hormat saya,
[Nama Penulis]`;

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
