import type { Article } from "../types/article";

const ARTICLES_KEY = "pvweb:articles:v1";
const ARTICLE_DRAFT_KEY = "pvweb:article-draft:v1";

export interface ArticleDraft {
  title: string;
  activity: string;
  round: string;
  content: string;
  tags: string[];
  feedbackOption: Article["feedbackOption"];
  selectedMember: string;
}

export function getArticles(): Article[] {
  try {
    const raw = localStorage.getItem(ARTICLES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Article[]) : [];
  } catch {
    return [];
  }
}

export function saveArticles(articles: Article[]): void {
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
}

export function saveArticle(article: Article): void {
  const articles = getArticles();
  const next = [article, ...articles.filter((item) => item.id !== article.id)];
  saveArticles(next);
}

export function getArticleDraft(): ArticleDraft | null {
  try {
    const raw = localStorage.getItem(ARTICLE_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as ArticleDraft) : null;
  } catch {
    return null;
  }
}

export function saveArticleDraft(draft: ArticleDraft): void {
  localStorage.setItem(ARTICLE_DRAFT_KEY, JSON.stringify(draft));
}

export function clearArticleDraft(): void {
  localStorage.removeItem(ARTICLE_DRAFT_KEY);
}
