import { ExtractDTO } from "@application/dtos/extract.dto";
import { TransactionType } from "@application/dtos/transaction.dto";
import { ExtractMapperToDTOProps } from "@application/mappers/extract.mapper";
import { IMapperDTO } from "@core/mapper-dto.interface";
import { BalanceMockBuilder } from "@tests/mocks/balance.mock";
import { ClientMockBuilder } from "@tests/mocks/client.mock";
import { TransactionMockBuilder } from "@tests/mocks/transaction.mock";
import { mock, when, anything } from "ts-mockito";

export function makeExtractMapperDTOStub(): [
  IMapperDTO<ExtractMapperToDTOProps, ExtractDTO>,
  ExtractDTO
] {
  const stub = mock<IMapperDTO<ExtractMapperToDTOProps, ExtractDTO>>();
  const balance = new BalanceMockBuilder().build();
  const client = new ClientMockBuilder().build();
  const transaction = new TransactionMockBuilder().build();

  const expectedExtract = {
    saldo: {
      total: balance.value,
      data_extrato: new Date(),
      limite: client.limit,
    },
    ultimas_transacoes: [
      {
        id: transaction.id,
        valor: transaction.value,
        tipo: (transaction.type === "credit" ? "c" : "d") as TransactionType,
        descricao: transaction.description,
        realizada_em: transaction.createdAt,
      },
    ],
  };

  when(stub.toDTO(anything())).thenReturn(expectedExtract);

  return [stub, expectedExtract];
}
