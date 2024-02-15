import { Client } from "@infra/database/postgres/models/client";

export type BalanceOutput = {
  balance: number;
  checkedAt: Date;
  isSuccessful: boolean;
};

export interface IGetBalanceRepository {
  getBalance(client: Client, transaction?: unknown): Promise<BalanceOutput>;
}
