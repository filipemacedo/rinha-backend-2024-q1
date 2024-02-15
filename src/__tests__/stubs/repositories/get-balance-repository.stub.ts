import {
  BalanceOutput,
  IGetBalanceRepository,
} from "@infra/repositories/get-balance-repository.interface";
import { BalanceMockBuilder } from "@tests/mocks/balance.mock";
import { mock, when, anything } from "ts-mockito";

export function makeGetBalanceRepositoryStub(): [
  IGetBalanceRepository,
  BalanceOutput
] {
  const stub = mock<IGetBalanceRepository>();
  const balance = new BalanceMockBuilder().build();

  const expectedBalance = {
    balance: balance.value,
    checkedAt: new Date(),
    isSuccessful: true,
  };

  when(stub.getBalance(anything(), anything())).thenResolve(expectedBalance);
  when(stub.getBalance(anything())).thenResolve(expectedBalance);

  return [stub, expectedBalance];
}
