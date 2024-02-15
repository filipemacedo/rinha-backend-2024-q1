import { ExtractDTO } from "@application/dtos/extract.dto";
import { ExtractMapperToDTOProps } from "@application/mappers/extract.mapper";
import { Either, isLeft, left, right } from "@core/either";
import { IMapperDTO } from "@core/mapper-dto.interface";
import IUseCase from "@core/usecase.interface";
import { IGetBalanceRepository } from "@infra/repositories/get-balance-repository.interface";
import IGetClientRepository from "@infra/repositories/get-client-repository.interface";
import IGetTransactionsRepository from "@infra/repositories/get-transactions-repository.interface";
import ClientNotFoundError from "./errors/client-not-found.error";

export type GetExtractInputDTO = {
  clientId: number;
};

export type GetExtractOutputDTO = Either<Error, ExtractDTO>;

export interface IGetExtractUseCase
  extends IUseCase<GetExtractInputDTO, GetExtractOutputDTO> {}

export class GetExtract implements IGetExtractUseCase {
  constructor(
    private readonly getTransactionsRepository: IGetTransactionsRepository,
    private readonly getClientRepository: IGetClientRepository,
    private readonly getBalanceRepository: IGetBalanceRepository,
    private readonly extractMapper: IMapperDTO<
      ExtractMapperToDTOProps,
      ExtractDTO
    >
  ) {}

  async execute({ clientId }: GetExtractInputDTO) {
    const clientResult = await this.getClient(clientId);

    if (isLeft(clientResult)) {
      return clientResult;
    }

    const client = clientResult.right;

    const [lastTransactions, balanceResult] = await Promise.all([
      this.getTransactionsRepository.getLastTransactions(client),
      this.getBalanceRepository.getBalance(client),
    ]);

    const extract = this.extractMapper.toDTO({
      client: {
        ...clientResult.right,
        ...balanceResult,
      },
      transactions: lastTransactions,
    });

    return right(extract);
  }

  private async getClient(clientId: number) {
    const client = await this.getClientRepository.getClient(clientId);

    if (!client) {
      return left(new ClientNotFoundError());
    }

    return right(client);
  }
}
