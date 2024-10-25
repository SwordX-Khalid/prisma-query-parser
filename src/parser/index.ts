import { processQueryInterpreter } from "./interpreter.ts";
import { processQueryRegex } from "./regex.ts";

export interface QueryConfig {
  queryEngine: "regex" | "interpreter";
}

const defaultConfig: QueryConfig = {
  queryEngine: "regex"
};

export interface FilterCondition {
  column: string;
  operator: string;
  value: string | number;
}

export interface QueryResult {
  projectedColumns: string[];
  filterCondition: FilterCondition;
}

export const query = (
  query: string,
  config: QueryConfig = defaultConfig
): QueryResult => {
  if (config?.queryEngine === "interpreter") {
    return processQueryInterpreter(query);
  }

  return processQueryRegex(query);
};
