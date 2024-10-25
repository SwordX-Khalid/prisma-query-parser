export interface IndexingConfig {
  indexedColumns?: string[];
  dataset?: Dataset;
}

export interface BinarySearchParams {
  value: string | number;
  column: string;
  operator?: string;
}

export type Dataset = Record<string, string | number>[];

export interface BaseIndexer {
  indexedColumns: string[];
  buildIndex(dataset: Dataset): void;
  getIndexMatches(params: BinarySearchParams): Dataset;
  setIndexedColumns(dataset: Dataset, indexedColumns: string[]): void;
}
