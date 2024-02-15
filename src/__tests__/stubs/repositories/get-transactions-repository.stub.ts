import { Transaction } from "@infra/database/postgres/models/transaction";
import IGetTransactionsRepository from "@infra/repositories/get-transactions-repository.interface";
import { TransactionMockBuilder } from "@tests/mocks/transaction.mock";
import { mock, when, anything } from "ts-mockito";

export function makeGetTransactionsRepositoryStub(): [
  IGetTransactionsRepository,
  Transaction[]
] {
  const stub = mock<IGetTransactionsRepository>();

  const expectedTransactions = [new TransactionMockBuilder().build()];

  when(stub.getLastTransactions(anything())).thenResolve(expectedTransactions);

  return [stub, expectedTransactions];
}
