import { ExtractDTO } from "@application/dtos/extract.dto";
import { IMapperDTO } from "@core/mapper-dto.interface";
import { Client } from "@infra/database/postgres/models/client";
import { Transaction } from "@infra/database/postgres/models/transaction";

export type ExtractMapperToDTOProps = {
  client: Client & { balance: number; checkedAt: Date };
  transactions: Transaction[];
};

export class ExtractMapper
  implements IMapperDTO<ExtractMapperToDTOProps, ExtractDTO>
{
  public toDTO(data: ExtractMapperToDTOProps): ExtractDTO {
    return {
      saldo: {
        total: data.client.balance,
        data_extrato: data.client.checkedAt,
        limite: data.client.limit,
      },
      ultimas_transacoes: data.transactions.map((transaction) => ({
        valor: transaction.value,
        tipo: ExtractMapper.getType(transaction.type),
        descricao: transaction.description,
        realizada_em: transaction.createdAt,
      })),
    };
  }

  static getType(type: Transaction["type"]) {
    return type === "debit" ? "d" : "c";
  }
}
