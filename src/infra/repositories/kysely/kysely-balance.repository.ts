import { Kysely, Transaction as DBTransaction, sql, Transaction } from "kysely";
import { DB } from "@infra/database/postgres/models";
import IBalanceRepository from "../balance-repository.interface";
import ISaveRepository from "../save-repository.interface";
import { Balance } from "@infra/database/postgres/models/balance";
import { BalanceOutput } from "../get-balance-repository.interface";
import { CreditOrDebitProps } from "../balance-operations-repository.interface";
import { Client } from "@infra/database/postgres/models/client";

export default class KyselyBalanceRepository
  implements IBalanceRepository, ISaveRepository<Balance>
{
  constructor(private readonly kysely: Kysely<DB>) {}

  async save(balance: Balance): Promise<Balance> {
    return this.kysely
      .insertInto("balances")
      .values({
        ...balance,
        id: undefined,
      } as unknown as Balance)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getBalance(
    client: Client,
    transaction?: DBTransaction<DB>
  ): Promise<BalanceOutput> {
    const trx = transaction || this.kysely;

    const [balance] = await trx
      .selectFrom("balances")
      .select(["value", sql`now()`.as(`checkedAt`)])
      .where("idClient", "=", client.id)
      .limit(1)
      .execute();

    return {
      balance: balance.value || 0,
      checkedAt: new Date(balance.checkedAt as Date) || new Date(),
      isSuccessful: !!balance,
    };
  }

  async lockBalance(client: Client, transaction: unknown): Promise<void> {
    await sql`SELECT pg_advisory_xact_lock(${client.id})`.execute(
      transaction as Transaction<DB>
    );
  }

  async credit(
    { client, amount }: CreditOrDebitProps,
    transaction: Transaction<DB>
  ): Promise<number> {
    return await this.addOrSubtractBalance({ client, amount }, transaction);
  }

  async debit(
    { client, amount }: CreditOrDebitProps,
    trx: Transaction<DB>
  ): Promise<number> {
    return await this.addOrSubtractBalance({ client, amount: -amount }, trx);
  }

  private async addOrSubtractBalance(
    { client, amount }: CreditOrDebitProps,
    transaction: Transaction<DB>
  ): Promise<number> {
    const [balance] = await transaction
      .updateTable("balances")
      .set({ value: sql`value + ${amount}` })
      .where("idClient", "=", client.id)
      .returning("value")
      .execute();

    return balance.value;
  }
}
