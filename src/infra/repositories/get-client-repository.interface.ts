import { Client } from "@infra/database/postgres/models/client";

export default interface IGetClientRepository {
  getClient(clientId: number): Promise<Client | null>;
}
