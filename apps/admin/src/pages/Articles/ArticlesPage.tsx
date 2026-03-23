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
      filterCategoryId={ctx.filterCategoryId}
      setFilterCategoryId={ctx.setFilterCategoryId}
      categoryFilterOptions={ctx.categoryFilterOptions}
      filteredArticles={ctx.filteredArticles}
      deletingId={ctx.deletingId}
      onNewArticle={() => {
        const defaultCategoryId =
          ctx.filterCategoryId !== 'all' ? ctx.filterCategoryId : (ctx.flatCats[0]?.id ?? '');
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
