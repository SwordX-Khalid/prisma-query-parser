import { beforeEach, describe, expect, it } from "@jest/globals";
import Database from "../../src/database/index.ts";
import BinaryIndexer from "../../src/indexes/binary.ts";
import HashIndexer from "../../src/indexes/hash.ts";
import { QueryResult } from "../../src/parser/index.ts";

describe("Database", () => {
  let database: Database;

  beforeEach(() => {
    database = new Database({
      indexedColumns: ["column1"],
      dataset: []
    });
  });

  describe("constructor", () => {
    it("should initialize indexers correctly", () => {
      expect(database.indexers.equality).toBeInstanceOf(HashIndexer);
      expect(database.indexers.range).toBeInstanceOf(BinaryIndexer);
    });
  });

  describe("loadCSVFile", () => {
    it("should load CSV file, parse data, and build indexes", async () => {
      const mockData = [
        { column1: "data1", column2: "value3" },
        { column1: "data2", column2: "value4" }
      ];
      const mockHeaders = ["column1"];

      const result = await database.loadCSVFile(
        "tests/_samples/load_csv_sample.csv"
      );

      expect(database.indexers.equality.indexedColumns).toEqual(mockHeaders);
      expect(database.indexers.range.indexedColumns).toEqual(mockHeaders);
      expect(result).toEqual(mockData);
    });
  });

  describe("findMany", () => {
    it("should find and project data based on query filter and projection", () => {
      const filterCondition = {
        column: "column1",
        value: "value1",
        operator: "="
      };
      const projectedColumns = ["column1"];
      const queryResult: QueryResult = { filterCondition, projectedColumns };

      // Manually index some data for the test
      database.indexers.equality.buildIndex([
        { column1: "value1" },
        { column1: "value2" }
      ]);

      const result = database.findMany(queryResult);

      expect(result).toEqual([{ column1: "value1" }]);
    });
  });
});
