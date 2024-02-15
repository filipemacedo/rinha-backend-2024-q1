import IBalanceOperationsRepository from "@infra/repositories/balance-operations-repository.interface";
import { mock, when, anything } from "ts-mockito";

export function makeBalanceRepositoryStub(): [
  IBalanceOperationsRepository,
  number
] {
  const stub = mock<IBalanceOperationsRepository>();
  const creditOrDebitOutput = 100;

  when(stub.credit(anything(), anything())).thenResolve(creditOrDebitOutput);
  when(stub.debit(anything(), anything())).thenResolve(creditOrDebitOutput);

  return [stub, creditOrDebitOutput];
}
