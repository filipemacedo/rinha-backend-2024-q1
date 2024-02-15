import { Transaction } from "@infra/database/postgres/models/transaction";
import ISaveTransactionRepository from "@infra/repositories/save-transaction-repository.interface";
import { TransactionMockBuilder } from "@tests/mocks/transaction.mock";
import { mock, when, anything } from "ts-mockito";

export function makeSaveTransactionRepositoryStub(): [ISaveTransactionRepository, Transaction] {
  const stub = mock<ISaveTransactionRepository>();

  const expectedTransaction = new TransactionMockBuilder().build();

  when(stub.save(anything())).thenResolve(expectedTransaction);

  return [stub, expectedTransaction];
}