import { instance, verify, when, anything, capture } from "ts-mockito";
import { isLeft, isRight } from "@core/either";
import { TransactionMockBuilder } from "@tests/mocks/transaction.mock";
import { makeTransactionMapperDTOStub } from "@tests/stubs/mappers/transaction-mapper.stub";
import { makeBalanceRepositoryStub } from "@tests/stubs/repositories/balance-repository.stub";
import { makeGetClientRepositoryStub } from "@tests/stubs/repositories/get-client-repository.stub";
import { PostTransaction } from "./post-transaction.usecase";
import { describe, expect, it } from "bun:test";
import ClientNotFoundError from "./errors/client-not-found.error";
import InsufficientFundsError from "./errors/insufficient-funds.error";
import { makeSaveTransactionRepositoryStub } from "@tests/stubs/repositories/save-transaction-repository.stub";
import { makeDatabaseTransactionProviderStub } from "@tests/stubs/providers/database-transaction-provider.stub";
import { makeGetBalanceRepositoryStub } from "@tests/stubs/repositories/get-balance-repository.stub";
import { ClientMockBuilder } from "@tests/mocks/client.mock";

type Overrides = {
  client?: ClientMockBuilder;
  transaction?: TransactionMockBuilder;
};

const makeSut = (overrides: Overrides = {}) => {
  const [getClientRepositoryStub, client] =
    makeGetClientRepositoryStub(overrides);
  const [getBalanceRepositoryStub, balance] = makeGetBalanceRepositoryStub();
  const [balanceRepositoryStub, operationsOutput] = makeBalanceRepositoryStub();
  const [saveTransactionRepositoryStub] = makeSaveTransactionRepositoryStub();
  const [databaseTransactionProviderStub] =
    makeDatabaseTransactionProviderStub();
  const [transactionMapperStub, transactionDTO] =
    makeTransactionMapperDTOStub();

  const transaction = (
    overrides?.transaction ?? new TransactionMockBuilder()
  ).build();

  const sut = new PostTransaction(
    instance(getClientRepositoryStub),
    instance(balanceRepositoryStub),
    instance(getBalanceRepositoryStub),
    instance(databaseTransactionProviderStub),
    instance(saveTransactionRepositoryStub),
    instance(transactionMapperStub)
  );

  const data = {
    ...transaction,
    clientId: client.id,
  };

  return {
    sut,
    data,
    getClientRepositoryStub,
    getBalanceRepositoryStub,
    balanceOperationsRepositoryStub: balanceRepositoryStub,
    expected: {
      client,
      balance,
      transactionDTO,
      operationsOutput,
      transaction,
    },
  };
};

describe("PostTransaction", () => {
  it("should be able to return a TransactionPostDTO on success", async () => {
    const { sut, data, expected } = makeSut();

    const result = await sut.execute(data);

    if (isLeft(result)) {
      throw new Error("Expected right");
    }

    expect(isRight(result)).toBeTruthy();
    expect(result.right).toEqual(expected.transactionDTO);
  });

  it("should be able to call getClientRepository with correct params", async () => {
    const { sut, data, getClientRepositoryStub } = makeSut();

    await sut.execute(data);

    verify(getClientRepositoryStub.getClient(data.clientId)).called();
  });

  it("should be able to return a ClientNotFoundError if getClientRepository returns null", async () => {
    const { sut, data, getClientRepositoryStub } = makeSut();

    when(getClientRepositoryStub.getClient(data.clientId)).thenResolve(null);

    const result = await sut.execute(data);

    if (isRight(result)) {
      throw new Error("Expected left");
    }

    expect(isLeft(result)).toBeTruthy();
    expect(result.left).toBeInstanceOf(ClientNotFoundError);
  });

  it("should be able to call balanceRepository.debit with correct params", async () => {
    const { sut, balanceOperationsRepositoryStub, expected, data } = makeSut({
      client: new ClientMockBuilder().withLimit(100),
      transaction: new TransactionMockBuilder().withValue(100).withTypeDebit(),
    });

    await sut.execute(data);

    const [callParam] = capture(balanceOperationsRepositoryStub.debit).first();

    verify(
      balanceOperationsRepositoryStub.debit(anything(), anything())
    ).called();
    expect(callParam).toEqual({
      client: expected.client,
      amount: expected.transaction.value,
    });
  });

  it("should be able to call balanceRepository.credit with correct params", async () => {
    const { sut, balanceOperationsRepositoryStub, data, expected } = makeSut();

    await sut.execute(data);

    const [callParam] = capture(balanceOperationsRepositoryStub.credit).first();

    verify(
      balanceOperationsRepositoryStub.credit(anything(), anything())
    ).called();
    expect(callParam).toEqual({
      client: expected.client,
      amount: data.value,
    });
  });

  it("should be able to call balanceRepository.credit with correct params when the value is negative", async () => {
    const { sut, balanceOperationsRepositoryStub, expected, data } = makeSut({
      transaction: new TransactionMockBuilder()
        .withTypeCredit()
        .withValueNegative(),
    });

    await sut.execute(data);

    const [callParam] = capture(balanceOperationsRepositoryStub.credit).first();

    verify(
      balanceOperationsRepositoryStub.credit(anything(), anything())
    ).called();
    expect(callParam).toEqual({
      client: expected.client,
      amount: Math.abs(expected.transaction.value),
    });
  });

  it("should be able to return InsufficientFundsError if the client has insufficient funds", async () => {
    const { sut, getBalanceRepositoryStub, data } = makeSut({
      transaction: new TransactionMockBuilder().withValue(100).withTypeDebit(),
    });

    when(
      getBalanceRepositoryStub.getBalance(anything(), anything())
    ).thenResolve({
      balance: 0,
      checkedAt: new Date(),
      isSuccessful: true,
    });

    const result = await sut.execute(data);

    if (isRight(result)) {
      throw new Error("Expected left because of insufficient funds");
    }

    expect(isLeft(result)).toBeTruthy();
    expect(result.left).toBeInstanceOf(InsufficientFundsError);
  });
});
