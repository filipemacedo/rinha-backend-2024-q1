import { Balance } from "@infra/database/postgres/models/balance";
import { faker } from "@faker-js/faker";
import ISaveRepository from "@infra/repositories/save-repository.interface";

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

  save(repository: ISaveRepository<Balance>): Promise<Balance> {
    return repository.save(this.props);
  }
}
