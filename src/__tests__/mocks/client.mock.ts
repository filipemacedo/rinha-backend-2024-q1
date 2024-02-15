import { Client } from "@infra/database/postgres/models/client";
import { faker } from "@faker-js/faker";
import { kyselyDb } from "@infra/database/postgres/connection";
import { BalanceMockBuilder } from "./balance.mock";
import { TransactionMockBuilder } from "./transaction.mock";
import { TransactionType } from "@infra/database/postgres/models/transaction";
import { KyselyClientRepository } from "@infra/repositories/kysely/kysely-clients.repository";

type Props = Client;

type WithTransactionsProps = {
  value?: number;
  type: TransactionType;
  count: number;
};

export class ClientMockBuilder {
  private props: Props = {
    id: faker.number.int(),
    name: faker.person.firstName(),
    limit: 0,
  };

  private _balance: number = 0;
  private _transactions: TransactionMockBuilder[] = [];

  withName(name: string): ClientMockBuilder {
    this.props.name = name;
    return this;
  }

  withLimit(limit: number): ClientMockBuilder {
    this.props.limit = limit;
    return this;
  }

  withNegativeLimit(): ClientMockBuilder {
    this.props.limit = -1;

    return this;
  }

  withBalance(value: number): ClientMockBuilder {
    this._balance = value;
    return this;
  }

  withTransactions(props: WithTransactionsProps): ClientMockBuilder {
    const { value, type, count } = props;

    const transactions = Array.from({ length: count }).map(() =>
      new TransactionMockBuilder().withValue(value ?? 10).withType(type)
    );

    this._transactions = transactions;

    return this;
  }

  build(): Client {
    return this.props;
  }

  async save(): Promise<Client> {
    const client = await new KyselyClientRepository(kyselyDb).save({
      name: this.props.name,
      limit: this.props.limit,
      id: this.props.limit,
    });

    await Promise.all(
      this._transactions.map((transaction) =>
        transaction.withIdClient(client.id).save()
      )
    );

    await new BalanceMockBuilder()
      .withValue(this._balance ?? 0)
      .withIdClient(client.id)
      .save();

    return client;
  }
}
