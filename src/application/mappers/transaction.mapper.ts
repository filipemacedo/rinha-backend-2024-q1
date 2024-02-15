import { PostTransactionDTO } from "@application/dtos/transaction.dto";
import { IMapperDTO } from "@core/mapper-dto.interface";

export type TransactionMapperToDTOProps = {
  limit: number;
  balance: number;
};

export default class TransactionMapper
  implements IMapperDTO<TransactionMapperToDTOProps, PostTransactionDTO>
{
  toDTO(data: TransactionMapperToDTOProps): PostTransactionDTO {
    return {
      limite: data.limit,
      saldo: data.balance,
    };
  }
}
