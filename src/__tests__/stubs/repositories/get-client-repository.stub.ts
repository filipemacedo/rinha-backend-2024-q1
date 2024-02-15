import { Client } from "@infra/database/postgres/models/client";
import IGetClientRepository from "@infra/repositories/get-client-repository.interface";
import { ClientMockBuilder } from "@tests/mocks/client.mock";
import { mock, when, anything } from "ts-mockito";

type Overrides = {
  client?: ClientMockBuilder;
};

export function makeGetClientRepositoryStub(
  overrides?: Overrides
): [IGetClientRepository, Client] {
  const stub = mock<IGetClientRepository>();

  const expectedClient = (overrides?.client ?? new ClientMockBuilder()).build();

  when(stub.getClient(anything())).thenResolve(expectedClient);

  return [stub, expectedClient];
}
