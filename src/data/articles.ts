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

export const articles: Article[] = [];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticlesByIssue(volume: number, issue: number): Article[] {
  return articles.filter((a) => a.volume === volume && a.issue === issue);
}

export function getCurrentIssue(): Issue {
  return issues.find((i) => i.isCurrent) || issues[0];
}
