import "@infra/http/server";
import { describe, expect, it } from "bun:test";
import getApp from "./helpers/get-app.helper";
import { ClientMockBuilder } from "@tests/mocks/client.mock";
import { ExtractDTO } from "@application/dtos/extract.dto";
import { ExtractMapper } from "@application/mappers/extract.mapper";
import { kyselyDb } from "@infra/database/postgres/connection";
import { TransactionType } from "@infra/database/postgres/models/transaction";

type Overrides = {
  client?: ClientMockBuilder;
};

const makeSut = async (overrides?: Overrides) => {
  const app = getApp();

  const client = await (overrides?.client ?? new ClientMockBuilder()).save();

  const sut = app.clientes[client.id].extrato.get;

  return { sut, client };
};

describe("GET /clientes/:id/extrato", () => {
  it("should return 200 and the client's extract with a credit transaction", async () => {
    const { sut, client } = await makeSut({
      client: new ClientMockBuilder()
        .withBalance(1000)
        .withTransactions({
          type: TransactionType.Credit,
          value: 1000,
          count: 1,
        })
        .withLimit(1000),
    });

    const response = await sut();

    const result = response.data as ExtractDTO;

    expect(response.status).toBe(200);
    expect(result.saldo.total).toBe(1000);
    expect(result.saldo.limite).toBe(client.limit);
    expect(result.ultimas_transacoes.length).toBe(1);
    expect(result.ultimas_transacoes[0].valor).toBe(1000);
    expect(result.ultimas_transacoes[0].tipo).toBe(
      ExtractMapper.getType(TransactionType.Credit)
    );
  });

  it("should return 200 and the client's extract with a debit transaction", async () => {
    const { sut, client } = await makeSut({
      client: new ClientMockBuilder()
        .withBalance(-1000)
        .withTransactions({
          type: TransactionType.Debit,
          value: 1000,
          count: 1,
        })
        .withLimit(1000),
    });

    const response = await sut();

    const result = response.data as ExtractDTO;

    expect(response.status).toBe(200);
    expect(result.saldo.total).toBe(-1000);
    expect(result.saldo.limite).toBe(client.limit);
    expect(result.ultimas_transacoes.length).toBe(1);
    expect(result.ultimas_transacoes[0].valor).toBe(1000);
    expect(result.ultimas_transacoes[0].tipo).toBe(
      ExtractMapper.getType(TransactionType.Debit)
    );
  });

  it("should return only the last 10 transactions", async () => {
    const { sut } = await makeSut({
      client: new ClientMockBuilder()
        .withTransactions({
          type: TransactionType.Credit,
          value: 1000,
          count: 15,
        })
        .withLimit(1000),
    });

    const response = await sut();

    const result = response.data as ExtractDTO;

    expect(response.status).toBe(200);
    expect(result.ultimas_transacoes.length).toBe(10);
  });

  it("should be able to return 404 if the client does not exist", async () => {
    const { sut, client } = await makeSut();

    await kyselyDb.deleteFrom("clients").where("id", "=", client.id).execute();

    const response = await sut();

    expect(response.status).toBe(404);
  });
});
