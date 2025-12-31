// Algorithm configurations and metadata

export interface AlgorithmInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  stable?: boolean;
  inPlace?: boolean;
  adaptive?: boolean;
}

export const SORTING_ALGORITHMS: AlgorithmInfo[] = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'sorting',
    description: 'Simple comparison-based algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: true,
    inPlace: true,
    adaptive: true,
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'sorting',
    description: 'Divides input into sorted and unsorted regions, repeatedly selects the smallest element from unsorted region.',
    timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: false,
    inPlace: true,
    adaptive: false,
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'sorting',
    description: 'Builds the sorted array one item at a time by inserting each element into its correct position.',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: true,
    inPlace: true,
    adaptive: true,
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'sorting',
    description: 'Divide and conquer algorithm that divides the array, sorts, and merges.',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    stable: true,
    inPlace: false,
    adaptive: false,
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'sorting',
    description: 'Efficient divide and conquer algorithm using pivot partitioning.',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(log n)',
    stable: false,
    inPlace: true,
    adaptive: false,
  },
  {
    id: 'heap-sort',
    name: 'Heap Sort',
    category: 'sorting',
    description: 'Comparison-based algorithm using a binary heap data structure.',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(1)',
    stable: false,
    inPlace: true,
    adaptive: false,
  },
];

export const SEARCHING_ALGORITHMS: AlgorithmInfo[] = [
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'searching',
    description: 'Sequentially checks each element until a match is found.',
    timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'searching',
    description: 'Efficient algorithm for finding an element in a sorted array by repeatedly dividing the search interval in half.',
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)',
  },
];

export const GRAPH_ALGORITHMS: AlgorithmInfo[] = [
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    category: 'graph',
    description: 'Explores all neighbor nodes at the present depth before moving to nodes at the next depth level.',
    timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
    spaceComplexity: 'O(V)',
  },
  {
    id: 'dfs',
    name: 'Depth-First Search',
    category: 'graph',
    description: 'Explores as far as possible along each branch before backtracking.',
    timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
    spaceComplexity: 'O(V)',
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'graph',
    description: 'Finds the shortest path between nodes in a weighted graph.',
    timeComplexity: { best: 'O(V + E log V)', average: 'O(V + E log V)', worst: 'O(V²)' },
    spaceComplexity: 'O(V)',
  },
];

export const TREE_ALGORITHMS: AlgorithmInfo[] = [
  {
    id: 'inorder-traversal',
    name: 'Inorder Traversal',
    category: 'tree',
    description: 'Visits left subtree, node, then right subtree.',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(h)',
  },
  {
    id: 'preorder-traversal',
    name: 'Preorder Traversal',
    category: 'tree',
    description: 'Visits node, left subtree, then right subtree.',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(h)',
  },
  {
    id: 'postorder-traversal',
    name: 'Postorder Traversal',
    category: 'tree',
    description: 'Visits left subtree, right subtree, then node.',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(h)',
  },
];

export const ALL_ALGORITHMS = [
  ...SORTING_ALGORITHMS,
  ...SEARCHING_ALGORITHMS,
  ...GRAPH_ALGORITHMS,
  ...TREE_ALGORITHMS,
];

export const ALGORITHM_CATEGORIES = {
  sorting: {
    name: 'Sorting',
    description: 'Algorithms that arrange elements in a specific order',
    algorithms: SORTING_ALGORITHMS,
  },
  searching: {
    name: 'Searching',
    description: 'Algorithms that find elements in data structures',
    algorithms: SEARCHING_ALGORITHMS,
  },
  graph: {
    name: 'Graphs',
    description: 'Algorithms for graph traversal and pathfinding',
    algorithms: GRAPH_ALGORITHMS,
  },
  tree: {
    name: 'Trees',
    description: 'Algorithms for tree traversal and manipulation',
    algorithms: TREE_ALGORITHMS,
  },
} as const;

export function getAlgorithmById(id: string): AlgorithmInfo | undefined {
  return ALL_ALGORITHMS.find((algo) => algo.id === id);
}

export function getAlgorithmsByCategory(category: string): AlgorithmInfo[] {
  return ALL_ALGORITHMS.filter((algo) => algo.category === category);
}
