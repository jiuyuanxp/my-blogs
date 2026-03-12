'use client';

import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Hash,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CategoryNode {
  id: string;
  name: string;
  children?: CategoryNode[];
}

interface CategoryTreeProps {
  categories: CategoryNode[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  allLabel: string;
}

export default function CategoryTree({
  categories,
  selectedCategoryId,
  onSelectCategory,
  allLabel,
}: CategoryTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: CategoryNode) => {
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedCategoryId === node.id;
    const isExpanded = expanded[node.id] ?? false;

    return (
      <div key={node.id} className="select-none">
        <div
          role="button"
          tabIndex={0}
          className={`
            flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm mb-0.5 group
            ${isSelected ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-medium' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}
          `}
          onClick={() => onSelectCategory(node.id)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectCategory(node.id);
            }
          }}
          title={node.name}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={e => toggleExpand(node.id, e)}
              className={`p-0.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors mr-1 flex-shrink-0 ${isSelected ? 'text-white dark:text-stone-900' : ''}`}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown size={14} aria-hidden />
              ) : (
                <ChevronRight size={14} aria-hidden />
              )}
            </button>
          ) : (
            <span className="w-5 mr-1 flex-shrink-0" aria-hidden />
          )}

          {hasChildren ? (
            isExpanded ? (
              <FolderOpen
                size={16}
                className="opacity-70 flex-shrink-0"
                aria-hidden
              />
            ) : (
              <Folder
                size={16}
                className="opacity-70 flex-shrink-0"
                aria-hidden
              />
            )
          ) : (
            <Hash size={16} className="opacity-70 flex-shrink-0" aria-hidden />
          )}

          <span className="whitespace-nowrap">{node.name}</span>
        </div>

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden ml-4 pl-2 border-l border-stone-200 dark:border-stone-800"
            >
              {node.children!.map(child => renderNode(child))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-1 w-full">
      <div
        role="button"
        tabIndex={0}
        className={`
          flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm font-medium mb-2
          ${selectedCategoryId === 'all' ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}
        `}
        onClick={() => onSelectCategory('all')}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectCategory('all');
          }
        }}
      >
        <span className="w-5 mr-1 flex-shrink-0" aria-hidden />
        <Layers size={16} className="opacity-70 flex-shrink-0" aria-hidden />
        <span>{allLabel}</span>
      </div>
      {categories.map(node => renderNode(node))}
    </div>
  );
}
