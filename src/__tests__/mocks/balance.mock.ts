import { Balance } from "@infra/database/postgres/models/balance";
import { faker } from "@faker-js/faker";
import ISaveRepository from "@infra/repositories/save-repository.interface";
import KyselyBalanceRepository from "@infra/repositories/kysely/kysely-balance.repository";
import { kyselyDb } from "@infra/database/postgres/connection";

export class BalanceMockBuilder {
  private props: Balance = {
    id: faker.number.int({
      min: 1,
      max: 1000,
    }),
    idClient: faker.number.int({
      min: 1,
      max: 10,
    }),
    value: faker.number.int({
      min: 1,
      max: 1000,
    }),
    createdAt: new Date(),
  };

  withIdClient(idClient: number): BalanceMockBuilder {
    this.props.idClient = idClient;
    return this;
  }

  withValue(value: number): BalanceMockBuilder {
    this.props.value = value;
    return this;
  }

  build(): Balance {
    return this.props;
  }

  save(): Promise<Balance> {
    return new KyselyBalanceRepository(kyselyDb).save(this.props);
  }
}
