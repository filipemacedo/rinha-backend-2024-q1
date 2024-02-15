import { expect, describe, it } from "bun:test";
import { when, anything, verify, capture, instance } from "ts-mockito";
import { left, right } from "@core/either";
import { GetExtract } from "./get-extract.usecase";
import ClientNotFoundError from "./errors/client-not-found.error";
import { makeGetTransactionsRepositoryStub } from "@tests/stubs/repositories/get-transactions-repository.stub";
import { makeGetClientRepositoryStub } from "@tests/stubs/repositories/get-client-repository.stub";
import { makeGetBalanceRepositoryStub } from "@tests/stubs/repositories/get-balance-repository.stub";
import { makeExtractMapperDTOStub } from "@tests/stubs/mappers/extract-mapper.stub";

const makeSut = () => {
  const [getClientRepositoryStub, client] = makeGetClientRepositoryStub();
  const [getBalanceRepositoryStub, balance] = makeGetBalanceRepositoryStub();
  const [extractMapperStub, expectedExtract] = makeExtractMapperDTOStub();
  const [getTransactionsRepositoryStub, transactions] =
    makeGetTransactionsRepositoryStub();

  const sut = new GetExtract(
    instance(getTransactionsRepositoryStub),
    instance(getClientRepositoryStub),
    instance(getBalanceRepositoryStub),
    instance(extractMapperStub)
  );

  const data = {
    clientId: 1,
  };

  return {
    sut,
    data,
    extractMapperStub,
    getClientRepositoryStub,
    getBalanceRepositoryStub,
    expected: {
      client,
      transactions,
      balance,
      extract: expectedExtract,
    },
  };
};

describe("GetExtract", () => {
  it("should be able to call getClientRepository with correct params", async () => {
    const { sut, data, getClientRepositoryStub } = makeSut();

    await sut.execute(data);

    verify(getClientRepositoryStub.getClient(data.clientId)).called();
  });

  it("should be able to return a ClientNotFoundError if getClientRepository returns null", async () => {
    const { sut, data, getClientRepositoryStub } = makeSut();

    when(getClientRepositoryStub.getClient(anything())).thenResolve(null);

    const result = await sut.execute(data);

    expect(result).toEqual(left(new ClientNotFoundError()));
  });

  it("should be able to call getTransactionsRepository with correct params", async () => {
    const { sut, data, getClientRepositoryStub } = makeSut();

    await sut.execute(data);

    verify(getClientRepositoryStub.getClient(data.clientId)).called();
  });

  it("should be able to call getBalanceRepository with correct params", async () => {
    const { sut, data, getBalanceRepositoryStub, expected } = makeSut();

    await sut.execute(data);

    verify(getBalanceRepositoryStub.getBalance(expected.client)).called();
  });

  it("should be able to call extractMapper with correct params", async () => {
    const { sut, data, extractMapperStub, expected } = makeSut();

    await sut.execute(data);

    const [extract] = capture(extractMapperStub.toDTO).last();

    verify(extractMapperStub.toDTO(anything())).called();

    expect(extract).toEqual({
      client: {
        ...expected.client,
        ...expected.balance,
      },
      transactions: expected.transactions,
    });
  });

  it("should be able to return a right with the extract", async () => {
    const { sut, data, expected } = makeSut();

    const result = await sut.execute(data);

    expect(result).toEqual(right(expected.extract));
  });
});
