import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import makeGetExtractController from "./factories/get-extract-controller.factory";
import makePostTransactionController from "./factories/post-transaction-controller.factory";
import { TransactionType } from "@infra/database/postgres/models/transaction";
import applicationConfig from "@config/application";

const getExtractController = makeGetExtractController();
const postTransactionController = makePostTransactionController();

const app = new Elysia()
  .onError(({ code, set }) => {
    if (code === "VALIDATION") {
      set.status = 422;

      return { message: "Invalid request" };
    }
  })
  .use(cors())
  .get("/", () => ({ message: "Welcome to Jungle!" }))
  .get("/health", () => ({ status: "ok" }))
  .get(
    "/clientes/:id/extrato",
    async ({ params, set }) => {
      try {
        const result = await getExtractController.handle({
          clientId: params.id,
        });

        if (result.statusCode) {
          set.status = result.statusCode;
          set.headers = {
            "Content-Type": "application/json",
          };
        }

        return result.body;
      } catch (error) {
        console.error(error);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({
        id: t.Any(),
      }),
    }
  )
  .post(
    "/clientes/:id/transacoes",
    async ({ params, body, set }) => {
      try {
        const result = await postTransactionController.handle({
          clientId: params.id,
          value: body.valor,
          type:
            body.tipo === "d" ? TransactionType.Debit : TransactionType.Credit,
          description: body.descricao,
        });

        if (result.statusCode) {
          set.status = result.statusCode;
          set.headers = {
            "Content-Type": "application/json",
          };
        }

        return result.body;
      } catch (error) {
        console.error(error);
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({
        id: t.Any(),
      }),
      body: t.Object({
        valor: t.Integer({
          minimum: 1,
        }),
        tipo: t.Enum({ c: "c", d: "d" }),
        descricao: t.String({
          maxLength: 10,
          minLength: 1,
        }),
      }),
    }
  )
  .listen(applicationConfig.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;

export default app;
