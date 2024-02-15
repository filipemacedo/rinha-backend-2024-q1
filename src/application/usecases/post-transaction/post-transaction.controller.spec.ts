import { mock, when, anything, instance, verify, capture } from "ts-mockito";
import { left, right } from "@core/either";
import { IPostTransactionUseCase } from "./post-transaction.usecase";
import { TransactionMockBuilder } from "@tests/mocks/transaction.mock";
import { describe, expect, it } from "bun:test";
import PostTransactionController from "./post-transaction.controller";
import ClientNotFoundError from "./errors/client-not-found.error";
import InsufficientFundsError from "./errors/insufficient-funds.error";

const makeSut = () => {
  const useCaseStub = mock<IPostTransactionUseCase>();

  const result = {
    saldo: 0,
    limite: 0,
  };

  when(useCaseStub.execute(anything())).thenResolve(right(result));

  const transaction = new TransactionMockBuilder().build();

  const data = {
    ...transaction,
    clientId: transaction.idClient,
  };

  const sut = new PostTransactionController(instance(useCaseStub));

  return {
    sut,
    data,
    result,
    useCaseStub,
  };
};

describe("PostTransactionController", () => {
  it("should call use case with correct params", async () => {
    const { sut, data, useCaseStub } = makeSut();

    await sut.handle(data);

    const [calledParam] = capture(useCaseStub.execute).first();

    verify(useCaseStub.execute(anything())).called();
    expect(calledParam).toEqual({
      clientId: data.clientId,
      value: data.value,
      type: data.type,
      description: data.description,
    });
  });

  it("should return 200 on success", async () => {
    const { sut, data, result } = makeSut();

    const response = await sut.handle(data);

    expect(response).toEqual({
      statusCode: 200,
      body: result,
    });
  });

  it("should return 404 if use case returns a ClientNotFoundError", async () => {
    const { sut, useCaseStub, data } = makeSut();

    when(useCaseStub.execute(anything())).thenResolve(
      left(new ClientNotFoundError())
    );

    const response = await sut.handle(data);

    expect(response).toEqual({
      statusCode: 404,
      body: new ClientNotFoundError(),
    });
  });

  it("should return 500 if use case returns a generic error", async () => {
    const { sut, useCaseStub, data } = makeSut();

    when(useCaseStub.execute(anything())).thenResolve(left(new Error()));

    const response = await sut.handle(data);

    expect(response).toEqual({
      statusCode: 500,
      body: new Error(),
    });
  });

  it("should return 422 if use case returns an InsufficientFundsError", async () => {
    const { sut, useCaseStub, data } = makeSut();

    when(useCaseStub.execute(anything())).thenResolve(
      left(new InsufficientFundsError())
    );

    const response = await sut.handle(data);

    expect(response).toEqual({
      statusCode: 422,
      body: new InsufficientFundsError(),
    });
  });
});
