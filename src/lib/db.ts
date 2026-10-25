import { journalConfig, type JournalConfig, type IndexingPlatform } from '../config/journal';
import { articles as initialArticles, type Article } from '../data/articles';


export interface JournalSubmission {
  id?: number;
  regNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  affiliation: string;
  city?: string;
  country?: string;
  scopeCluster: string;
  title: string;
  abstract: string;
  fileName: string;
  fileSize: number;
  supplementaryFileName?: string;
  status: 'submitted' | 'under_review' | 'revision' | 'accepted' | 'declined';
  createdAt: string;
}

export interface JtebaDatabase {
  settings: JournalConfig;
  articles: Article[];
  editorial: {
    editorInChief: { name: string; affiliation: string; email: string };
    editors: Array<{ id: string; name: string; role: string; affiliation: string }>;
    reviewers: Array<{ id: string; name: string; affiliation: string }>;
  };
  indexing: IndexingPlatform[];
}

export type SektansiaDatabase = JtebaDatabase;

// Global reference for D1 passed via middleware
let globalD1Instance: any = null;

export function setGlobalD1(d1: any) {
  if (d1) globalD1Instance = d1;
}

export function getGlobalD1(): any {
  return globalD1Instance;
}

let isSchemaInitialized = false;
export async function ensureDbSchemaInitialized(db: any): Promise<void> {
  if (isSchemaInitialized || !db) return;
  try {
    try { await db.prepare('ALTER TABLE journal_settings ADD COLUMN show_editorial_team INTEGER DEFAULT 1').run(); } catch (_) {}
    try { await db.prepare('ALTER TABLE journal_settings ADD COLUMN has_active_issue INTEGER DEFAULT 0').run(); } catch (_) {}
    try { await db.prepare('ALTER TABLE journal_settings ADD COLUMN publication_frequency TEXT DEFAULT "4 Kali/Tahun (Maret, Juni, September, Desember)"').run(); } catch (_) {}
    try { await db.prepare('ALTER TABLE journal_settings ADD COLUMN logo_url TEXT DEFAULT "/images/logo.png"').run(); } catch (_) {}
    try { await db.prepare('ALTER TABLE journal_settings ADD COLUMN favicon_url TEXT DEFAULT "/favicon.png"').run(); } catch (_) {}
    try { await db.prepare('ALTER TABLE journal_settings ADD COLUMN template_url TEXT DEFAULT "/template-jteba.docx"').run(); } catch (_) {}
    try { await db.prepare('ALTER TABLE journal_settings ADD COLUMN resend_api_key TEXT DEFAULT ""').run(); } catch (_) {}
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS journal_submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reg_number TEXT UNIQUE NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          affiliation TEXT NOT NULL,
          city TEXT DEFAULT '',
          country TEXT DEFAULT 'Indonesia',
          scope_cluster TEXT NOT NULL,
          title TEXT NOT NULL,
          abstract TEXT NOT NULL,
          file_name TEXT NOT NULL,
          file_size INTEGER DEFAULT 0,
          supplementary_file_name TEXT DEFAULT '',
          status TEXT DEFAULT 'submitted',
          created_at TEXT NOT NULL
        )
      `).run();
    } catch (_) {}
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS journal_issues (
          id TEXT PRIMARY KEY,
          volume INTEGER NOT NULL,
          issue INTEGER NOT NULL,
          year INTEGER NOT NULL,
          period TEXT NOT NULL,
          theme TEXT DEFAULT '',
          cover_url TEXT DEFAULT '',
          description TEXT DEFAULT '',
          publish_date TEXT DEFAULT '',
          is_current INTEGER DEFAULT 0
        )
      `).run();
    } catch (_) {}
    isSchemaInitialized = true;
  } catch (_) {}
}

let isPortalSchemaInitialized = false;
export async function ensurePortalSchemaInitialized(db: any): Promise<void> {
  if (isPortalSchemaInitialized || !db) return;
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS portal_settings (
        id TEXT PRIMARY KEY,
        org_name TEXT NOT NULL,
        org_name_en TEXT NOT NULL,
        slogan_id TEXT DEFAULT '',
        slogan_en TEXT DEFAULT '',
        description TEXT DEFAULT '',
        domain_display TEXT DEFAULT '',
        email TEXT DEFAULT '',
        whatsapp TEXT DEFAULT '',
        address TEXT DEFAULT '',
        logo_url TEXT DEFAULT '',
        favicon_url TEXT DEFAULT '',
        call_for_papers_active INTEGER DEFAULT 1,
        flagship_journal_name TEXT DEFAULT '',
        flagship_journal_en TEXT DEFAULT '',
        flagship_journal_url TEXT DEFAULT '',
        flagship_journal_emblem_url TEXT DEFAULT '',
        missions_json TEXT DEFAULT '[]'
      )
    `).run();
    try { await db.prepare('ALTER TABLE portal_settings ADD COLUMN flagship_journal_emblem_url TEXT').run(); } catch (_) {}
    isPortalSchemaInitialized = true;
  } catch (_) {}
}

// Global in-memory cache for local dev / fallback
let memoryStore: JtebaDatabase = {
  settings: JSON.parse(JSON.stringify(journalConfig)),
  articles: JSON.parse(JSON.stringify(initialArticles)),
  editorial: {
    editorInChief: { ...journalConfig.editorial.editorInChief },
    editors: journalConfig.editorial.editors.map((e, idx) => ({ id: `ed-${idx + 1}`, ...e })),
    reviewers: journalConfig.editorial.reviewers.map((r, idx) => ({ id: `rev-${idx + 1}`, ...r })),
  },
  indexing: JSON.parse(JSON.stringify(journalConfig.indexing)),
};

// Public repository methods for D1 and local fallback

export interface JournalIssue {
  id: string;
  volume: number;
  issue: number;
  year: number;
  period: string;
  theme?: string;
  coverUrl?: string;
  description?: string;
  publishDate?: string;
  isCurrent: boolean;
}

let memoryIssues: JournalIssue[] = [];

export async function getDbSettings(d1?: any): Promise<JournalConfig> {
  const db = d1 || globalD1Instance;
  if (db) {
    try {
      const row = await db.prepare('SELECT * FROM journal_settings WHERE id = "default"').first();
      if (row) {
        // Auto-migrasi data URL uncropped lama atau logo generik ke aset resmi JTEBA
        if (
          (row.logo_url && (row.logo_url.startsWith('data:') || row.logo_url === '/images/logo.png')) ||
          (row.favicon_url && (row.favicon_url.startsWith('data:') || row.favicon_url === '/favicon.png'))
        ) {
          const cleanLogo = (row.logo_url && !row.logo_url.startsWith('data:') && row.logo_url !== '/images/logo.png') ? row.logo_url : '/images/logo-jteba.png';
          const cleanFav = (row.favicon_url && !row.favicon_url.startsWith('data:') && row.favicon_url !== '/favicon.png') ? row.favicon_url : '/favicon-jteba.png';
          await db.prepare('UPDATE journal_settings SET logo_url = ?, favicon_url = ? WHERE id = "default"')
            .bind(cleanLogo, cleanFav)
            .run()
            .catch(() => {});
          row.logo_url = cleanLogo;
          row.favicon_url = cleanFav;
        }

        // Auto-migrasi e-ISSN dan p-ISSN resmi jika belum valid atau masih pakai 3048
        if (!row.e_issn || row.e_issn.includes('Proses') || row.e_issn === '0000-0000' || row.e_issn === '3048-2909') {
          await db.prepare('UPDATE journal_settings SET e_issn = "2999-7127", p_issn = "2999-7119", show_issn_block = 1 WHERE id = "default"').run().catch(() => {});
          row.e_issn = '2999-7127';
          row.p_issn = '2999-7119';
          row.show_issn_block = 1;
        }

        await ensureDbSchemaInitialized(db);

        const loadedSettings: JournalConfig = {
          ...memoryStore.settings,
          name: row.name || memoryStore.settings.name,
          nameEn: row.name_en || memoryStore.settings.nameEn,
          shortName: row.short_name || memoryStore.settings.shortName,
          accreditedText: row.accredited_text || memoryStore.settings.accreditedText,
          institution: row.institution || memoryStore.settings.institution,
          publisher: row.publisher || memoryStore.settings.publisher,
          address: row.address || memoryStore.settings.address,
          eIssn: row.e_issn || '2999-7127',
          pIssn: row.p_issn || '2999-7119',
          doiPrefix: (row.doi_prefix && !row.doi_prefix.includes('zenodo') && row.doi_prefix.startsWith('10.')) ? row.doi_prefix : '10.00000',
          publicationFrequency: row.publication_frequency || memoryStore.settings.publicationFrequency,
          license: row.license || memoryStore.settings.license,
          licenseUrl: row.license_url || memoryStore.settings.licenseUrl,
          branding: {
            logoUrl: (row.logo_url && row.logo_url !== '/images/logo.png') ? row.logo_url : (memoryStore.settings.branding?.logoUrl || '/images/logo-jteba.png'),
            faviconUrl: (row.favicon_url && row.favicon_url !== '/favicon.png') ? row.favicon_url : (memoryStore.settings.branding?.faviconUrl || '/favicon-jteba.png'),
            templateUrl: row.template_url || memoryStore.settings.branding?.templateUrl || '/template-jteba.docx',
          },
          features: {
            showIndexingBlock: row.show_indexing_block !== undefined ? Boolean(row.show_indexing_block) : memoryStore.settings.features.showIndexingBlock,
            showToolsBlock: row.show_tools_block !== undefined ? Boolean(row.show_tools_block) : memoryStore.settings.features.showToolsBlock,
            showIssnBlock: row.show_issn_block !== undefined ? Boolean(row.show_issn_block) : true,
            showEditorialTeam: (row.show_editorial_team !== undefined && row.show_editorial_team !== null) ? Boolean(row.show_editorial_team) : true,
            hasActiveIssue: (row.has_active_issue !== undefined && row.has_active_issue !== null) ? Boolean(row.has_active_issue) : false,
          },
          submission: {
            ...memoryStore.settings.submission,
            email: row.email || memoryStore.settings.submission.email,
            whatsappNumber: row.whatsapp_number || memoryStore.settings.submission.whatsappNumber,
            whatsappDisplay: row.whatsapp_display || memoryStore.settings.submission.whatsappDisplay,
            whatsappDefaultMessage: row.whatsapp_message || memoryStore.settings.submission.whatsappDefaultMessage,
            turnitinMaxSimilarity: row.turnitin_max_similarity !== undefined ? Number(row.turnitin_max_similarity) : memoryStore.settings.submission.turnitinMaxSimilarity,
            reviewTimeEstimate: row.review_time_estimate || memoryStore.settings.submission.reviewTimeEstimate,
            resendApiKey: row.resend_api_key || "",
          },
          storage: {
            ...memoryStore.settings.storage,
            gdriveIndexBaseUrl: row.gdrive_base_url || memoryStore.settings.storage.gdriveIndexBaseUrl,
            pdfDirectoryPath: row.pdf_directory_path || memoryStore.settings.storage.pdfDirectoryPath,
          },
          announcement: {
            title: row.announcement_title || 'Call for Papers: Volume 1 Nomor 1 (2026)',
            content: row.announcement_content || 'Redaksi JTEBA mengundang akademisi, peneliti, praktisi, dan profesional untuk mengirimkan naskah orisinal.',
            active: row.announcement_active !== undefined ? Boolean(row.announcement_active) : true,
            date: row.announcement_date || '2026-03-01',
          },
          currentIssue: {
            volume: (row.current_volume !== undefined && row.current_volume !== null) ? Number(row.current_volume) : 1,
            issue: (row.current_issue !== undefined && row.current_issue !== null) ? Number(row.current_issue) : 1,
            year: (row.current_year !== undefined && row.current_year !== null) ? Number(row.current_year) : 2026,
            period: (row.current_period !== undefined && row.current_period !== null && row.current_period !== '') ? String(row.current_period) : 'Maret 2026',
            theme: (row.current_theme !== undefined && row.current_theme !== null) ? String(row.current_theme) : 'Edisi Perdana: Inovasi Audit, Akuntansi Keberlanjutan & Modernisasi Sistem Perpajakan',
            coverUrl: row.current_cover_url || '',
          },
        };
        memoryStore.settings = loadedSettings;
        return loadedSettings;
      }
    } catch (e) {
      console.warn('D1 query fallback to memory:', e);
    }
  }
  return memoryStore.settings;
}

export async function updateDbSettings(data: {
  name?: string;
  nameEn?: string;
  shortName?: string;
  accreditedText?: string;
  institution?: string;
  publisher?: string;
  address?: string;
  doiPrefix?: string;
  publicationFrequency?: string;
  license?: string;
  licenseUrl?: string;
  logoUrl?: string;
  faviconUrl?: string;
  templateUrl?: string;
  turnitinMaxSimilarity?: number;
  reviewTimeEstimate?: string;
  email?: string;
  whatsappNumber?: string;
  whatsappDisplay?: string;
  whatsappMessage?: string;
  eIssn?: string;
  pIssn?: string;
  showIndexingBlock?: boolean;
  showToolsBlock?: boolean;
  showIssnBlock?: boolean;
  showEditorialTeam?: boolean;
  hasActiveIssue?: boolean;
  gdriveBaseUrl?: string;
  pdfDirectoryPath?: string;
  announcementTitle?: string;
  announcementContent?: string;
  announcementActive?: boolean;
  announcementDate?: string;
  currentVolume?: number;
  currentIssue?: number;
  currentYear?: number;
  currentPeriod?: string;
  currentTheme?: string;
  currentCoverUrl?: string;
}, d1?: any): Promise<void> {
  const s = memoryStore.settings;

  // 1. Partial update pada in-memory store
  if (data.name !== undefined) s.name = data.name;
  if (data.nameEn !== undefined) s.nameEn = data.nameEn;
  if (data.shortName !== undefined) s.shortName = data.shortName;
  if (data.accreditedText !== undefined) s.accreditedText = data.accreditedText;
  if (data.institution !== undefined) s.institution = data.institution;
  if (data.publisher !== undefined) s.publisher = data.publisher;
  if (data.address !== undefined) s.address = data.address;
  if (data.doiPrefix !== undefined) s.doiPrefix = data.doiPrefix;
  if (data.publicationFrequency !== undefined) s.publicationFrequency = data.publicationFrequency;
  if (data.license !== undefined) s.license = data.license;
  if (data.licenseUrl !== undefined) s.licenseUrl = data.licenseUrl;
  if (data.email !== undefined) s.submission.email = data.email;
  if (data.whatsappNumber !== undefined) s.submission.whatsappNumber = data.whatsappNumber;
  if (data.whatsappDisplay !== undefined) s.submission.whatsappDisplay = data.whatsappDisplay;
  if (data.whatsappMessage !== undefined) s.submission.whatsappDefaultMessage = data.whatsappMessage;
  if (data.turnitinMaxSimilarity !== undefined) s.submission.turnitinMaxSimilarity = Number(data.turnitinMaxSimilarity);
  if (data.reviewTimeEstimate !== undefined) s.submission.reviewTimeEstimate = data.reviewTimeEstimate;
  if (data.resendApiKey !== undefined) (s.submission as any).resendApiKey = data.resendApiKey;
  if (data.eIssn !== undefined) s.eIssn = data.eIssn;
  if (data.pIssn !== undefined) s.pIssn = data.pIssn;
  if (data.showIndexingBlock !== undefined) s.features.showIndexingBlock = Boolean(data.showIndexingBlock);
  if (data.showToolsBlock !== undefined) s.features.showToolsBlock = Boolean(data.showToolsBlock);
  if (data.showIssnBlock !== undefined) s.features.showIssnBlock = Boolean(data.showIssnBlock);
  if (data.showEditorialTeam !== undefined) s.features.showEditorialTeam = Boolean(data.showEditorialTeam);
  if (data.hasActiveIssue !== undefined) s.features.hasActiveIssue = Boolean(data.hasActiveIssue);
  if (data.gdriveBaseUrl !== undefined) s.storage.gdriveIndexBaseUrl = data.gdriveBaseUrl;
  if (data.pdfDirectoryPath !== undefined) s.storage.pdfDirectoryPath = data.pdfDirectoryPath;
  if (data.announcementTitle !== undefined) {
    if (!s.announcement) s.announcement = { title: '', content: '', active: true, date: '' };
    s.announcement.title = data.announcementTitle;
  }
  if (data.announcementContent !== undefined) {
    if (!s.announcement) s.announcement = { title: '', content: '', active: true, date: '' };
    s.announcement.content = data.announcementContent;
  }
  if (data.announcementActive !== undefined) {
    if (!s.announcement) s.announcement = { title: '', content: '', active: true, date: '' };
    s.announcement.active = Boolean(data.announcementActive);
  }
  if (data.announcementDate !== undefined) {
    if (!s.announcement) s.announcement = { title: '', content: '', active: true, date: '' };
    s.announcement.date = data.announcementDate;
  }
  if (data.currentVolume !== undefined) {
    if (!s.currentIssue) s.currentIssue = { volume: 1, issue: 1, year: 2026, period: '', theme: '', coverUrl: '' };
    s.currentIssue.volume = Number(data.currentVolume);
  }
  if (data.currentIssue !== undefined) {
    if (!s.currentIssue) s.currentIssue = { volume: 1, issue: 1, year: 2026, period: '', theme: '', coverUrl: '' };
    s.currentIssue.issue = Number(data.currentIssue);
  }
  if (data.currentYear !== undefined) {
    if (!s.currentIssue) s.currentIssue = { volume: 1, issue: 1, year: 2026, period: '', theme: '', coverUrl: '' };
    s.currentIssue.year = Number(data.currentYear);
  }
  if (data.currentPeriod !== undefined) {
    if (!s.currentIssue) s.currentIssue = { volume: 1, issue: 1, year: 2026, period: '', theme: '', coverUrl: '' };
    s.currentIssue.period = data.currentPeriod;
  }
  if (data.currentTheme !== undefined) {
    if (!s.currentIssue) s.currentIssue = { volume: 1, issue: 1, year: 2026, period: '', theme: '', coverUrl: '' };
    s.currentIssue.theme = data.currentTheme;
  }
  if (data.currentCoverUrl !== undefined) {
    if (!s.currentIssue) s.currentIssue = { volume: 1, issue: 1, year: 2026, period: '', theme: '', coverUrl: '' };
    s.currentIssue.coverUrl = data.currentCoverUrl;
  }
  if (!s.branding) {
    s.branding = {
      logoUrl: '/images/logo.png',
      faviconUrl: '/favicon.png',
      templateUrl: '/template-jteba.docx',
    };
  }
  if (data.logoUrl !== undefined) s.branding.logoUrl = data.logoUrl;
  if (data.faviconUrl !== undefined) s.branding.faviconUrl = data.faviconUrl;
  if (data.templateUrl !== undefined) s.branding.templateUrl = data.templateUrl;

  const db = d1 || globalD1Instance;
  if (db) {
    try {
      // Auto-migrate schema columns if not already present
      try { await db.prepare('ALTER TABLE journal_settings ADD COLUMN logo_url TEXT DEFAULT "/images/logo.png"').run(); } catch (_) {}
      try { await db.prepare('ALTER TABLE journal_settings ADD COLUMN favicon_url TEXT DEFAULT "/favicon.png"').run(); } catch (_) {}
      try { await db.prepare('ALTER TABLE journal_settings ADD COLUMN template_url TEXT DEFAULT "/template-jteba.docx"').run(); } catch (_) {}
      try { await db.prepare('ALTER TABLE journal_settings ADD COLUMN show_editorial_team INTEGER DEFAULT 1').run(); } catch (_) {}
      try { await db.prepare('ALTER TABLE journal_settings ADD COLUMN has_active_issue INTEGER DEFAULT 0').run(); } catch (_) {}
      try { await db.prepare('ALTER TABLE journal_settings ADD COLUMN publication_frequency TEXT DEFAULT "4 Kali/Tahun (Maret, Juni, September, Desember)"').run(); } catch (_) {}

      // Pastikan baris default sudah ada di database sebelum update parsial
      await db.prepare("INSERT OR IGNORE INTO journal_settings (id) VALUES ('default')").run().catch(() => {});

      // 2. Bangun UPDATE SQL dinamis hanya untuk kolom-kolom yang disertakan dalam `data`
      const updates: { col: string; val: any }[] = [];

      if (data.name !== undefined) updates.push({ col: 'name', val: data.name });
      if (data.nameEn !== undefined) updates.push({ col: 'name_en', val: data.nameEn });
      if (data.shortName !== undefined) updates.push({ col: 'short_name', val: data.shortName });
      if (data.accreditedText !== undefined) updates.push({ col: 'accredited_text', val: data.accreditedText });
      if (data.institution !== undefined) updates.push({ col: 'institution', val: data.institution });
      if (data.publisher !== undefined) updates.push({ col: 'publisher', val: data.publisher });
      if (data.address !== undefined) updates.push({ col: 'address', val: data.address });
      if (data.doiPrefix !== undefined) updates.push({ col: 'doi_prefix', val: data.doiPrefix });
      if (data.publicationFrequency !== undefined) updates.push({ col: 'publication_frequency', val: data.publicationFrequency });
      if (data.license !== undefined) updates.push({ col: 'license', val: data.license });
      if (data.licenseUrl !== undefined) updates.push({ col: 'license_url', val: data.licenseUrl });
      if (data.logoUrl !== undefined) updates.push({ col: 'logo_url', val: data.logoUrl });
      if (data.faviconUrl !== undefined) updates.push({ col: 'favicon_url', val: data.faviconUrl });
      if (data.templateUrl !== undefined) updates.push({ col: 'template_url', val: data.templateUrl });
      if (data.turnitinMaxSimilarity !== undefined) updates.push({ col: 'turnitin_max_similarity', val: Number(data.turnitinMaxSimilarity) });
      if (data.reviewTimeEstimate !== undefined) updates.push({ col: 'review_time_estimate', val: data.reviewTimeEstimate });
      if (data.resendApiKey !== undefined) updates.push({ col: 'resend_api_key', val: data.resendApiKey });
      if (data.email !== undefined) updates.push({ col: 'email', val: data.email });
      if (data.whatsappNumber !== undefined) updates.push({ col: 'whatsapp_number', val: data.whatsappNumber });
      if (data.whatsappDisplay !== undefined) updates.push({ col: 'whatsapp_display', val: data.whatsappDisplay });
      if (data.whatsappMessage !== undefined) updates.push({ col: 'whatsapp_message', val: data.whatsappMessage });
      if (data.eIssn !== undefined) updates.push({ col: 'e_issn', val: data.eIssn });
      if (data.pIssn !== undefined) updates.push({ col: 'p_issn', val: data.pIssn });
      if (data.showIndexingBlock !== undefined) updates.push({ col: 'show_indexing_block', val: data.showIndexingBlock ? 1 : 0 });
      if (data.showToolsBlock !== undefined) updates.push({ col: 'show_tools_block', val: data.showToolsBlock ? 1 : 0 });
      if (data.showIssnBlock !== undefined) updates.push({ col: 'show_issn_block', val: data.showIssnBlock ? 1 : 0 });
      if (data.showEditorialTeam !== undefined) updates.push({ col: 'show_editorial_team', val: data.showEditorialTeam ? 1 : 0 });
      if (data.hasActiveIssue !== undefined) updates.push({ col: 'has_active_issue', val: data.hasActiveIssue ? 1 : 0 });
      if (data.gdriveBaseUrl !== undefined) updates.push({ col: 'gdrive_base_url', val: data.gdriveBaseUrl });
      if (data.pdfDirectoryPath !== undefined) updates.push({ col: 'pdf_directory_path', val: data.pdfDirectoryPath });
      if (data.announcementTitle !== undefined) updates.push({ col: 'announcement_title', val: data.announcementTitle });
      if (data.announcementContent !== undefined) updates.push({ col: 'announcement_content', val: data.announcementContent });
      if (data.announcementActive !== undefined) updates.push({ col: 'announcement_active', val: data.announcementActive ? 1 : 0 });
      if (data.announcementDate !== undefined) updates.push({ col: 'announcement_date', val: data.announcementDate });
      if (data.currentVolume !== undefined) updates.push({ col: 'current_volume', val: Number(data.currentVolume) });
      if (data.currentIssue !== undefined) updates.push({ col: 'current_issue', val: Number(data.currentIssue) });
      if (data.currentYear !== undefined) updates.push({ col: 'current_year', val: Number(data.currentYear) });
      if (data.currentPeriod !== undefined) updates.push({ col: 'current_period', val: data.currentPeriod });
      if (data.currentTheme !== undefined) updates.push({ col: 'current_theme', val: data.currentTheme });
      if (data.currentCoverUrl !== undefined) updates.push({ col: 'current_cover_url', val: data.currentCoverUrl });

      if (updates.length > 0) {
        const setSql = updates.map((u) => `${u.col} = ?`).join(', ');
        const bindings = updates.map((u) => u.val);
        await db.prepare(`UPDATE journal_settings SET ${setSql} WHERE id = 'default'`).bind(...bindings).run();
      }
    } catch (e) {
      console.warn('D1 update settings error:', e);
    }
  }
}

export async function getDbIssues(d1?: any): Promise<JournalIssue[]> {
  const db = d1 || globalD1Instance;
  if (db) {
    try {
      await ensureDbSchemaInitialized(db);
      const rows = await db.prepare('SELECT * FROM journal_issues ORDER BY volume DESC, issue DESC').all();
      if (rows && rows.results) {
        return (rows.results as any[]).map((r: any) => ({
          id: r.id,
          volume: Number(r.volume),
          issue: Number(r.issue),
          year: Number(r.year),
          period: r.period || '',
          theme: r.theme || '',
          coverUrl: r.cover_url || '',
          description: r.description || '',
          publishDate: r.publish_date || '',
          isCurrent: Boolean(r.is_current),
          is_current: r.is_current ? 1 : 0,
        }));
      }
    } catch (e) {
      console.warn('D1 query issues error:', e);
    }
  }
  return memoryIssues.map((i) => ({
    ...i,
    is_current: i.isCurrent ? 1 : 0,
  }));
}

export async function addDbIssue(issue: JournalIssue, d1?: any): Promise<void> {
  const db = d1 || globalD1Instance;
  if (issue.isCurrent) {
    memoryIssues.forEach((i) => (i.isCurrent = false));
    if (!memoryStore.settings.currentIssue) {
      memoryStore.settings.currentIssue = { volume: 1, issue: 1, year: 2026, period: '', theme: '', coverUrl: '' };
    }
    memoryStore.settings.currentIssue.volume = issue.volume;
    memoryStore.settings.currentIssue.issue = issue.issue;
    memoryStore.settings.currentIssue.year = issue.year;
    memoryStore.settings.currentIssue.period = issue.period;
    memoryStore.settings.currentIssue.theme = issue.theme || '';
    memoryStore.settings.currentIssue.coverUrl = issue.coverUrl || '';
    memoryStore.settings.features.hasActiveIssue = true;

    if (db) {
      try {
        await db.prepare('UPDATE journal_issues SET is_current = 0').run();
      } catch (_) {}
    }
  }
  memoryIssues = [issue, ...memoryIssues.filter((i) => i.id !== issue.id)];

  if (db) {
    try {
      await db.prepare(`
        INSERT INTO journal_issues (id, volume, issue, year, period, theme, cover_url, description, publish_date, is_current)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          volume = excluded.volume,
          issue = excluded.issue,
          year = excluded.year,
          period = excluded.period,
          theme = excluded.theme,
          cover_url = excluded.cover_url,
          description = excluded.description,
          publish_date = excluded.publish_date,
          is_current = excluded.is_current
      `).bind(
        issue.id, issue.volume, issue.issue, issue.year, issue.period,
        issue.theme || '', issue.coverUrl || '', issue.description || '',
        issue.publishDate || '', issue.isCurrent ? 1 : 0
      ).run();

      if (issue.isCurrent) {
        await db.prepare(`
          UPDATE journal_settings SET
            current_volume = ?, current_issue = ?, current_year = ?,
            current_period = ?, current_theme = ?, current_cover_url = ?,
            has_active_issue = 1
          WHERE id = 'default'
        `).bind(
          issue.volume, issue.issue, issue.year, issue.period,
          issue.theme || '', issue.coverUrl || ''
        ).run();
      }
    } catch (e) {
      console.warn('D1 add issue error:', e);
    }
  }
}

export async function deleteDbIssue(id: string, d1?: any): Promise<void> {
  memoryIssues = memoryIssues.filter((i) => i.id !== id);
  const db = d1 || globalD1Instance;
  if (db) {
    try {
      await db.prepare('DELETE FROM journal_issues WHERE id = ?').bind(id).run();
      const remaining: any = await db.prepare('SELECT COUNT(*) as count FROM journal_issues').first();
      if (!remaining || remaining.count === 0) {
        memoryStore.settings.features.hasActiveIssue = false;
        await db.prepare('UPDATE journal_settings SET has_active_issue = 0 WHERE id = "default"').run();
      }
    } catch (e) {
      console.warn('D1 delete issue error:', e);
    }
  }
}

export async function setCurrentDbIssue(id: string, d1?: any): Promise<void> {
  memoryIssues.forEach((i) => (i.isCurrent = (i.id === id)));
  const db = d1 || globalD1Instance;
  if (db) {
    try {
      await db.prepare('UPDATE journal_issues SET is_current = CASE WHEN id = ? THEN 1 ELSE 0 END').bind(id).run();
      const row: any = await db.prepare('SELECT * FROM journal_issues WHERE id = ?').bind(id).first();
      if (row) {
        if (!memoryStore.settings.currentIssue) {
          memoryStore.settings.currentIssue = { volume: 1, issue: 1, year: 2026, period: '', theme: '', coverUrl: '' };
        }
        memoryStore.settings.currentIssue.volume = Number(row.volume);
        memoryStore.settings.currentIssue.issue = Number(row.issue);
        memoryStore.settings.currentIssue.year = Number(row.year);
        memoryStore.settings.currentIssue.period = row.period || '';
        memoryStore.settings.currentIssue.theme = row.theme || '';
        memoryStore.settings.currentIssue.coverUrl = row.cover_url || '';
        memoryStore.settings.features.hasActiveIssue = true;

        await db.prepare(`
          UPDATE journal_settings SET
            current_volume = ?, current_issue = ?, current_year = ?,
            current_period = ?, current_theme = ?, current_cover_url = ?,
            has_active_issue = 1
          WHERE id = 'default'
        `).bind(
          row.volume, row.issue, row.year, row.period,
          row.theme || '', row.cover_url || ''
        ).run();
      }
    } catch (e) {
      console.warn('D1 setCurrent issue error:', e);
    }
  }
}

export async function getDbArticles(d1?: any): Promise<Article[]> {
  const db = d1 || globalD1Instance;
  if (db) {
    try {
      const { results } = await db.prepare('SELECT * FROM articles ORDER BY publish_date DESC').all();
      if (results && Array.isArray(results)) {
        return results.map((r: any) => {
          let authors = [];
          let keywords = [];
          let references = [];
          try { authors = JSON.parse(r.authors_json || '[]'); } catch {}
          try { keywords = JSON.parse(r.keywords_json || '[]'); } catch {}
          try { references = JSON.parse(r.references_json || '[]'); } catch {}
          return {
            slug: r.slug,
            title: r.title,
            authors,
            abstract: r.abstract,
            keywords,
            volume: r.volume,
            issue: r.issue,
            year: r.year,
            pages: r.pages,
            firstPage: r.first_page,
            lastPage: r.last_page,
            publishDate: r.publish_date,
            receivedDate: r.received_date,
            acceptedDate: r.accepted_date,
            doi: r.doi,
            pdfFileName: r.pdf_file_name,
            fileSizeBytes: r.file_size_bytes,
            subject: r.subject,
            references,
          };
        });
      }
    } catch (e) {
      console.warn('D1 query articles error:', e);
    }
  }
  return memoryStore.articles;
}

export async function getDbArticleBySlug(slug: string, d1?: any): Promise<Article | null> {
  const db = d1 || globalD1Instance;
  if (db) {
    try {
      const r = await db.prepare('SELECT * FROM articles WHERE slug = ?').bind(slug).first();
      if (r) {
        let authors = [];
        let keywords = [];
        let references = [];
        try { authors = JSON.parse(r.authors_json || '[]'); } catch {}
        try { keywords = JSON.parse(r.keywords_json || '[]'); } catch {}
        try { references = JSON.parse(r.references_json || '[]'); } catch {}
        return {
          slug: r.slug,
          title: r.title,
          authors,
          abstract: r.abstract,
          keywords,
          volume: r.volume,
          issue: r.issue,
          year: r.year,
          pages: r.pages,
          firstPage: r.first_page,
          lastPage: r.last_page,
          publishDate: r.publish_date,
          receivedDate: r.received_date,
          acceptedDate: r.accepted_date,
          doi: r.doi,
          pdfFileName: r.pdf_file_name,
          fileSizeBytes: r.file_size_bytes,
          subject: r.subject,
          references,
        };
      }
    } catch (e) {
      console.warn('D1 query single article error:', e);
    }
  }
  const articles = await getDbArticles(d1);
  return articles.find((a) => a.slug === slug) || null;
}

export async function addDbArticle(article: Article, d1?: any): Promise<void> {
  memoryStore.articles = [article, ...memoryStore.articles.filter((a) => a.slug !== article.slug)];

  const db = d1 || globalD1Instance;
  if (db) {
    try {
      await db.prepare(`
        INSERT INTO articles (
          id, slug, title, authors_json, abstract, keywords_json,
          volume, issue, year, pages, first_page, last_page,
          publish_date, received_date, accepted_date, doi,
          pdf_file_name, file_size_bytes, subject, references_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(slug) DO UPDATE SET
          title = excluded.title,
          authors_json = excluded.authors_json,
          abstract = excluded.abstract,
          keywords_json = excluded.keywords_json,
          pages = excluded.pages,
          pdf_file_name = excluded.pdf_file_name,
          references_json = excluded.references_json
      `).bind(
        `art-${Date.now()}`,
        article.slug,
        article.title,
        JSON.stringify(article.authors),
        article.abstract,
        JSON.stringify(article.keywords),
        article.volume,
        article.issue,
        article.year,
        article.pages,
        article.firstPage,
        article.lastPage,
        article.publishDate,
        article.receivedDate,
        article.acceptedDate,
        article.doi,
        article.pdfFileName,
        article.fileSizeBytes || 450000,
        article.subject,
        JSON.stringify(article.references || [])
      ).run();
    } catch (e) {
      console.warn('D1 insert article error:', e);
    }
  }
}

export async function deleteDbArticle(slug: string, d1?: any): Promise<void> {
  memoryStore.articles = memoryStore.articles.filter((a) => a.slug !== slug);
  const db = d1 || globalD1Instance;
  if (db) {
    try {
      await db.prepare('DELETE FROM articles WHERE slug = ?').bind(slug).run();
    } catch (e) {
      console.warn('D1 delete article error:', e);
    }
  }
}

export async function getDbEditorial(d1?: any): Promise<{
  editorInChief: { name: string; affiliation: string; email: string };
  editors: Array<{ id: string; name: string; role: string; affiliation: string }>;
  reviewers: Array<{ id: string; name: string; affiliation: string }>;
}> {
  const db = d1 || globalD1Instance;
  if (db) {
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS editorial_members (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT DEFAULT '',
          affiliation TEXT NOT NULL,
          email TEXT DEFAULT '',
          sort_order INTEGER DEFAULT 0
        )
      `).run().catch(() => {});

      const { results } = await db.prepare('SELECT * FROM editorial_members ORDER BY sort_order ASC').all();
      if (results && Array.isArray(results) && results.length > 0) {
        const eic = results.find((m: any) => m.type === 'eic') || memoryStore.editorial.editorInChief;
        const editors = results.filter((m: any) => m.type === 'editor');
        const reviewers = results.filter((m: any) => m.type === 'reviewer');
        const loadedEditorial = {
          editorInChief: { name: eic.name || '', affiliation: eic.affiliation || '', email: eic.email || '' },
          editors: editors.map((e: any) => ({ id: e.id, name: e.name, role: e.role || '', affiliation: e.affiliation })),
          reviewers: reviewers.map((r: any) => ({ id: r.id, name: r.name, affiliation: r.affiliation })),
        };
        memoryStore.editorial = loadedEditorial;
        return loadedEditorial;
      } else {
        // Auto-seed initial editorial members to D1 so it never disappears!
        try {
          const eic = memoryStore.editorial.editorInChief;
          await db.prepare('INSERT OR IGNORE INTO editorial_members (id, type, name, role, affiliation, email, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .bind('eic-1', 'eic', eic.name, 'Editor-in-Chief', eic.affiliation, eic.email, 1).run();

          for (let i = 0; i < memoryStore.editorial.editors.length; i++) {
            const ed = memoryStore.editorial.editors[i];
            await db.prepare('INSERT OR IGNORE INTO editorial_members (id, type, name, role, affiliation, email, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)')
              .bind(ed.id || `ed-${i + 1}`, 'editor', ed.name, ed.role || 'Editor', ed.affiliation, '', i + 2).run();
          }

          for (let i = 0; i < memoryStore.editorial.reviewers.length; i++) {
            const rev = memoryStore.editorial.reviewers[i];
            await db.prepare('INSERT OR IGNORE INTO editorial_members (id, type, name, role, affiliation, email, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)')
              .bind(rev.id || `rev-${i + 1}`, 'reviewer', rev.name, '', rev.affiliation, '', i + 10).run();
          }
        } catch (_) {}
        return memoryStore.editorial;
      }
    } catch (e) {
      console.warn('D1 query editorial fallback:', e);
    }
  }
  return memoryStore.editorial;
}

export async function updateDbEditorInChief(data: { name: string; affiliation: string; email: string }, d1?: any): Promise<void> {
  memoryStore.editorial.editorInChief = { ...data };
  memoryStore.settings.editorial.editorInChief = { ...data };

  const db = d1 || globalD1Instance;
  if (db) {
    try {
      const existing = await db.prepare('SELECT id FROM editorial_members WHERE type = "eic" LIMIT 1').first();
      if (existing) {
        await db.prepare('UPDATE editorial_members SET name = ?, affiliation = ?, email = ? WHERE type = "eic"')
          .bind(data.name, data.affiliation, data.email).run();
      } else {
        await db.prepare('INSERT INTO editorial_members (id, type, name, role, affiliation, email, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind('eic-1', 'eic', data.name, 'Editor-in-Chief', data.affiliation, data.email, 1).run();
      }
    } catch (e) {
      console.warn('D1 update eic error:', e);
    }
  }
}

export async function addDbEditorialMember(member: {
  type: 'editor' | 'reviewer';
  name: string;
  role?: string;
  affiliation: string;
}, d1?: any): Promise<void> {
  const id = `${member.type}-${Date.now()}`;
  const sortOrder = member.type === 'editor' ? 2 : 10;
  if (member.type === 'editor') {
    memoryStore.editorial.editors.push({
      id,
      name: member.name,
      role: member.role || 'Editor',
      affiliation: member.affiliation,
    });
  } else {
    memoryStore.editorial.reviewers.push({
      id,
      name: member.name,
      affiliation: member.affiliation,
    });
  }

  const db = d1 || globalD1Instance;
  if (db) {
    try {
      await db.prepare('INSERT INTO editorial_members (id, type, name, role, affiliation, sort_order) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(id, member.type, member.name, member.role || '', member.affiliation, sortOrder).run();
    } catch (e) {
      console.warn('D1 add member error:', e);
    }
  }
}

export async function deleteDbEditorialMember(id: string, d1?: any): Promise<void> {
  memoryStore.editorial.editors = memoryStore.editorial.editors.filter((e) => e.id !== id);
  memoryStore.editorial.reviewers = memoryStore.editorial.reviewers.filter((r) => r.id !== id);

  const db = d1 || globalD1Instance;
  if (db) {
    try {
      await db.prepare('DELETE FROM editorial_members WHERE id = ?').bind(id).run();
    } catch (e) {
      console.warn('D1 delete member error:', e);
    }
  }
}

export async function getDbIndexing(d1?: any): Promise<IndexingPlatform[]> {
  const db = d1 || globalD1Instance;
  if (db) {
    try {
      const { results } = await db.prepare('SELECT * FROM indexing_platforms ORDER BY sort_order ASC').all();
      if (results && Array.isArray(results)) {
        return results.map((r: any) => ({
          name: r.name,
          category: r.category,
          url: r.url,
          logoText: r.name,
          status: r.status,
          description: r.description,
          showInSidebar: Boolean(r.show_in_sidebar),
          iconUrl: r.icon_url || undefined,
        }));
      }
    } catch (e) {
      console.warn('D1 indexing fallback:', e);
    }
  }
  return memoryStore.indexing;
}

export async function toggleDbIndexingSidebar(name: string, showInSidebar: boolean, d1?: any): Promise<void> {
  await updateDbIndexingPlatform({ name, showInSidebar }, d1);
}

export async function updateDbIndexingPlatform(data: { name: string; url?: string; showInSidebar?: boolean; iconUrl?: string }, d1?: any): Promise<void> {
  const target = memoryStore.indexing.find((i) => i.name === data.name);
  if (target) {
    if (data.url !== undefined) target.url = data.url;
    if (data.showInSidebar !== undefined) target.showInSidebar = data.showInSidebar;
    if (data.iconUrl !== undefined) target.iconUrl = data.iconUrl;
  }

  const db = d1 || globalD1Instance;
  if (db) {
    try {
      if (data.iconUrl !== undefined) {
        await db.prepare('UPDATE indexing_platforms SET icon_url = ? WHERE name = ?')
          .bind(data.iconUrl, data.name).run();
      }
      if (data.url !== undefined && data.showInSidebar !== undefined) {
        await db.prepare('UPDATE indexing_platforms SET url = ?, show_in_sidebar = ? WHERE name = ?')
          .bind(data.url, data.showInSidebar ? 1 : 0, data.name).run();
      } else if (data.url !== undefined) {
        await db.prepare('UPDATE indexing_platforms SET url = ? WHERE name = ?')
          .bind(data.url, data.name).run();
      } else if (data.showInSidebar !== undefined) {
        await db.prepare('UPDATE indexing_platforms SET show_in_sidebar = ? WHERE name = ?')
          .bind(data.showInSidebar ? 1 : 0, data.name).run();
      }
    } catch (e) {
      console.warn('D1 update indexing error:', e);
    }
  }
}

export async function addDbIndexingPlatform(platform: {
  name: string;
  category?: string;
  url: string;
  status?: string;
  description?: string;
  showInSidebar?: boolean;
  iconUrl?: string;
}, d1?: any): Promise<void> {
  const id = `idx-${Date.now()}`;
  const category = platform.category || 'International';
  const status = platform.status || 'Indexed';
  const description = platform.description || `Pangkalan data pengindeks ${platform.name}.`;
  const showInSidebar = platform.showInSidebar !== undefined ? Boolean(platform.showInSidebar) : true;
  const sortOrder = memoryStore.indexing.length + 1;
  const iconUrl = platform.iconUrl || '';

  memoryStore.indexing.push({
    name: platform.name,
    category,
    url: platform.url,
    logoText: platform.name,
    status,
    description,
    showInSidebar,
    iconUrl: iconUrl || undefined,
  });

  const db = d1 || globalD1Instance;
  if (db) {
    try {
      await db.prepare(`
        INSERT OR REPLACE INTO indexing_platforms (id, name, category, url, status, description, show_in_sidebar, sort_order, icon_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, platform.name, category, platform.url, status, description, showInSidebar ? 1 : 0, sortOrder, iconUrl
      ).run();
    } catch (e) {
      console.warn('D1 add indexing platform error:', e);
    }
  }
}

export async function deleteDbIndexingPlatform(name: string, d1?: any): Promise<void> {
  memoryStore.indexing = memoryStore.indexing.filter((i) => i.name !== name);

  const db = d1 || globalD1Instance;
  if (db) {
    try {
      await db.prepare('DELETE FROM indexing_platforms WHERE name = ?').bind(name).run();
    } catch (e) {
      console.warn('D1 delete indexing platform error:', e);
    }
  }
}

export async function getDbAdminUsername(kv?: any): Promise<string> {
  if (kv) {
    try {
      const u = await kv.get('auth:admin_username');
      if (u) return u;
    } catch (_) {}
  }
  return (memoryStore as any).adminUsername || 'admin';
}

export async function setDbAdminUsername(newUsername: string, kv?: any): Promise<void> {
  (memoryStore as any).adminUsername = newUsername;
  if (kv) {
    try {
      await kv.put('auth:admin_username', newUsername);
    } catch (_) {}
  }
}

export async function getDbAdminPin(kv?: any): Promise<string> {
  if (kv) {
    try {
      const pin = await kv.get('auth:admin_pin');
      if (pin) return pin;
    } catch (_) {}
  }
  return (memoryStore as any).adminPin || 'admin123';
}

export async function setDbAdminPin(newPin: string, kv?: any): Promise<void> {
  (memoryStore as any).adminPin = newPin;
  if (kv) {
    try {
      await kv.put('auth:admin_pin', newPin);
    } catch (_) {}
  }
}

// Portal publisher settings

export interface PortalSettings {
  id: string;
  orgName: string;
  orgNameEn: string;
  sloganId: string;
  sloganEn: string;
  description: string;
  domainDisplay: string;
  email: string;
  whatsapp: string;
  address: string;
  logoUrl: string;
  faviconUrl: string;
  callForPapersActive: boolean;
  flagshipJournalName: string;
  flagshipJournalEn: string;
  flagshipJournalUrl: string;
  flagshipJournalEmblemUrl: string;
  missions: string[];
}

export const defaultPortalSettings: PortalSettings = {
  id: 'default',
  orgName: 'Organisasi Riset dan Publikasi Ilmiah Praniti',
  orgNameEn: 'Praniti Institute for Research and Scientific Publication',
  sloganId: 'Menuntun Nalar, Mengabdi pada Kebenaran Ilmiah',
  sloganEn: 'Guiding Knowledge, Fostering Accountability and Human Literacy',
  description: 'Organisasi riset dan penerbitan ilmiah independen yang menjunjung tinggi keterbukaan ilmu (open science), integritas akademik, serta tata kelola publikasi taat asas berbasis telaah sejawat (peer-review) sesuai pedoman etika internasional COPE.',
  domainDisplay: 'ejournal.praniti.or.id',
  email: 'secretariat@praniti.or.id',
  whatsapp: '+62 812-3456-7890',
  address: 'Organisasi Riset dan Publikasi Ilmiah Praniti, Indonesia',
  logoUrl: '/images/logo-praniti.png',
  faviconUrl: '/favicon.png',
  callForPapersActive: true,
  flagshipJournalName: 'JTEBA: Jurnal Terbuka Ekonomi, Bisnis, dan Akuntabilitas',
  flagshipJournalEn: 'Open Journal of Economics, Business, and Accountability',
  flagshipJournalUrl: '/index/JTEBA',
  flagshipJournalEmblemUrl: '/favicon-jteba.png',
  missions: [
    'Menyelenggarakan Publikasi Berkala Berkualitas: Berbasis penelaahan sejawat (peer-review) yang taat asas terhadap standar tata kelola dan pedoman komite etika publikasi internasional (COPE Guidelines).',
    'Menegakkan Keterbukaan Pengetahuan (Open Access): Mendistribusikan karya ilmiah secara bebas tanpa hambatan biaya akses bagi pembaca guna mendorong pemerataan literasi global.',
    'Mengembangkan Kajian Strategis Dwidisiplin: Memfasilitasi riset unggulan pada rumpun Ekonomi & Bisnis berkelanjutan serta rumpun Bahasa & Sastra Inggris.',
    'Mendorong Kolaborasi Lintas Disiplin: Mengintegrasikan kajian retorika korporasi, wacana laporan keberlanjutan, dan komunikasi bisnis internasional.',
    'Meningkatkan Kapasitas Peneliti & Penulis: Menyelenggarakan lokakarya penulisan bereputasi, pelatihan sistem OJS 3, dan penguatan literasi bahasa akademik.'
  ]
};

let memoryPortalSettings: PortalSettings = JSON.parse(JSON.stringify(defaultPortalSettings));

export async function getDbPortalSettings(d1?: any): Promise<PortalSettings> {
  const db = d1 || globalD1Instance;
  if (db) {
    try {
      await ensurePortalSchemaInitialized(db);

      const row = await db.prepare('SELECT * FROM portal_settings WHERE id = "default"').first();
      if (row) {
        let missions = memoryPortalSettings.missions;
        if (row.missions_json) {
          try {
            missions = JSON.parse(row.missions_json);
          } catch (_) {}
        }
        return {
          id: row.id || 'default',
          orgName: row.org_name || memoryPortalSettings.orgName,
          orgNameEn: row.org_name_en || memoryPortalSettings.orgNameEn,
          sloganId: row.slogan_id || memoryPortalSettings.sloganId,
          sloganEn: row.slogan_en || memoryPortalSettings.sloganEn,
          description: row.description || memoryPortalSettings.description,
          domainDisplay: row.domain_display || memoryPortalSettings.domainDisplay,
          email: row.email || memoryPortalSettings.email,
          whatsapp: row.whatsapp || memoryPortalSettings.whatsapp,
          address: row.address || memoryPortalSettings.address,
          logoUrl: row.logo_url || memoryPortalSettings.logoUrl,
          faviconUrl: row.favicon_url || memoryPortalSettings.faviconUrl,
          callForPapersActive: row.call_for_papers_active !== undefined ? Boolean(row.call_for_papers_active) : true,
          flagshipJournalName: row.flagship_journal_name || memoryPortalSettings.flagshipJournalName,
          flagshipJournalEn: row.flagship_journal_en || memoryPortalSettings.flagshipJournalEn,
          flagshipJournalUrl: row.flagship_journal_url || memoryPortalSettings.flagshipJournalUrl,
          flagshipJournalEmblemUrl: row.flagship_journal_emblem_url || memoryPortalSettings.flagshipJournalEmblemUrl || '/favicon-jteba.png',
          missions,
        };
      } else {
        // Inisialisasi baris default ke D1
        await db.prepare(`
          INSERT INTO portal_settings (
            id, org_name, org_name_en, slogan_id, slogan_en, description, domain_display,
            email, whatsapp, address, logo_url, favicon_url, call_for_papers_active,
            flagship_journal_name, flagship_journal_en, flagship_journal_url, flagship_journal_emblem_url, missions_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          defaultPortalSettings.id,
          defaultPortalSettings.orgName,
          defaultPortalSettings.orgNameEn,
          defaultPortalSettings.sloganId,
          defaultPortalSettings.sloganEn,
          defaultPortalSettings.description,
          defaultPortalSettings.domainDisplay,
          defaultPortalSettings.email,
          defaultPortalSettings.whatsapp,
          defaultPortalSettings.address,
          defaultPortalSettings.logoUrl,
          defaultPortalSettings.faviconUrl,
          defaultPortalSettings.callForPapersActive ? 1 : 0,
          defaultPortalSettings.flagshipJournalName,
          defaultPortalSettings.flagshipJournalEn,
          defaultPortalSettings.flagshipJournalUrl,
          defaultPortalSettings.flagshipJournalEmblemUrl,
          JSON.stringify(defaultPortalSettings.missions)
        ).run();
      }
    } catch (e) {
      console.warn('D1 portal_settings query error, falling back to memory:', e);
    }
  }
  return memoryPortalSettings;
}

export async function updateDbPortalSettings(data: Partial<PortalSettings>, d1?: any): Promise<PortalSettings> {
  memoryPortalSettings = {
    ...memoryPortalSettings,
    ...data,
  };

  const db = d1 || globalD1Instance;
  if (db) {
    try {
      const current = await getDbPortalSettings(db);
      const merged: PortalSettings = {
        ...current,
        ...data,
      };

      await db.prepare(`
        INSERT OR REPLACE INTO portal_settings (
          id, org_name, org_name_en, slogan_id, slogan_en, description, domain_display,
          email, whatsapp, address, logo_url, favicon_url, call_for_papers_active,
          flagship_journal_name, flagship_journal_en, flagship_journal_url, flagship_journal_emblem_url, missions_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        'default',
        merged.orgName,
        merged.orgNameEn,
        merged.sloganId,
        merged.sloganEn,
        merged.description,
        merged.domainDisplay,
        merged.email,
        merged.whatsapp,
        merged.address,
        merged.logoUrl,
        merged.faviconUrl,
        merged.callForPapersActive ? 1 : 0,
        merged.flagshipJournalName,
        merged.flagshipJournalEn,
        merged.flagshipJournalUrl,
        merged.flagshipJournalEmblemUrl || '/favicon-jteba.png',
        JSON.stringify(merged.missions)
      ).run();

      return merged;
    } catch (e) {
      console.warn('D1 updateDbPortalSettings error:', e);
    }
  }

  return memoryPortalSettings;
}

export async function getDbPortalAdminCredentials(kv?: any): Promise<{ username: string; pin: string }> {
  let username = 'admin';
  let pin = 'admin123';
  if (kv) {
    try {
      const u = await kv.get('auth:portal_admin_username');
      const p = await kv.get('auth:portal_admin_pin');
      if (u) username = u;
      if (p) pin = p;
    } catch (_) {}
  } else {
    if ((memoryStore as any).portalAdminUsername) username = (memoryStore as any).portalAdminUsername;
    if ((memoryStore as any).portalAdminPin) pin = (memoryStore as any).portalAdminPin;
  }
  return { username, pin };
}

export async function setDbPortalAdminCredentials(username: string, pin: string, kv?: any): Promise<void> {
  (memoryStore as any).portalAdminUsername = username;
  (memoryStore as any).portalAdminPin = pin;
  if (kv) {
    try {
      await kv.put('auth:portal_admin_username', username);
      await kv.put('auth:portal_admin_pin', pin);
    } catch (_) {}
  }
}



let memorySubmissions: JournalSubmission[] = [];

export async function createDbSubmission(
  submission: Omit<JournalSubmission, 'id' | 'regNumber' | 'createdAt'>,
  d1?: any
): Promise<JournalSubmission> {
  const db = d1 || globalD1Instance;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const periodKey = `${year}${month}`;

  let nextSeq = 1;

  if (db) {
    await ensureDbSchemaInitialized(db);
    try {
      const countRes: any = await db.prepare(
        "SELECT COUNT(*) as cnt FROM journal_submissions WHERE reg_number LIKE ?"
      ).bind(`JTEBA-SUB-${periodKey}-%`).first();
      if (countRes && typeof countRes.cnt === 'number') {
        nextSeq = countRes.cnt + 1;
      }
    } catch (_) {}
  } else {
    const memoryCount = memorySubmissions.filter(s => s.regNumber.startsWith(`JTEBA-SUB-${periodKey}-`)).length;
    nextSeq = memoryCount + 1;
  }

  const seqFormatted = String(nextSeq).padStart(4, '0');
  const regNumber = `JTEBA-SUB-${periodKey}-${seqFormatted}`;
  const createdAt = now.toISOString();

  const newEntry: JournalSubmission = {
    ...submission,
    regNumber,
    status: 'submitted',
    createdAt,
  };

  if (db) {
    try {
      const res = await db.prepare(`
        INSERT INTO journal_submissions (
          reg_number, first_name, last_name, email, phone, affiliation,
          city, country, scope_cluster, title, abstract,
          file_name, file_size, supplementary_file_name, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        regNumber,
        submission.firstName,
        submission.lastName,
        submission.email,
        submission.phone,
        submission.affiliation,
        submission.city || '',
        submission.country || 'Indonesia',
        submission.scopeCluster,
        submission.title,
        submission.abstract,
        submission.fileName,
        submission.fileSize || 0,
        submission.supplementaryFileName || '',
        'submitted',
        createdAt
      ).run();

      newEntry.id = res?.meta?.last_row_id || nextSeq;
    } catch (e) {
      console.error('Failed to insert submission into D1:', e);
    }
  } else {
    newEntry.id = memorySubmissions.length + 1;
    memorySubmissions.unshift(newEntry);
  }

  return newEntry;
}

export async function getDbSubmissions(d1?: any): Promise<JournalSubmission[]> {
  const db = d1 || globalD1Instance;
  if (db) {
    await ensureDbSchemaInitialized(db);
    try {
      const { results } = await db.prepare(
        "SELECT * FROM journal_submissions ORDER BY id DESC"
      ).all();
      if (results && Array.isArray(results)) {
        return results.map((r: any) => ({
          id: r.id,
          regNumber: r.reg_number,
          firstName: r.first_name,
          lastName: r.last_name,
          email: r.email,
          phone: r.phone,
          affiliation: r.affiliation,
          city: r.city,
          country: r.country,
          scopeCluster: r.scope_cluster,
          title: r.title,
          abstract: r.abstract,
          fileName: r.file_name,
          fileSize: r.file_size,
          supplementaryFileName: r.supplementary_file_name,
          status: r.status,
          createdAt: r.created_at,
        }));
      }
    } catch (e) {
      console.warn('Failed to fetch submissions from D1:', e);
    }
  }
  return memorySubmissions;
}

export async function getDbSubmissionByRegNumber(regNumber: string, d1?: any): Promise<JournalSubmission | null> {
  const db = d1 || globalD1Instance;
  if (db) {
    await ensureDbSchemaInitialized(db);
    try {
      const r: any = await db.prepare(
        "SELECT * FROM journal_submissions WHERE reg_number = ?"
      ).bind(regNumber).first();
      if (r) {
        return {
          id: r.id,
          regNumber: r.reg_number,
          firstName: r.first_name,
          lastName: r.last_name,
          email: r.email,
          phone: r.phone,
          affiliation: r.affiliation,
          city: r.city,
          country: r.country,
          scopeCluster: r.scope_cluster,
          title: r.title,
          abstract: r.abstract,
          fileName: r.file_name,
          fileSize: r.file_size,
          supplementaryFileName: r.supplementary_file_name,
          status: r.status,
          createdAt: r.created_at,
        };
      }
    } catch (_) {}
  }
  return memorySubmissions.find(s => s.regNumber === regNumber) || null;
}

export async function updateDbSubmissionStatus(regNumber: string, status: string, d1?: any): Promise<boolean> {
  const db = d1 || globalD1Instance;
  if (db) {
    await ensureDbSchemaInitialized(db);
    try {
      await db.prepare("UPDATE journal_submissions SET status = ? WHERE reg_number = ?").bind(status, regNumber).run();
      return true;
    } catch (_) {}
  }
  const entry = memorySubmissions.find(s => s.regNumber === regNumber);
  if (entry) {
    entry.status = status as any;
    return true;
  }
  return false;
}

export async function deleteDbSubmission(regNumber: string, d1?: any): Promise<boolean> {
  const db = d1 || globalD1Instance;
  if (db) {
    await ensureDbSchemaInitialized(db);
    try {
      await db.prepare("DELETE FROM journal_submissions WHERE reg_number = ?").bind(regNumber).run();
      return true;
    } catch (_) {}
  }
  const idx = memorySubmissions.findIndex(s => s.regNumber === regNumber);
  if (idx !== -1) {
    memorySubmissions.splice(idx, 1);
    return true;
  }
  return false;
}
