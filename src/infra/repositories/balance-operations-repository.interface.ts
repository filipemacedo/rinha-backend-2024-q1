import { Client } from "@infra/database/postgres/models/client";

export type CreditOrDebitProps = {
  client: Client;
  amount: number;
};

export default interface IBalanceOperationsRepository {
  lockBalance(clientId: Client, transaction: unknown): Promise<void>;
  credit(props: CreditOrDebitProps, transaction?: unknown): Promise<number>;
  debit(props: CreditOrDebitProps, transaction?: unknown): Promise<number>;
}
