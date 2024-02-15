import IDatabaseTransaction from "@infra/providers/database-transaction.interface";
import { mock, when, anything } from "ts-mockito";

export function makeDatabaseTransactionProviderStub(): [
  IDatabaseTransaction,
  void
] {
  const stub = mock<IDatabaseTransaction>();

  when(stub.transaction(anything())).thenCall((callback) => {
    return callback(undefined);
  });

  return [stub, undefined];
}
