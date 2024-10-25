import { FilterCondition, QueryResult } from "./index.ts";

const splitTokens = (query: string): string[] => query.trim().split(/\s+/);

const parseProject = (tokens: string[]): [string[], string[]] => {
  const projectIndex = tokens.indexOf("PROJECT");
  if (projectIndex === -1)
    throw new Error("Invalid query: Query must start with 'PROJECT'");

  const filterIndex = tokens.indexOf("FILTER");
  if (filterIndex === -1)
    throw new Error("Invalid query: Missing 'FILTER' clause");

  const columns = tokens
    .slice(projectIndex + 1, filterIndex)
    .join(" ")
    .split(",")
    .map(col => col.trim());
  if (!columns.length || columns.some(col => !col))
    throw new Error("Invalid query: No columns specified in 'PROJECT' clause");

  return [columns, tokens.slice(filterIndex)];
};

const parseFilterColumn = (tokens: string[]): [string, string[]] => {
  const column = tokens[1];

  return [column, tokens.slice(2)];
};

const parseOperator = (tokens: string[]): [string, string[]] => {
  const operator = tokens[0];
  const validOperators = ["<=", ">=", "<", ">", "="];
  if (!validOperators.includes(operator)) {
    throw new Error(
      `Invalid query: Unsupported operator '${operator}'. Allowed operators are ${validOperators.join(
        ", "
      )}`
    );
  }

  return [operator, tokens.slice(1)];
};

const parseValue = (tokens: string[]): [string, string[]] => {
  const value = tokens[0];
  if (
    !value ||
    (!isNaN(Number(value))
      ? false
      : !(value.startsWith('"') || value.startsWith("'")))
  ) {
    throw new Error(
      "Invalid query: Value must be a number or a quoted string after the operator"
    );
  }

  // Remove quotes if present
  const sanitizedValue = value.replace(/^["']|["']$/g, "");
  return [sanitizedValue, tokens.slice(1)];
};

export const processQueryInterpreter = (query: string): QueryResult => {
  const tokens = splitTokens(query);

  const [projectedColumns, filterTokens] = parseProject(tokens);
  const [column, operatorTokens] = parseFilterColumn(filterTokens);
  const [operator, valueTokens] = parseOperator(operatorTokens);
  const [value] = parseValue(valueTokens);

  const filterCondition: FilterCondition = {
    column,
    operator,
    value
  };

  return {
    projectedColumns,
    filterCondition
  };
};
