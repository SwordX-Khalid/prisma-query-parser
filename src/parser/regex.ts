import { FilterCondition, QueryResult } from "./index.ts";

export const processQueryRegex = (query: string): QueryResult => {
  const queryRegex =
    /^PROJECT ([a-zA-Z0-9_, ]+) FILTER ([a-zA-Z0-9_]+) (<=|>=|<|=|>) ("[^"]*"|'[^']*'|[0-9]+)$/;
  const queryMatch = query.match(queryRegex);

  if (!queryMatch) {
    throw new Error("Invalid query syntax");
  }

  if (queryMatch.length < 5) {
    throw new Error("Incomplete query detected");
  }

  const projectedColumns = queryMatch[1].replaceAll(" ", "").split(",");

  const filterCondition: FilterCondition = {
    column: queryMatch[2],
    operator: queryMatch[3],
    value: queryMatch[4]
  };

  return {
    projectedColumns,
    filterCondition
  };
};
