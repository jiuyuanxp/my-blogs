import type { Article } from '@/types';

const MAX_DESC = 160;

/** 用于 meta description：优先 summary，否则从 Markdown 正文抽一段纯文本 */
export function articleMetaDescription(article: Pick<Article, 'summary' | 'content'>): string {
  const summary = article.summary?.trim();
  if (summary) {
    return summary.length > MAX_DESC ? `${summary.slice(0, MAX_DESC - 1)}…` : summary;
  }
  const plain = article.content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`~[\]|\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= MAX_DESC) return plain;
  return `${plain.slice(0, MAX_DESC - 1)}…`;
}
