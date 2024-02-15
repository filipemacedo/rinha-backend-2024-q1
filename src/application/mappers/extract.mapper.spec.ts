import { BalanceMockBuilder } from "@tests/mocks/balance.mock";
import { ClientMockBuilder } from "@tests/mocks/client.mock";
import { TransactionMockBuilder } from "@tests/mocks/transaction.mock";
import { ExtractMapper, ExtractMapperToDTOProps } from "./extract.mapper";
import { describe, expect, it } from "bun:test";
import { TransactionType } from "@infra/database/postgres/models/transaction";

const makeSut = () => {
  const client = new ClientMockBuilder().build();
  const balance = new BalanceMockBuilder().build();
  const transaction = new TransactionMockBuilder().withTypeCredit().build();

  const sut = new ExtractMapper();

  const data: ExtractMapperToDTOProps = {
    client: {
      ...client,
      balance: balance.value,
      checkedAt: balance.createdAt,
    },
    transactions: [transaction],
  };

  return {
    sut,
    data,
    expected: {
      balance,
      client,
      transaction,
    },
  };
};

describe("ExtractMapper", () => {
  it("should be able to return a ExtractDTO when transaction is credit", () => {
    const { sut, data, expected } = makeSut();

    const result = sut.toDTO(data);

    expect(result).toEqual({
      saldo: {
        total: expected.balance.value,
        data_extrato: expected.balance.createdAt,
        limite: expected.client.limit,
      },
      ultimas_transacoes: [
        {
          valor: expected.transaction.value,
          tipo: "c",
          descricao: expected.transaction.description,
          realizada_em: expected.transaction.createdAt,
        },
      ],
    });
  });

  it("should be able to return a ExtractDTO when transaction is debit", () => {
    const { sut, data, expected } = makeSut();

    const transaction = new TransactionMockBuilder().withTypeDebit().build();

    const result = sut.toDTO({ ...data, transactions: [transaction] });

    expect(result).toEqual({
      saldo: {
        total: expected.balance.value,
        data_extrato: expected.balance.createdAt,
        limite: expected.client.limit,
      },
      ultimas_transacoes: [
        {
          valor: transaction.value,
          tipo: "d",
          descricao: transaction.description,
          realizada_em: transaction.createdAt,
        },
      ],
    });
  });

  it("should be able to return `c` when transaction type is credit", () => {
    const result = ExtractMapper.getType(TransactionType.Credit);

    expect(result).toBe("c");
  });

  it("should be able to return `d` when transaction type is debit", () => {
    const result = ExtractMapper.getType(TransactionType.Debit);

    expect(result).toBe("d");
  });
});
