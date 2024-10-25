import { BaseIndexer, BinarySearchParams, Dataset } from "./index.ts";
import { groupBy } from "../utils/collection.ts";

interface IndexingConfig {
  indexedColumns: string[];
  dataset: Dataset;
}

export default class HashIndexer implements BaseIndexer {
  indexedColumns: string[];
  indexes: Record<string, Record<string, Dataset>> = {};

  // The dataset is intentionally not being stored in the indexer as well to preserve storage
  constructor({ indexedColumns, dataset }: IndexingConfig) {
    this.indexedColumns = indexedColumns;
    this.buildIndex(dataset);
  }

  // The indexer could be optimized even further memory-wise by referencing entries
  // by their indexes rather than copying them over for each indexed column
  buildIndex(dataset: Dataset) {
    this.indexes = this.indexedColumns.reduce((builtIndex, column) => {
      return {
        ...builtIndex,
        [column]: groupBy(dataset, column)
      };
    }, {});
  }

  getIndexMatches({ column, value }: BinarySearchParams) {
    return this.indexes[column]?.[value] ?? [];
  }

  setIndexedColumns(dataset: Dataset, indexedColumns: string[]) {
    this.indexedColumns = indexedColumns;
    this.buildIndex(dataset);
  }
}
