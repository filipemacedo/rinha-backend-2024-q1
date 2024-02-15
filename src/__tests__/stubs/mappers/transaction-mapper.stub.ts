import { PostTransactionDTO } from "@application/dtos/transaction.dto";
import { IMapperDTO } from "@core/mapper-dto.interface";
import { TransactionMapperToDTOProps } from "@application/mappers/transaction.mapper";
import { mock, when, anything } from "ts-mockito";

export function makeTransactionMapperDTOStub(): [
  IMapperDTO<TransactionMapperToDTOProps, PostTransactionDTO>,
  PostTransactionDTO
] {
  const stub =
    mock<IMapperDTO<TransactionMapperToDTOProps, PostTransactionDTO>>();

  const expectedTransaction = {
    limite: 100,
    saldo: 100,
  };

  when(stub.toDTO(anything())).thenReturn(expectedTransaction);

  return [stub, expectedTransaction];
}
