import { useState, useEffect, useMemo } from 'react';
import type { Article, Category } from '@blog/types';
import {
  fetchArticles,
  fetchCategories,
  createArticle,
  updateArticle,
  deleteArticle,
} from '@/lib/api';
import { apiErrorMessage } from '@/lib/errorMessage';
import { flattenCategories } from '@/lib/categoryFlat';
import { buildCategoryFilterPathOptions, filterArticlesByCategory } from '../categoryUtils';

const ARTICLES_FILTER_STORAGE_KEY = 'blog-admin-articles-filter';

function readStoredArticleFilter(): { filterCategoryId: string | 'all' } | null {
  try {
    const raw = sessionStorage.getItem(ARTICLES_FILTER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed.filterCategoryId === 'all' || typeof parsed.filterCategoryId === 'string') {
      return { filterCategoryId: parsed.filterCategoryId };
    }
    const activeTabId =
      parsed.activeTabId === 'all' || typeof parsed.activeTabId === 'string'
        ? parsed.activeTabId
        : null;
    const selectedSubCatId =
      parsed.selectedSubCatId === 'all' || typeof parsed.selectedSubCatId === 'string'
        ? parsed.selectedSubCatId
        : null;
    if (activeTabId === null || selectedSubCatId === null) return null;
    if (selectedSubCatId !== 'all') return { filterCategoryId: selectedSubCatId };
    if (activeTabId !== 'all') return { filterCategoryId: activeTabId };
    return { filterCategoryId: 'all' };
  } catch {
    return null;
  }
}

export type ArticlesLoadMode = 'full' | 'silent';

export function useArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<string | 'all'>(() => {
    return readStoredArticleFilter()?.filterCategoryId ?? 'all';
  });
  const [isEditing, setIsEditing] = useState<Article | Partial<Article> | null>(null);
  const [isImmersive, setIsImmersive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const flatCats = useMemo(() => flattenCategories(categories), [categories]);
  const categoryFilterOptions = useMemo(
    () => buildCategoryFilterPathOptions(categories),
    [categories]
  );

  const filteredArticles = useMemo(
    () => filterArticlesByCategory(articles, flatCats, filterCategoryId),
    [articles, flatCats, filterCategoryId]
  );

  const load = async (mode: ArticlesLoadMode = 'full') => {
    if (mode === 'full') setLoading(true);
    setError(null);
    try {
      const [artsRes, cats] = await Promise.all([fetchArticles({ all: true }), fetchCategories()]);
      setArticles(artsRes.data);
      setCategories(cats);
    } catch (err) {
      setError(apiErrorMessage(err, '加载失败，请刷新页面或稍后重试。'));
    } finally {
      if (mode === 'full') setLoading(false);
    }
  };

  useEffect(() => {
    void load('full');
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(ARTICLES_FILTER_STORAGE_KEY, JSON.stringify({ filterCategoryId }));
    } catch {
      /* ignore quota / private mode */
    }
  }, [filterCategoryId]);

  const flatIds = useMemo(() => new Set(flatCats.map((c) => c.id)), [flatCats]);

  useEffect(() => {
    if (categories.length === 0) return;
    if (filterCategoryId !== 'all' && !flatIds.has(filterCategoryId)) {
      setFilterCategoryId('all');
    }
  }, [categories.length, flatIds, filterCategoryId]);

  useEffect(() => {
    if (!isEditing) setIsImmersive(false);
  }, [isEditing]);

  useEffect(() => {
    if (!isImmersive) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsImmersive(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isImmersive]);

  const handleSaveArticle = async () => {
    if (!isEditing || saving) return;
    const title = isEditing.title?.trim();
    const content = isEditing.content?.trim();
    const categoryId = isEditing.categoryId;
    if (!title || !content || !categoryId) {
      setError('请填写标题、分类和正文后再保存。');
      queueMicrotask(() => {
        const id = isImmersive ? 'article-title-immersive' : 'article-title';
        document.getElementById(id)?.focus();
      });
      return;
    }
    setError(null);
    setSaving(true);
    try {
      if (isEditing.id) {
        await updateArticle(isEditing.id, {
          title,
          summary: isEditing.summary ?? '',
          content,
          categoryId,
          status: isEditing.status ?? 'draft',
          isPinned: isEditing.isPinned ?? 0,
        });
      } else {
        await createArticle({
          title,
          summary: isEditing.summary ?? '',
          content,
          categoryId,
          status: isEditing.status ?? 'draft',
          isPinned: isEditing.isPinned ?? 0,
        });
      }
      await load('silent');
      setIsEditing(null);
    } catch (err) {
      setError(apiErrorMessage(err, '保存失败，请检查网络后重试。'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticle = async (article: Article) => {
    if (!window.confirm(`确定要删除《${article.title}》吗？`)) return;
    setError(null);
    setDeletingId(article.id);
    try {
      await deleteArticle(article.id);
      await load('silent');
    } catch (err) {
      setError(apiErrorMessage(err, '删除失败，请稍后重试。'));
    } finally {
      setDeletingId(null);
    }
  };

  return {
    articles,
    categories,
    loading,
    error,
    setError,
    filterCategoryId,
    setFilterCategoryId,
    categoryFilterOptions,
    isEditing,
    setIsEditing,
    isImmersive,
    setIsImmersive,
    saving,
    deletingId,
    flatCats,
    filteredArticles,
    load,
    handleSaveArticle,
    handleDeleteArticle,
  };
}
