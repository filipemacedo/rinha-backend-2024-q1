import "@infra/http/server";
import { describe, expect, it } from "bun:test";
import getApp from "./helpers/get-app.helper";
import {
  PostTransactionDTO,
  TransactionType,
} from "@application/dtos/transaction.dto";
import { ClientMockBuilder } from "@tests/mocks/client.mock";
import { kyselyDb } from "@infra/database/postgres/connection";
import KyselyBalanceRepository from "@infra/repositories/kysely/kysely-balance.repository";

type Overrides = {
  client?: ClientMockBuilder;
};

const makeSut = async (overrides?: Overrides) => {
  const app = getApp();

  const client = await (overrides?.client ?? new ClientMockBuilder()).save();

  const sut = app.clientes[client.id].transacoes.post;

  const data = {
    valor: 1000,
    tipo: "c" as TransactionType,
    descricao: "Depósito",
  };

  return { sut, data, app, client };
};

describe("POST /clientes/:id/transacoes", () => {
  describe("validations", () => {
    it("should be able to return 422 if the value is not provided", async () => {
      const { sut, data } = await makeSut();

      const response = await sut({ ...data, valor: undefined } as any);

      expect(response.status).toBe(422);
    });

    it("should be able to return 422 if the type is not provided", async () => {
      const { sut, data } = await makeSut();

      const response = await sut({ ...data, tipo: undefined } as any);

      expect(response.status).toBe(422);
    });

    it("should be able to return 422 if the description is not provided", async () => {
      const { sut, data } = await makeSut();

      const response = await sut({ ...data, descricao: undefined } as any);

      expect(response.status).toBe(422);
    });

    it("should be able to return 422 if the description is greater than 10 characters", async () => {
      const { sut, data } = await makeSut();

      const response = await sut({
        ...data,
        descricao: "12345678901",
      });

      expect(response.status).toBe(422);
    });

    it("should be able to return 422 if the value is negative", async () => {
      const { sut, data } = await makeSut();

      const response = await sut({ ...data, valor: -1 });

      expect(response.status).toBe(422);
    });

    it("should be able to return 422 if the value is zero", async () => {
      const { sut, data } = await makeSut();

      const response = await sut({ ...data, valor: 0 });

      expect(response.status).toBe(422);
    });

    it("should be able to return 422 if the type is invalid", async () => {
      const { sut, data } = await makeSut();

      const response = await sut({ ...data, tipo: "invalid" } as any);

      expect(response.status).toBe(422);
    });
  });

  describe("credit", () => {
    it("should be able to credit the client's balance", async () => {
      const { sut, data, client } = await makeSut({
        client: new ClientMockBuilder().withLimit(0),
      });

      const response = await sut(data);

      const result = response.data as PostTransactionDTO;

      expect(response.status).toBe(200);
      expect(result.saldo).toBe(1000);
      expect(result.limite).toBe(client.limit);
    });
  });

  describe("debit", () => {
    it("should be able to debit the client's balance", async () => {
      const { sut, data, client } = await makeSut({
        client: new ClientMockBuilder().withLimit(1000),
      });

      const response = await sut({ ...data, tipo: "d" });

      const result = response.data as PostTransactionDTO;

      expect(response.status).toBe(200);
      expect(result.saldo).toBe(-1000);
      expect(result.limite).toBe(client.limit);
    });

    it("should be able to return 422 if the client's limit is exceeded", async () => {
      const { sut, data } = await makeSut({
        client: new ClientMockBuilder().withLimit(0),
      });

      const response = await sut({ ...data, tipo: "d", valor: 1 });

      expect(response.status).toBe(422);
    });
  });

  it("should be able to return 404 if the client does not exist", async () => {
    const { sut, data, client } = await makeSut();

    await kyselyDb.deleteFrom("clients").where("id", "=", client.id).execute();

    const response = await sut(data);

    expect(response.status).toBe(404);
  });

  describe("ensure the race condition", () => {
    it.each(["c", "d"])(
      `should be able to return the expected balance during concurrent %s transactions`,
      async (type) => {
        const { sut, data, client } = await makeSut({
          client: new ClientMockBuilder().withLimit(10000),
        });

        const promises = Array.from({ length: 10 }, () =>
          sut({ ...data, tipo: type as TransactionType })
        );

        const responses = await Promise.all(promises);

        const statuses = responses.map((response) => response.status);

        const balance = await new KyselyBalanceRepository(kyselyDb).getBalance(
          client
        );

        expect(statuses).toEqual(Array.from({ length: 10 }, () => 200));
        expect(balance.balance).toBe(type === "c" ? 10000 : -10000);
      }
    );
  });
});
