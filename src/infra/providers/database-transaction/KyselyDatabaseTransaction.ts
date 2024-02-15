import { kyselyDb } from "@infra/database/postgres/connection";
import IDatabaseTransaction from "../database-transaction.interface";
import { Transaction } from "kysely";
import { DB } from "@infra/database/postgres/models";

export default class KyselyDatabaseTransaction implements IDatabaseTransaction {
  async transaction<T>(callback: (trx: any) => Promise<T>): Promise<T> {
    return await kyselyDb.transaction().execute(async (transaction: Transaction<DB>) => {
      try {
        const result = await callback(transaction);

        return result;
      } catch (error) {
        throw error;
      }
    });
  }
}
