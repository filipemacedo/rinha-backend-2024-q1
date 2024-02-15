import { ExtractMapper } from "@application/mappers/extract.mapper";
import GetExtractController from "@application/usecases/get-extract/get-extract.controller";
import { GetExtract } from "@application/usecases/get-extract/get-extract.usecase";
import { kyselyDb } from "@infra/database/postgres/connection";
import KyselyBalanceRepository from "@infra/repositories/kysely/kysely-balance.repository";
import { KyselyClientRepository } from "@infra/repositories/kysely/kysely-clients.repository";
import KyselyTransactionsRepository from "@infra/repositories/kysely/kysely-transactions.repository";

export default function makeGetExtractController(): GetExtractController {
  return new GetExtractController(
    new GetExtract(
      new KyselyTransactionsRepository(kyselyDb),
      new KyselyClientRepository(kyselyDb),
      new KyselyBalanceRepository(kyselyDb),
      new ExtractMapper()
    )
  );
}
