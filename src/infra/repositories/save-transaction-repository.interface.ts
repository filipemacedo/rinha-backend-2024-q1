import { Transaction as TransactionModel } from "@infra/database/postgres/models/transaction";

export type Transaction = Omit<TransactionModel, "id"> & {
  id?: number;
};

export default interface ISaveTransactionRepository {
  save(
    transaction: Transaction,
    databaseTransaction?: unknown
  ): Promise<Transaction>;
}
