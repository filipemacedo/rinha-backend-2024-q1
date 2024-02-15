import {
  Transaction,
  TransactionType,
} from "@infra/database/postgres/models/transaction";
import { faker } from "@faker-js/faker";
import KyselyTransactionsRepository from "@infra/repositories/kysely/kysely-transactions.repository";
import { kyselyDb } from "@infra/database/postgres/connection";

export class TransactionMockBuilder {
  private props: Transaction = {
    id: faker.number.int(),
    value: faker.number.int({
      min: 1,
      max: 1000,
    }),
    type: TransactionType.Credit,
    description: "loremipsum",
    idClient: faker.number.int({
      min: 1,
      max: 10,
    }),
    createdAt: new Date(),
  };

  withIdClient(idClient: number): TransactionMockBuilder {
    this.props.idClient = idClient;
    return this;
  }

  withType(type: TransactionType): TransactionMockBuilder {
    this.props.type = type;
    return this;
  }

  withValue(value: number): TransactionMockBuilder {
    this.props.value = value;
    return this;
  }

  withTypeCredit(): TransactionMockBuilder {
    this.props.type = TransactionType.Credit;
    return this;
  }

  withTypeDebit(): TransactionMockBuilder {
    this.props.type = TransactionType.Debit;
    return this;
  }

  withValueNegative(): TransactionMockBuilder {
    this.props.value = -1;
    return this;
  }

  build(): Transaction {
    return this.props;
  }

  async save(): Promise<Transaction> {
    return new KyselyTransactionsRepository(kyselyDb).save(this.props);
  }
}
