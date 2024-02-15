import { expect, test, describe } from "bun:test";
import { mock, instance, when, anything } from "ts-mockito";
import { left, right } from "@core/either";
import GetExtractController from "./get-extract.controller";
import { IGetExtractUseCase } from "./get-extract.usecase";
import ClientNotFoundError from "./errors/client-not-found.error";

const makeSut = () => {
  const responseDTO = {
    saldo: {
      total: 0,
      data_extrato: new Date(),
      limite: 0,
    },
    ultimas_transacoes: [],
  };

  const stubGetExtractUseCase = mock<IGetExtractUseCase>();

  when(stubGetExtractUseCase.execute(anything())).thenResolve(
    right(responseDTO)
  );

  const data = {
    clientId: 1,
  };

  return {
    sut: new GetExtractController(instance(stubGetExtractUseCase)),
    stubGetExtractUseCase,
    data,
    responseDTO,
  };
};

describe("GetExtractController", () => {
  test("should return 200 on success", async () => {
    const { sut, data, responseDTO } = makeSut();

    const response = await sut.handle(data);

    expect(response).toEqual({
      statusCode: 200,
      body: responseDTO,
    });
  });

  test("should return 404 if use case returns a ClientNotFoundError", async () => {
    const { sut, stubGetExtractUseCase, data } = makeSut();

    when(stubGetExtractUseCase.execute(anything())).thenResolve(
      left(new ClientNotFoundError())
    );

    const response = await sut.handle(data);

    expect(response).toEqual({
      statusCode: 404,
      body: new ClientNotFoundError(),
    });
  });

  test("should return 500 if use case returns an error", async () => {
    const { sut, stubGetExtractUseCase, data } = makeSut();

    when(stubGetExtractUseCase.execute(anything())).thenResolve(
      left(new Error())
    );

    const response = await sut.handle(data);

    expect(response).toEqual({
      statusCode: 500,
      body: new Error(),
    });
  });
});
