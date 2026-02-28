'use client';

import { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Hash,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TreeNode {
  name: string;
  fullName: string;
  children: Record<string, TreeNode>;
}

interface CategoryTreeProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  allLabel: string;
}

export default function CategoryTree({
  categories,
  selectedCategory,
  onSelectCategory,
  allLabel,
}: CategoryTreeProps) {
  const [tree, setTree] = useState<TreeNode>({
    name: 'root',
    fullName: '',
    children: {},
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const newTree: TreeNode = { name: 'root', fullName: '', children: {} };
    const sortedCategories = [...categories].sort();

    sortedCategories.forEach(category => {
      const parts = category.split('/');
      let currentLevel = newTree.children;
      let currentPath = '';

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!currentLevel[part]) {
          currentLevel[part] = {
            name: part,
            fullName: currentPath,
            children: {},
          };
        }

        if (selectedCategory.startsWith(currentPath)) {
          setExpanded(prev => ({ ...prev, [currentPath]: true }));
        }

        currentLevel = currentLevel[part].children;
      });
    });

    setTree(newTree);
  }, [categories, selectedCategory]);

  const toggleExpand = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderNode = (node: TreeNode) => {
    const hasChildren = Object.keys(node.children).length > 0;
    const isSelected = selectedCategory === node.fullName;
    const isExpanded = expanded[node.fullName] ?? false;

    return (
      <div key={node.fullName} className="select-none">
        <div
          role="button"
          tabIndex={0}
          className={`
            flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm mb-0.5 group
            ${isSelected ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-medium' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}
          `}
          onClick={() => onSelectCategory(node.fullName)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectCategory(node.fullName);
            }
          }}
          title={node.name}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={e => toggleExpand(node.fullName, e)}
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
              {Object.values(node.children).map(child => renderNode(child))}
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
          ${selectedCategory === 'All' ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'}
        `}
        onClick={() => onSelectCategory('All')}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectCategory('All');
          }
        }}
      >
        <span className="w-5 mr-1 flex-shrink-0" aria-hidden />
        <Layers size={16} className="opacity-70 flex-shrink-0" aria-hidden />
        <span>{allLabel}</span>
      </div>
      {Object.values(tree.children).map(node => renderNode(node))}
    </div>
  );
}
