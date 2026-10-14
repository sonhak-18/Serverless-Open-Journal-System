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

// Global in-memory cache for local dev / edge memory
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
  if (d1) {
    try {
      const row = await d1.prepare('SELECT * FROM journal_settings WHERE id = "default"').first();
      if (row) {
        return {
          ...memoryStore.settings,
          name: row.name,
          nameEn: row.name_en,
          shortName: row.short_name,
          institution: row.institution,
          publisher: row.publisher,
          address: row.address,
          eIssn: row.e_issn,
          pIssn: row.p_issn,
          features: {
            showIndexingBlock: Boolean(row.show_indexing_block),
            showToolsBlock: Boolean(row.show_tools_block),
            showIssnBlock: Boolean(row.show_issn_block),
          },
          submission: {
            ...memoryStore.settings.submission,
            email: row.email,
            whatsappNumber: row.whatsapp_number,
            whatsappDisplay: row.whatsapp_display,
            whatsappDefaultMessage: row.whatsapp_message,
          },
          storage: {
            ...memoryStore.settings.storage,
            gdriveIndexBaseUrl: row.gdrive_base_url,
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
  institution?: string;
  publisher?: string;
  address?: string;
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
}, d1?: any): Promise<void> {
  const s = memoryStore.settings;

  if (data.institution !== undefined) s.institution = data.institution;
  if (data.publisher !== undefined) s.publisher = data.publisher;
  if (data.address !== undefined) s.address = data.address;
  if (data.email !== undefined) s.submission.email = data.email;
  if (data.whatsappNumber !== undefined) s.submission.whatsappNumber = data.whatsappNumber;
  if (data.whatsappDisplay !== undefined) s.submission.whatsappDisplay = data.whatsappDisplay;
  if (data.whatsappMessage !== undefined) s.submission.whatsappDefaultMessage = data.whatsappMessage;
  if (data.eIssn !== undefined) s.eIssn = data.eIssn;
  if (data.pIssn !== undefined) s.pIssn = data.pIssn;
  if (data.showIndexingBlock !== undefined) s.features.showIndexingBlock = Boolean(data.showIndexingBlock);
  if (data.showToolsBlock !== undefined) s.features.showToolsBlock = Boolean(data.showToolsBlock);
  if (data.showIssnBlock !== undefined) s.features.showIssnBlock = Boolean(data.showIssnBlock);
  if (data.gdriveBaseUrl !== undefined) s.storage.gdriveIndexBaseUrl = data.gdriveBaseUrl;

  if (d1) {
    try {
      await d1.prepare(`
        INSERT INTO journal_settings (
          id, institution, publisher, address, email, whatsapp_number,
          whatsapp_display, whatsapp_message, e_issn, p_issn,
          show_indexing_block, show_tools_block, show_issn_block, gdrive_base_url
        ) VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          institution = excluded.institution,
          publisher = excluded.publisher,
          address = excluded.address,
          email = excluded.email,
          whatsapp_number = excluded.whatsapp_number,
          whatsapp_display = excluded.whatsapp_display,
          whatsapp_message = excluded.whatsapp_message,
          e_issn = excluded.e_issn,
          p_issn = excluded.p_issn,
          show_indexing_block = excluded.show_indexing_block,
          show_tools_block = excluded.show_tools_block,
          show_issn_block = excluded.show_issn_block,
          gdrive_base_url = excluded.gdrive_base_url
      `).bind(
        s.institution, s.publisher, s.address, s.submission.email,
        s.submission.whatsappNumber, s.submission.whatsappDisplay,
        s.submission.whatsappDefaultMessage, s.eIssn, s.pIssn,
        s.features.showIndexingBlock ? 1 : 0,
        s.features.showToolsBlock ? 1 : 0,
        s.features.showIssnBlock ? 1 : 0,
        s.storage.gdriveIndexBaseUrl
      ).run();
    } catch (e) {
      console.warn('D1 update error:', e);
    }
  }
}

export async function getDbArticles(d1?: any): Promise<Article[]> {
  if (d1) {
    try {
      const { results } = await d1.prepare('SELECT * FROM articles ORDER BY publish_date DESC').all();
      if (results && results.length > 0) {
        return results.map((r: any) => ({
          slug: r.slug,
          title: r.title,
          authors: JSON.parse(r.authors_json),
          abstract: r.abstract,
          keywords: JSON.parse(r.keywords_json),
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
        }));
      }
    } catch (e) {
      console.warn('D1 query fallback:', e);
    }
  }
  return memoryStore.articles;
}

export async function getDbArticleBySlug(slug: string, d1?: any): Promise<Article | null> {
  const articles = await getDbArticles(d1);
  return articles.find((a) => a.slug === slug) || null;
}

export async function addDbArticle(article: Article, d1?: any): Promise<void> {
  memoryStore.articles = [article, ...memoryStore.articles.filter((a) => a.slug !== article.slug)];

  if (d1) {
    try {
      await d1.prepare(`
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
  if (d1) {
    try {
      await d1.prepare('DELETE FROM articles WHERE slug = ?').bind(slug).run();
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
  if (d1) {
    try {
      const { results } = await d1.prepare('SELECT * FROM editorial_members ORDER BY sort_order ASC').all();
      if (results && results.length > 0) {
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

  if (d1) {
    try {
      await d1.prepare('UPDATE editorial_members SET name = ?, affiliation = ?, email = ? WHERE type = "eic"')
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

  if (d1) {
    try {
      await d1.prepare('INSERT INTO editorial_members (id, type, name, role, affiliation) VALUES (?, ?, ?, ?, ?)')
        .bind(id, member.type, member.name, member.role || '', member.affiliation).run();
    } catch (e) {
      console.warn('D1 add member error:', e);
    }
  }
}

export async function deleteDbEditorialMember(id: string, d1?: any): Promise<void> {
  memoryStore.editorial.editors = memoryStore.editorial.editors.filter((e) => e.id !== id);
  memoryStore.editorial.reviewers = memoryStore.editorial.reviewers.filter((r) => r.id !== id);

  if (d1) {
    try {
      await d1.prepare('DELETE FROM editorial_members WHERE id = ?').bind(id).run();
    } catch (e) {
      console.warn('D1 delete member error:', e);
    }
  }
}

export async function getDbIndexing(d1?: any): Promise<IndexingPlatform[]> {
  if (d1) {
    try {
      const { results } = await d1.prepare('SELECT * FROM indexing_platforms ORDER BY sort_order ASC').all();
      if (results && results.length > 0) {
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
  const target = memoryStore.indexing.find((i) => i.name === name);
  if (target) {
    target.showInSidebar = showInSidebar;
  }

  if (d1) {
    try {
      await d1.prepare('UPDATE indexing_platforms SET show_in_sidebar = ? WHERE name = ?')
        .bind(showInSidebar ? 1 : 0, name).run();
    } catch (e) {
      console.warn('D1 toggle indexing error:', e);
    }
  }
}
