import { BaseIndexer, BinarySearchParams, Dataset } from "./index.ts";

interface IndexingConfig {
  indexedColumns: string[];
  dataset: Dataset;
}

export default class BinaryIndexer implements BaseIndexer {
  indexedColumns: string[];
  indexes: Record<string, Dataset> = {};

  constructor({ indexedColumns, dataset }: IndexingConfig) {
    this.indexedColumns = indexedColumns;
    this.buildIndex(dataset);
  }

  buildIndex(dataset: Dataset) {
    this.indexes = this.indexedColumns.reduce((builtIndex, column) => {
      const sortedList = dataset
        // Filter out unnecessary entries to preserve memory and reduce sorting iterations
        .filter(item => item[column] !== null && item[column] !== undefined)
        .sort((a, b) => {
          if (typeof a[column] === "number" && typeof b[column] === "number") {
            return a[column] - b[column];
          }

          return a[column].toString().localeCompare(b[column].toString()) ?? -1;
        });

      return {
        ...builtIndex,
        [column]: sortedList
      };
    }, {});
  }

  getIndexMatches({ column, value, operator }: BinarySearchParams) {
    if (!this.indexedColumns.includes(column)) {
      throw new Error(`Column ${column} is not indexed!`);
    }

    const dataset = this.indexes[column];

    if (!dataset) {
      return [];
    }

    let left = 0;
    let right = dataset.length - 1;
    let mid = -1;

    while (left <= right) {
      mid = Math.floor((left + right) / 2);
      const entry = dataset[mid][column];

      switch (operator) {
        case "=":
          if (entry === value) {
            // Narrow down both the left and right index counters to get a range of when the equal elements start and end,
            // This use case is better handled by the HashIndexer which has constant access to all equal elements
            return this.#findRange(dataset, mid, value, column);
          } else if (entry < value) {
            left = mid + 1;
          } else {
            right = mid - 1;
          }
          break;

        case "<":
          if (entry < value) {
            left = mid + 1;
          } else {
            right = mid - 1;
          }
          break;

        case "<=":
          if (entry <= value) {
            left = mid + 1;
          } else {
            right = mid - 1;
          }
          break;

        case ">":
          if (entry > value) {
            right = mid - 1;
          } else {
            left = mid + 1;
          }
          break;

        case ">=":
          if (entry >= value) {
            right = mid - 1;
          } else {
            left = mid + 1;
          }
          break;

        default:
          throw new Error("Invalid comparison operator");
      }
    }

    if (operator === "<") {
      return dataset.slice(0, right + 1);
    } else if (operator === "<=") {
      return dataset.slice(0, left);
    } else if (operator === ">") {
      return dataset.slice(left);
    } else if (operator === ">=") {
      return dataset.slice(right + 1);
    }

    return [];
  }

  #findRange(
    dataset: Dataset,
    mid: number,
    target: string | number,
    column: string
  ) {
    let start = mid;
    let end = mid;

    while (start >= 0 && dataset[start][column] === target) {
      start--;
    }
    while (end < dataset.length && dataset[end][column] === target) {
      end++;
    }

    return dataset.slice(start + 1, end);
  }

  setIndexedColumns(dataset: Dataset, indexedColumns: string[]) {
    this.indexedColumns = indexedColumns;
    this.buildIndex(dataset);
  }
}
