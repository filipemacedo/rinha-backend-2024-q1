import pg from "pg";
import { Kysely, PostgresDialect, Dialect } from "kysely";
import { DialectType, databaseConfig } from "@config/database";
import { DB } from "./models";

const dialects: Record<DialectType, (url: string) => Dialect> = {
  postgres: (url: string) =>
    new PostgresDialect({
      pool: new pg.Pool({
        connectionString: url,
        max: 5,
      }),
    }),
};

export const kyselyDb = new Kysely<DB>({
  dialect: dialects[databaseConfig.dialect](databaseConfig.url),
  log: [],
});
