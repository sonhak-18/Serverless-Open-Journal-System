import { journalConfig, type JournalConfig, type IndexingPlatform } from '../config/journal';
import { articles as initialArticles, type Article } from '../data/articles';

export interface SektansiaDatabase {
  settings: JournalConfig;
  articles: Article[];
  editorial: {
    editorInChief: { name: string; affiliation: string; email: string };
    editors: Array<{ id: string; name: string; role: string; affiliation: string }>;
    reviewers: Array<{ id: string; name: string; affiliation: string }>;
  };
  indexing: IndexingPlatform[];
}

// Global reference for D1 passed via middleware
let globalD1Instance: any = null;

export function setGlobalD1(d1: any) {
  if (d1) globalD1Instance = d1;
}

export function getGlobalD1(): any {
  return globalD1Instance;
}

// Global in-memory cache for local dev / fallback
let memoryStore: SektansiaDatabase = {
  settings: JSON.parse(JSON.stringify(journalConfig)),
  articles: JSON.parse(JSON.stringify(initialArticles)),
  editorial: {
    editorInChief: { ...journalConfig.editorial.editorInChief },
    editors: journalConfig.editorial.editors.map((e, idx) => ({ id: `ed-${idx + 1}`, ...e })),
    reviewers: journalConfig.editorial.reviewers.map((r, idx) => ({ id: `rev-${idx + 1}`, ...r })),
  },
  indexing: JSON.parse(JSON.stringify(journalConfig.indexing)),
};

// ==========================================
// PUBLIC REPOSITORY METHODS (D1 & LOCAL READY)
// ==========================================

export async function getDbSettings(d1?: any): Promise<JournalConfig> {
  const db = d1 || globalD1Instance;
  if (db) {
    try {
      const row = await db.prepare('SELECT * FROM journal_settings WHERE id = "default"').first();
      if (row) {
        return {
          ...memoryStore.settings,
          name: row.name || memoryStore.settings.name,
          nameEn: row.name_en || memoryStore.settings.nameEn,
          shortName: row.short_name || memoryStore.settings.shortName,
          accreditedText: row.accredited_text || memoryStore.settings.accreditedText,
          institution: row.institution || memoryStore.settings.institution,
          publisher: row.publisher || memoryStore.settings.publisher,
          address: row.address || memoryStore.settings.address,
          eIssn: row.e_issn || memoryStore.settings.eIssn,
          pIssn: row.p_issn || memoryStore.settings.pIssn,
          doiPrefix: (row.doi_prefix && !row.doi_prefix.includes('zenodo') && row.doi_prefix.startsWith('10.')) ? row.doi_prefix : '10.00000',
          publicationFrequency: row.publication_frequency || memoryStore.settings.publicationFrequency,
          license: row.license || memoryStore.settings.license,
          licenseUrl: row.license_url || memoryStore.settings.licenseUrl,
          features: {
            showIndexingBlock: row.show_indexing_block !== undefined ? Boolean(row.show_indexing_block) : memoryStore.settings.features.showIndexingBlock,
            showToolsBlock: row.show_tools_block !== undefined ? Boolean(row.show_tools_block) : memoryStore.settings.features.showToolsBlock,
            showIssnBlock: row.show_issn_block !== undefined ? Boolean(row.show_issn_block) : memoryStore.settings.features.showIssnBlock,
          },
          submission: {
            ...memoryStore.settings.submission,
            email: row.email || memoryStore.settings.submission.email,
            whatsappNumber: row.whatsapp_number || memoryStore.settings.submission.whatsappNumber,
            whatsappDisplay: row.whatsapp_display || memoryStore.settings.submission.whatsappDisplay,
            whatsappDefaultMessage: row.whatsapp_message || memoryStore.settings.submission.whatsappDefaultMessage,
            turnitinMaxSimilarity: row.turnitin_max_similarity !== undefined ? Number(row.turnitin_max_similarity) : memoryStore.settings.submission.turnitinMaxSimilarity,
            reviewTimeEstimate: row.review_time_estimate || memoryStore.settings.submission.reviewTimeEstimate,
          },
          storage: {
            ...memoryStore.settings.storage,
            gdriveIndexBaseUrl: row.gdrive_base_url || memoryStore.settings.storage.gdriveIndexBaseUrl,
            pdfDirectoryPath: row.pdf_directory_path || memoryStore.settings.storage.pdfDirectoryPath,
          },
          announcement: {
            title: row.announcement_title || 'Call for Papers: Volume 1 Nomor 1 (2026)',
            content: row.announcement_content || 'Redaksi JTAAP mengundang akademisi, peneliti, dan praktisi untuk mengirimkan naskah orisinal.',
            active: row.announcement_active !== undefined ? Boolean(row.announcement_active) : true,
            date: row.announcement_date || '2026-03-01',
          },
          currentIssue: {
            volume: row.current_volume !== undefined ? Number(row.current_volume) : 1,
            issue: row.current_issue !== undefined ? Number(row.current_issue) : 1,
            year: row.current_year !== undefined ? Number(row.current_year) : 2026,
            period: row.current_period || 'Maret 2026',
            theme: row.current_theme || 'Edisi Perdana: Inovasi Audit, Akuntansi Keberlanjutan & Modernisasi Sistem Perpajakan',
            coverUrl: row.current_cover_url || '',
          },
        };
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
  if (data.eIssn !== undefined) s.eIssn = data.eIssn;
  if (data.pIssn !== undefined) s.pIssn = data.pIssn;
  if (data.showIndexingBlock !== undefined) s.features.showIndexingBlock = Boolean(data.showIndexingBlock);
  if (data.showToolsBlock !== undefined) s.features.showToolsBlock = Boolean(data.showToolsBlock);
  if (data.showIssnBlock !== undefined) s.features.showIssnBlock = Boolean(data.showIssnBlock);
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

  const db = d1 || globalD1Instance;
  if (db) {
    try {
      const res = await db.prepare(`
        UPDATE journal_settings SET
          name = ?, name_en = ?, short_name = ?, accredited_text = ?,
          institution = ?, publisher = ?, address = ?, doi_prefix = ?,
          publication_frequency = ?, license = ?, license_url = ?,
          turnitin_max_similarity = ?, review_time_estimate = ?,
          email = ?, whatsapp_number = ?, whatsapp_display = ?, whatsapp_message = ?,
          e_issn = ?, p_issn = ?, show_indexing_block = ?, show_tools_block = ?,
          show_issn_block = ?, gdrive_base_url = ?, pdf_directory_path = ?,
          announcement_title = ?, announcement_content = ?, announcement_active = ?,
          announcement_date = ?, current_volume = ?, current_issue = ?,
          current_year = ?, current_period = ?, current_theme = ?, current_cover_url = ?
        WHERE id = 'default'
      `).bind(
        s.name, s.nameEn, s.shortName, s.accreditedText,
        s.institution, s.publisher, s.address, s.doiPrefix,
        s.publicationFrequency, s.license, s.licenseUrl,
        s.submission.turnitinMaxSimilarity, s.submission.reviewTimeEstimate,
        s.submission.email, s.submission.whatsappNumber, s.submission.whatsappDisplay,
        s.submission.whatsappDefaultMessage, s.eIssn, s.pIssn,
        s.features.showIndexingBlock ? 1 : 0,
        s.features.showToolsBlock ? 1 : 0,
        s.features.showIssnBlock ? 1 : 0,
        s.storage.gdriveIndexBaseUrl, s.storage.pdfDirectoryPath,
        s.announcement?.title || '', s.announcement?.content || '',
        s.announcement?.active ? 1 : 0, s.announcement?.date || '',
        s.currentIssue?.volume || 1, s.currentIssue?.issue || 1,
        s.currentIssue?.year || 2026, s.currentIssue?.period || '',
        s.currentIssue?.theme || '', s.currentIssue?.coverUrl || ''
      ).run();

      if (!res?.meta?.changes) {
        await db.prepare(`
          INSERT OR REPLACE INTO journal_settings (
            id, name, name_en, short_name, accredited_text, publisher, institution,
            address, e_issn, p_issn, doi_prefix, publication_frequency, license,
            license_url, show_indexing_block, show_tools_block, show_issn_block,
            email, whatsapp_number, whatsapp_display, whatsapp_message,
            turnitin_max_similarity, review_time_estimate, gdrive_base_url, pdf_directory_path,
            announcement_title, announcement_content, announcement_active, announcement_date,
            current_volume, current_issue, current_year, current_period, current_theme, current_cover_url
          ) VALUES (
            'default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
        `).bind(
          s.name, s.nameEn, s.shortName, s.accreditedText, s.publisher, s.institution,
          s.address, s.eIssn, s.pIssn, s.doiPrefix, s.publicationFrequency, s.license,
          s.licenseUrl, s.features.showIndexingBlock ? 1 : 0, s.features.showToolsBlock ? 1 : 0,
          s.features.showIssnBlock ? 1 : 0, s.submission.email, s.submission.whatsappNumber,
          s.submission.whatsappDisplay, s.submission.whatsappDefaultMessage, s.submission.turnitinMaxSimilarity,
          s.submission.reviewTimeEstimate, s.storage.gdriveIndexBaseUrl, s.storage.pdfDirectoryPath,
          s.announcement?.title || '', s.announcement?.content || '',
          s.announcement?.active ? 1 : 0, s.announcement?.date || '',
          s.currentIssue?.volume || 1, s.currentIssue?.issue || 1,
          s.currentIssue?.year || 2026, s.currentIssue?.period || '',
          s.currentIssue?.theme || '', s.currentIssue?.coverUrl || ''
        ).run();
      }
    } catch (e) {
      console.warn('D1 update settings error:', e);
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
          try { authors = JSON.parse(r.authors_json || '[]'); } catch {}
          try { keywords = JSON.parse(r.keywords_json || '[]'); } catch {}
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
        try { authors = JSON.parse(r.authors_json || '[]'); } catch {}
        try { keywords = JSON.parse(r.keywords_json || '[]'); } catch {}
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
          pdf_file_name, file_size_bytes, subject
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(slug) DO UPDATE SET
          title = excluded.title,
          authors_json = excluded.authors_json,
          abstract = excluded.abstract,
          keywords_json = excluded.keywords_json,
          pages = excluded.pages,
          pdf_file_name = excluded.pdf_file_name
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
        article.subject
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
      const { results } = await db.prepare('SELECT * FROM editorial_members ORDER BY sort_order ASC').all();
      if (results && Array.isArray(results) && results.length > 0) {
        const eic = results.find((m: any) => m.type === 'eic') || memoryStore.editorial.editorInChief;
        const editors = results.filter((m: any) => m.type === 'editor');
        const reviewers = results.filter((m: any) => m.type === 'reviewer');
        return {
          editorInChief: { name: eic.name, affiliation: eic.affiliation, email: eic.email },
          editors: editors.map((e: any) => ({ id: e.id, name: e.name, role: e.role, affiliation: e.affiliation })),
          reviewers: reviewers.map((r: any) => ({ id: r.id, name: r.name, affiliation: r.affiliation })),
        };
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
      await db.prepare('UPDATE editorial_members SET name = ?, affiliation = ?, email = ? WHERE type = "eic"')
        .bind(data.name, data.affiliation, data.email).run();
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
      await db.prepare('INSERT INTO editorial_members (id, type, name, role, affiliation) VALUES (?, ?, ?, ?, ?)')
        .bind(id, member.type, member.name, member.role || '', member.affiliation).run();
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
      if (results && Array.isArray(results) && results.length > 0) {
        return results.map((r: any) => ({
          name: r.name,
          category: r.category,
          url: r.url,
          logoText: r.name,
          status: r.status,
          description: r.description,
          showInSidebar: Boolean(r.show_in_sidebar),
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

export async function updateDbIndexingPlatform(data: { name: string; url?: string; showInSidebar?: boolean }, d1?: any): Promise<void> {
  const target = memoryStore.indexing.find((i) => i.name === data.name);
  if (target) {
    if (data.url !== undefined) target.url = data.url;
    if (data.showInSidebar !== undefined) target.showInSidebar = data.showInSidebar;
  }

  const db = d1 || globalD1Instance;
  if (db) {
    try {
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
