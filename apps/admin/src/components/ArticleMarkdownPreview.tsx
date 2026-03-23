import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * 独立文件以便路由级 code-split，避免文章列表页拉取 react-markdown。
 */
function ArticleMarkdownPreview({ content }: { content: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || '*暂无内容*'}</ReactMarkdown>;
}

export default memo(ArticleMarkdownPreview);
