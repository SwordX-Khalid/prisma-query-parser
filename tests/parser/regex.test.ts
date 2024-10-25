import { describe, expect, it } from "@jest/globals";
import { processQueryRegex } from "../../src/parser/regex.ts";

describe("Regex Parser", () => {
  describe("processRegexQuery", () => {
    it("should parse queries correctly", () => {
      const testQuery = "PROJECT id FILTER id < 10";
      const processedQuery = processQueryRegex(testQuery);

      expect(processedQuery.filterCondition.column).toBe("id");
      expect(processedQuery.filterCondition.operator).toBe("<");
      expect(processedQuery.filterCondition.value).toBe("10");
    });

    it("should error on invalid queries", () => {
      const invalidQuery = "PROJECT id, FILTER id < 10 FILTER";

      expect(() => {
        processQueryRegex(invalidQuery);
      }).toThrowError();
    });
  });
});
