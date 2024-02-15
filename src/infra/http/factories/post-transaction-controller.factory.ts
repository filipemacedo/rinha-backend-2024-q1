import TransactionMapper from "@application/mappers/transaction.mapper";
import PostTransactionController from "@application/usecases/post-transaction/post-transaction.controller";
import { PostTransaction } from "@application/usecases/post-transaction/post-transaction.usecase";
import { kyselyDb } from "@infra/database/postgres/connection";
import KyselyDatabaseTransaction from "@infra/providers/database-transaction/KyselyDatabaseTransaction";
import KyselyBalanceRepository from "@infra/repositories/kysely/kysely-balance.repository";
import { KyselyClientRepository } from "@infra/repositories/kysely/kysely-clients.repository";
import KyselyTransactionsRepository from "@infra/repositories/kysely/kysely-transactions.repository";

export default function makePostTransactionController(): PostTransactionController {
  return new PostTransactionController(
    new PostTransaction(
      new KyselyClientRepository(kyselyDb),
      new KyselyBalanceRepository(kyselyDb),
      new KyselyBalanceRepository(kyselyDb),
      new KyselyDatabaseTransaction(),
      new KyselyTransactionsRepository(kyselyDb),
      new TransactionMapper()
    )
  );
}
