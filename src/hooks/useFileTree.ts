'use client';

import { useMemo } from 'react';
import type { TreeNode, AlgorithmData } from '@/types/app';
import algorithmsData from '@/data/algorithms.json';

const categoryIcons: Record<string, string> = {
  sorting: '🔄',
  searching: '🔍',
  trees: '🌳',
  graphs: '🕸️',
  'dynamic-programming': '📊',
};

const categoryDisplayNames: Record<string, string> = {
  sorting: 'Sorting Algorithms',
  searching: 'Searching Algorithms',
  trees: 'Tree Structures',
  graphs: 'Graph Algorithms',
  'dynamic-programming': 'Dynamic Programming',
};

export function useFileTree() {
  const treeData = useMemo<TreeNode>(() => {
    const data = algorithmsData as AlgorithmData;
    
    const children: TreeNode[] = Object.entries(data).map(([category, algorithms]) => {
      const algorithmNodes: TreeNode[] = Object.entries(algorithms).map(
        ([algorithmId, algorithmData]) => ({
          id: algorithmId,
          name: algorithmData.name,
          type: 'file' as const,
          path: [category, algorithmId],
          metadata: {
            description: algorithmData.description,
            timeComplexity: algorithmData.timeComplexity,
            spaceComplexity: algorithmData.spaceComplexity,
            stable: algorithmData.stable,
            inPlace: algorithmData.inPlace,
            adaptive: algorithmData.adaptive,
            code: algorithmData.code,
            categories: algorithmData.categories || [],
          },
        })
      );

      return {
        id: category,
        name: categoryDisplayNames[category] || category,
        type: 'folder' as const,
        path: [category],
        children: algorithmNodes,
      };
    });

    return {
      id: 'root',
      name: 'DSA Algorithms',
      type: 'folder',
      path: [],
      children,
    };
  }, []);

  const getAlgorithmById = useMemo(() => {
    return (id: string) => {
      const data = algorithmsData as AlgorithmData;
      
      for (const [category, algorithms] of Object.entries(data)) {
        if (algorithms[id]) {
          return {
            ...algorithms[id],
            id,
            category,
          };
        }
      }
      return null;
    };
  }, []);

  const searchTree = useMemo(() => {
    return (query: string): TreeNode[] => {
      if (!query.trim()) return [];
      
      const results: TreeNode[] = [];
      const data = algorithmsData as AlgorithmData;
      const lowerQuery = query.toLowerCase();

      for (const [category, algorithms] of Object.entries(data)) {
        for (const [algorithmId, algorithmData] of Object.entries(algorithms)) {
          const matchesName = algorithmData.name.toLowerCase().includes(lowerQuery);
          const matchesCategory = category.toLowerCase().includes(lowerQuery);
          const matchesCategories = algorithmData.categories?.some((c: string) =>
            c.toLowerCase().includes(lowerQuery)
          );

          if (matchesName || matchesCategory || matchesCategories) {
            results.push({
              id: algorithmId,
              name: algorithmData.name,
              type: 'file',
              path: [category, algorithmId],
              metadata: {
                description: algorithmData.description,
                timeComplexity: algorithmData.timeComplexity,
                spaceComplexity: algorithmData.spaceComplexity,
                stable: algorithmData.stable,
                inPlace: algorithmData.inPlace,
                adaptive: algorithmData.adaptive,
                code: algorithmData.code,
                categories: algorithmData.categories || [],
              },
            });
          }
        }
      }

      return results;
    };
  }, []);

  const getCategoryIcon = (categoryId: string) => {
    return categoryIcons[categoryId] || '📁';
  };

  const getAllFolderIds = (): string[] => {
    const ids: string[] = ['root'];
    const data = algorithmsData as AlgorithmData;
    for (const category of Object.keys(data)) {
      ids.push(category);
    }
    return ids;
  };

  return {
    treeData,
    getAlgorithmById,
    searchTree,
    getCategoryIcon,
    getAllFolderIds,
    categoryIcons,
    categoryDisplayNames,
  };
}
