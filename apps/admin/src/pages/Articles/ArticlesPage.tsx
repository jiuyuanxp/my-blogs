import type { Article } from '@blog/types';
import { PageLoading } from '@/components/PageLoading';
import { useArticlesPage } from './hooks/useArticlesPage';
import { ArticleEditorForm } from './components/ArticleEditorForm';
import { ArticleImmersiveShell } from './components/ArticleImmersiveShell';
import { ArticleListView } from './components/ArticleListView';

export default function ArticlesPage() {
  const ctx = useArticlesPage();

  if (ctx.isEditing) {
    const ed = ctx.isEditing;
    return (
      <>
        <ArticleEditorForm
          isEditing={ed}
          setIsEditing={ctx.setIsEditing}
          flatCats={ctx.flatCats}
          error={ctx.error}
          saving={ctx.saving}
          isImmersive={ctx.isImmersive}
          onEnterImmersive={() => ctx.setIsImmersive(true)}
          onBackToList={() => ctx.setIsEditing(null)}
          onSave={ctx.handleSaveArticle}
        />
        {ctx.isImmersive ? (
          <ArticleImmersiveShell
            isEditing={ed}
            setIsEditing={ctx.setIsEditing}
            flatCats={ctx.flatCats}
            error={ctx.error}
            saving={ctx.saving}
            onExitImmersive={() => ctx.setIsImmersive(false)}
            onBackToList={() => ctx.setIsEditing(null)}
            onSave={ctx.handleSaveArticle}
          />
        ) : null}
      </>
    );
  }

  if (ctx.loading) {
    return <PageLoading title="文章管理" />;
  }

  return (
    <ArticleListView
      error={ctx.error}
      rootCategories={ctx.rootCategories}
      activeTabId={ctx.activeTabId}
      setActiveTabId={ctx.setActiveTabId}
      selectedSubCatId={ctx.selectedSubCatId}
      setSelectedSubCatId={ctx.setSelectedSubCatId}
      activeSubCategories={ctx.activeSubCategories}
      filteredArticles={ctx.filteredArticles}
      deletingId={ctx.deletingId}
      onNewArticle={() => {
        const defaultCategoryId =
          ctx.selectedSubCatId !== 'all'
            ? ctx.selectedSubCatId
            : ctx.activeTabId !== 'all'
              ? ctx.activeTabId
              : (ctx.flatCats[0]?.id ?? '');
        ctx.setIsEditing({
          status: 'draft',
          categoryId: defaultCategoryId,
        });
      }}
      onEdit={(article: Article) => ctx.setIsEditing(article)}
      onDelete={ctx.handleDeleteArticle}
    />
  );
}
