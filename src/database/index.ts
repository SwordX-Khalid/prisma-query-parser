import { createReadStream } from "node:fs";
import CSVParser from "csv-parser";
import chalk from "chalk";
import { BaseIndexer, Dataset } from "../indexes/index.ts";
import BinaryIndexer from "../indexes/binary.ts";
import HashIndexer from "../indexes/hash.ts";
import { QueryResult } from "../parser/index.ts";
import { projectData } from "../utils/collection.ts";
import { finished } from "node:stream/promises";

interface IndexerTypes {
  equality: BaseIndexer;
  range: BaseIndexer;
}

interface DatabaseConfig {
  indexerTypes?: IndexerTypes;
  dataset?: Dataset;
  indexedColumns: string[];
  _debugMode?: boolean;
}

export default class Database {
  indexers: IndexerTypes;
  _debugMode?: boolean;

  constructor({
    indexedColumns,
    dataset = [],
    indexerTypes,
    _debugMode
  }: DatabaseConfig) {
    this._debugMode = _debugMode;

    const binaryIndexer = new BinaryIndexer({ indexedColumns, dataset });
    const hashIndexer = new HashIndexer({ indexedColumns, dataset });

    this.indexers = {
      equality: hashIndexer,
      range: binaryIndexer,
      ...(indexerTypes ?? {})
    };
  }

  #getQueryIndexType(operator: string): keyof IndexerTypes {
    const queryTypes: Record<string, keyof IndexerTypes> = {
      "=": "equality",
      "<=": "range",
      "<": "range",
      ">=": "range",
      ">": "range"
    };

    return queryTypes[operator];
  }

  async loadCSVFile(filePath: string) {
    if (this._debugMode) {
      console.log(chalk.dim("Loading CSV file..."));
    }
    const results: Dataset = [];
    let headers: string[] = [];
    const readStream = createReadStream(filePath)
      .pipe(
        CSVParser({
          mapValues: ({ value }) => {
            if (value.match(/^[0-9]+$/)) {
              return parseFloat(value);
            }
            return value;
          }
        })
      )
      .on("data", (data: Record<string, string | number>) => results.push(data))
      .on("headers", (data: string[]) => {
        headers = data;
      });

    await finished(readStream);

    if (this._debugMode) {
      console.log(chalk.dim("CSV file loaded!"));
      console.log(chalk.dim("Rebuilding indexes..."));
    }

    const startRebuildTime = performance.now();

    if (
      !this.indexers.equality.indexedColumns.length &&
      !this.indexers.range.indexedColumns.length
    ) {
      // Index all columns by default if no column indexes were provided
      this.indexers.equality.setIndexedColumns(results, headers);
      this.indexers.range.setIndexedColumns(results, headers);
    } else {
      // Re-build the indexes since we have new data added
      this.indexers.equality.buildIndex(results);
      this.indexers.range.buildIndex(results);
    }

    if (this._debugMode) {
      console.log(chalk.dim("Indexes rebuilt in %sms"), startRebuildTime);
    }

    return results;
  }

  findMany({ filterCondition, projectedColumns }: QueryResult) {
    const queryType = this.#getQueryIndexType(filterCondition.operator);

    const retrievedItems = this.indexers[queryType].getIndexMatches({
      column: filterCondition.column,
      value: this.#parseFilterValue(filterCondition.value),
      operator: filterCondition.operator
    });

    return projectData(retrievedItems, projectedColumns);
  }

  #parseFilterValue(value: string | number): string | number {
    if (typeof value === "string") {
      const isNumber = /^[0-9]+$/.test(value);
      return isNumber ? parseFloat(value) : value;
    }

    return value;
  }
}
