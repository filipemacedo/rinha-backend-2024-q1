import { ClientMockBuilder } from "@tests/mocks/client.mock";
import TransactionMapper from "./transaction.mapper";
import { BalanceMockBuilder } from "@tests/mocks/balance.mock";
import { describe, expect, it } from "bun:test";

const makeSut = () => {
  const sut = new TransactionMapper();

  const client = new ClientMockBuilder().build();
  const balance = new BalanceMockBuilder().build();

  const data = {
    limit: client.limit,
    balance: balance.value,
  };

  return {
    sut,
    data,
    expected: {
      client,
      balance,
    },
  };
};

describe("TransactionMapper", () => {
  it("should be able to return a TransactionDTO", () => {
    const { sut, data, expected } = makeSut();

    const result = sut.toDTO(data);

    expect(result).toEqual({
      limite: expected.client.limit,
      saldo: expected.balance.value,
    });
  });
});
