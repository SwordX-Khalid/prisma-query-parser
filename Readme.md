# Prisma Query Parser

## Prerequisites

- Node.js LTS (20.18.0)
- NPM (usually pre-installed with Node)

## How it works

The database has two indexers, BinaryIndexer, and HashIndexer, to optimize queries and also reduce unnecessary loops.

- The BinaryIndexer is used whenever there's a query with one of the supported comparison operators (`<`, `<=`, `>`, and `>=`), which does a binary search through a sorted form of the dataset to ensure that all comparison queries are within O(log n) complexity level instead of O(n) with `[].filter` or a `for` loop
- The HashIndexer is used whenever there's an exact match query (`=`), what it does is, it groups up all dataset items by an indexed column, and then uses that indexed column value as the key when attempting to retrieve results resulting in constant-level complexity during runtime (O(1) level).

There are also two query engines, one is built using Regex mostly which is mainly there to fulfill the assignment's query requirement and is also the fastest one out of the two, and another one is built using a mixture of both regex and loops, the other one is built in a way that's similar to how actual querying languages are interpreted and would be more suitable in a real-world use case scenario as it's far more maintainable and also produces much more helpful error messages in case an invalid query was provided.

## Usage

In order to interact with the database, there are two methods of usage, you could either import it directly (via `src/index.ts`) and use it in another project of yours by initializing the Database class, or you could also start a repl environment where you can load a CSV file and run multiple queries on it.

Here's a sample command you can run at the root of the project to initialize the repl environment:

```sh
npm i && npm start load ./tests/_samples/fake_users_sample.csv --interpreterEngine interpreter
```

You can also type `npm start load` to have a look over all of the supported options and commands you could use through bash.

## Questions

### What were some of the tradeoffs you made when building this and why were these acceptable tradeoffs?

- The biggest tradeoff I had to make is while working on the binary indexer, I intentionally went for a while loop which probably isn't as readable as say, filtering using a method like `.filter`, but that helped bring down the complexity level for the loop to O(log n), which I believe is definitely worth it especially in large dataset use cases
- Another tradeoff is with the QueryResult interface, I made the `filterCondition` property an object instead of an array just so it's generally simpler to interact with and faster technically speaking, especially given the assignment's expected result which is to have a query parser that only accepts one filter condition.

### Given more time, what improvements or optimizations would you want to add? When would you add them?

- Add more comparison operators (such as !=) - High priority
- Add support for compound filters (&& and ||) - High priority
- Add syntax highlighting via an IDE extension, and optionally to the REPL environment too - High priority
- Optimize Token Parsing - Medium priority
- More detailed error messages with better error highlighting of the area at which the error has occurred - Medium priority
- Support more native data type (Date, boolean, etc...) - Medium priority
- Add query caching so complex queries shouldn't be re-run needlessly - Low priority
- Implement AST for the interpreter query engine - Low priority

### What changes are needed to accommodate changes to support other data types, multiple filters, or ordering of results?

- For multiple filters support, what I would do is update the interpreter query engine to split filter queries by "AND" and "OR" and also update the QueryResult interface to also support storing an array of filterConditions so the database engine can understand what fields it should filter by and at which order

### What changes are needed to process extremely large datasets

- The foundation for supporting large datasets is partially there with the support of indexing that's currently in-place, what I would do is probably add more indexing engines that the support other use cases and allow users to freely pick which engine they'd like to use for what column.
- Another change I'd do is to update the datasets array in each of the indexers to reference dataset items by their index only rather than by copying the whole object over, just to improve the efficiency at which we're storing the data in-memory

### What do you still need to do to make this code production ready?

I'd probably need to add more test cases than the ones I have currently and also optimize the way datasets are being handled in indexing engines just so the engine is more resilient in large dataset use cases
