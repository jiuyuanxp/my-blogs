export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  created_at: string;
  children?: Category[];
}

export interface Article {
  id: number;
  category_id: number;
  category_name?: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  article_id: number;
  article_title?: string;
  content: string;
  created_at: string;
}
