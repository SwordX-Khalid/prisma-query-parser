import { processQueryInterpreter } from "../../src/parser/interpreter.ts";
import { QueryResult } from "../../src/parser/index.ts";
import { describe, expect, it } from "@jest/globals";

describe("processQueryInterpreter", () => {
  it("should parse a valid query with a simple filter correctly", () => {
    const query = `PROJECT column1, column2 FILTER column1 = "value1"`;
    const expected: QueryResult = {
      projectedColumns: ["column1", "column2"],
      filterCondition: {
        column: "column1",
        operator: "=",
        value: "value1"
      }
    };
    expect(processQueryInterpreter(query)).toEqual(expected);
  });

  it("should parse a valid query with numeric value in filter", () => {
    const query = `PROJECT column1 FILTER column2 >= 100`;
    const expected: QueryResult = {
      projectedColumns: ["column1"],
      filterCondition: {
        column: "column2",
        operator: ">=",
        value: "100"
      }
    };
    expect(processQueryInterpreter(query)).toEqual(expected);
  });

  it("should throw an error for missing 'FILTER' clause", () => {
    const query = `PROJECT column1, column2`;
    expect(() => processQueryInterpreter(query)).toThrow(
      "Invalid query: Missing 'FILTER' clause"
    );
  });

  it("should throw an error if 'PROJECT' clause is missing", () => {
    const query = `column1 FILTER column1 = "value1"`;
    expect(() => processQueryInterpreter(query)).toThrow(
      "Invalid query: Query must start with 'PROJECT'"
    );
  });

  it("should throw an error if no columns are specified in 'PROJECT' clause", () => {
    const query = `PROJECT FILTER column1 = "value1"`;
    expect(() => processQueryInterpreter(query)).toThrow(
      "Invalid query: No columns specified in 'PROJECT' clause"
    );
  });

  it("should throw an error for unsupported operator in 'FILTER' clause", () => {
    const query = `PROJECT column1 FILTER column1 != "value1"`;
    expect(() => processQueryInterpreter(query)).toThrow(
      "Invalid query: Unsupported operator '!='. Allowed operators are <=, >=, <, >, ="
    );
  });

  it("should throw an error if no value is provided in the 'FILTER' clause", () => {
    const query = `PROJECT column1 FILTER column1 =`;
    expect(() => processQueryInterpreter(query)).toThrow(
      "Invalid query: Value must be a number or a quoted string after the operator"
    );
  });

  it("should throw an error if filter value is unquoted string", () => {
    const query = `PROJECT column1 FILTER column1 = value1`;
    expect(() => processQueryInterpreter(query)).toThrow(
      "Invalid query: Value must be a number or a quoted string after the operator"
    );
  });

  it("should handle single column with 'PROJECT' and filter with quoted single quotes", () => {
    const query = `PROJECT column1 FILTER column1 = 'value1'`;
    const expected: QueryResult = {
      projectedColumns: ["column1"],
      filterCondition: {
        column: "column1",
        operator: "=",
        value: "value1"
      }
    };
    expect(processQueryInterpreter(query)).toEqual(expected);
  });
});
