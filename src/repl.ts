import { start } from "node:repl";
import { query } from "./parser/index.ts";
import Database from "./database/index.ts";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";

const commands = await yargs(hideBin(process.argv))
  .command(
    "load <csvFile>",
    "Load a csv file into the in-memory database and start a repl session",
    yargs => {
      return yargs
        .positional("csvFile", {
          describe: "The CSV file to use as the database's dataset"
        })
        .option("queryEngine", {
          describe:
            "Specify which query parsing engine to use, interpreter provides more detailed errors, while regex is a bit more 'static' and due to that, offers slightly better performance.",
          choices: ["interpreter", "regex"],
          default: "interpreter"
        })
        .option("indexedColumns", {
          array: true,
          describe:
            "Specify columns that have to be indexed to optimize queries and filter using them"
        });
    }
  )
  .demandCommand(1)
  .parse();

const database = new Database({
  indexedColumns: (commands.indexedColumns as string[]) ?? [],
  _debugMode: true
});

console.log({
  commands
});

console.log(chalk.dim(`Using "${commands.queryEngine}" query engine`));

if (commands.csvFile) {
  await database.loadCSVFile(commands.csvFile as string);
}

start({
  prompt: "CSV Query > ",
  eval: (evalCmd, _, __, cb) => {
    try {
      const start = performance.now();
      const parsedQuery = query(evalCmd.trim(), {
        queryEngine: commands.queryEngine as "interpreter" | "regex"
      });

      const fetchedData = database.findMany(parsedQuery);
      const end = performance.now();

      console.table(fetchedData);
      console.log(
        chalk.dim(`Retrieved ${fetchedData.length} entries in ${end - start}ms`)
      );

      cb(null, "Done!");
    } catch (error) {
      cb(error as Error, null);
    }
  },
  useColors: true
});
