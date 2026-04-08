import gdprRightsData from "./gdpr.json";
import ccpaData from "./ccpa.json";
import chapter1 from "./gdpr/chapter1.json";
import chapter2 from "./gdpr/Chapter2.json";
import chapter3 from "./gdpr/chapter3.json";
import chapter4 from "./gdpr/chapter4.json";
import chapter5 from "./gdpr/chapter5.json";
import chapter6 from "./gdpr/chapter6.json";
import chapter7 from "./gdpr/chapter7.json";
import chapter8 from "./gdpr/chapter8.json";
import chapter9 from "./gdpr/chapter9.json";
import chapter10 from "./gdpr/chapter10.json";
import chapter11 from "./gdpr/chapter11.json";
import type { CorpusEntry, GdprArticle, Jurisdiction } from "../types";

export const GDPR_VERSION = "GDPR 2016/679";
export const CCPA_VERSION = "CCPA as amended by CPRA 2023";

// 11-rights shortlist (used for right-keyed lookups)
export const gdpr: CorpusEntry[] = gdprRightsData as CorpusEntry[];
export const ccpa: CorpusEntry[] = ccpaData as CorpusEntry[];

// All GDPR chapters
const allChapters = [
  chapter1, chapter2, chapter3, chapter4, chapter5, chapter6,
  chapter7, chapter8, chapter9, chapter10, chapter11,
];

// Flat article lookup: articleNumber → GdprArticle
const gdprArticleMap = new Map<number, GdprArticle>();

for (const chapterFile of allChapters) {
  const ch = chapterFile.chapter as any;
  const articles = ch.articles
    ?? (ch.sections as any[])?.flatMap((s: any) => s.articles ?? [])
    ?? [];
  for (const article of articles) {
    gdprArticleMap.set(article.article_number, {
      articleNumber: article.article_number,
      title: article.title,
      content: article.content as string[] | Record<string, string>,
      chapterNumber: ch.chapter_number,
      chapterTitle: ch.title,
    });
  }
}

export function getGdprArticle(articleNumber: number): GdprArticle | undefined {
  return gdprArticleMap.get(articleNumber);
}

export function getGdprArticles(articleNumbers: number[]): GdprArticle[] {
  return articleNumbers.flatMap((n) => {
    const a = gdprArticleMap.get(n);
    return a ? [a] : [];
  });
}

export function getCorpus(jurisdiction: Jurisdiction): CorpusEntry[] {
  switch (jurisdiction) {
    case "GDPR": return gdpr;
    case "CCPA": return ccpa;
    default: throw new Error(`Unknown jurisdiction: ${jurisdiction}`);
  }
}
