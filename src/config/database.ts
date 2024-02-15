const { DATABASE_URL } = process.env;

export type DialectType = "postgres";

export const databaseConfig = {
  dialect: "postgres" as DialectType,
  url: DATABASE_URL as string,
};