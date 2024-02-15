import { Client } from "@infra/database/postgres/models/client";
import IGetClientRepository from "../get-client-repository.interface";
import { Kysely } from "kysely";
import { DB } from "@infra/database/postgres/models";
import ISaveRepository from "../save-repository.interface";

export class KyselyClientRepository
  implements IGetClientRepository, ISaveRepository<Client>
{
  constructor(private readonly kyselyDb: Kysely<DB>) {}

  async save(client: Client): Promise<Client> {
    return this.kyselyDb
      .insertInto("clients")
      .values({
        ...client,
        id: undefined,
      } as unknown as Client)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getClient(clientId: number): Promise<Client | null> {
    const client = await this.kyselyDb
      .selectFrom("clients")
      .selectAll()
      .where("id", "=", clientId)
      .executeTakeFirst();

    if (!client) {
      return null;
    }

    return client;
  }
}
