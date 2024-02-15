import { Kysely, Transaction as DBTransaction } from "kysely";
import IGetTransactionsRepository from "../get-transactions-repository.interface";
import { DB } from "@infra/database/postgres/models";
import { Transaction } from "@infra/database/postgres/models/transaction";
import ISaveTransactionRepository from "../save-transaction-repository.interface";
import { Client } from "@infra/database/postgres/models/client";

export default class KyselyTransactionsRepository
  implements IGetTransactionsRepository, ISaveTransactionRepository
{
  constructor(private readonly kyselyDb: Kysely<DB>) {}

  async save(
    transaction: Transaction,
    databaseTransaction?: DBTransaction<DB>
  ): Promise<Transaction> {
    const trx = databaseTransaction || this.kyselyDb;

    const [result] = await trx
      .insertInto("transactions")
      .values({
        ...transaction,
        id: undefined,
      } as unknown as Transaction)
      .returningAll()
      .execute();

    return result;
  }

  async getLastTransactions(client: Client): Promise<Transaction[]> {
    const result = await this.kyselyDb
      .selectFrom("transactions")
      .selectAll()
      .limit(10)
      .orderBy("createdAt", "desc")
      .where("idClient", "=", client.id)
      .execute();

    return result;
  }
}
