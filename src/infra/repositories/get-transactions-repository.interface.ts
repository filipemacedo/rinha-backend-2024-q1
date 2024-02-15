import { Client } from "@infra/database/postgres/models/client";
import { Transaction } from "@infra/database/postgres/models/transaction";

export type GetTransactionsOptions = {
  limit?: number;
};

export default interface IGetTransactionsRepository {
  getLastTransactions(client: Client): Promise<Transaction[]>;
}
