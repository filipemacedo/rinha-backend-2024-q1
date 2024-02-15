import { TransactionType as ETransactionType } from "@infra/database/postgres/models/transaction";
import { Either, isLeft, left, right } from "@core/either";
import IUseCase from "@core/usecase.interface";
import { Client } from "@infra/database/postgres/models/client";
import IGetClientRepository from "@infra/repositories/get-client-repository.interface";
import InsufficientFundsError from "./errors/insufficient-funds.error";
import ClientNotFoundError from "./errors/client-not-found.error";
import { IMapperDTO } from "@core/mapper-dto.interface";
import { TransactionMapperToDTOProps } from "@application/mappers/transaction.mapper";
import { PostTransactionDTO } from "@application/dtos/transaction.dto";
import IDatabaseTransaction from "@infra/providers/database-transaction.interface";
import ISaveTransactionRepository from "@infra/repositories/save-transaction-repository.interface";
import IBalanceOperationsRepository from "@infra/repositories/balance-operations-repository.interface";
import { IGetBalanceRepository } from "@infra/repositories/get-balance-repository.interface";

export type PostTransactionInputDTO = {
  clientId: number;
  value: number;
  type: ETransactionType;
  description: string;
};

export type PostTransactionOutputDTO = PostTransactionDTO;

type PerformTransactionProps = Omit<PostTransactionInputDTO, "clientId"> & {
  client: Client;
};

type PossibleErrors = ClientNotFoundError | InsufficientFundsError;

type CreditOrDebitTransactionProps = Pick<
  PerformTransactionProps,
  "client" | "value"
>;

export interface IPostTransactionUseCase
  extends IUseCase<
    PostTransactionInputDTO,
    Either<PossibleErrors, PostTransactionOutputDTO>
  > {}

export class PostTransaction implements IPostTransactionUseCase {
  constructor(
    private readonly clientRepository: IGetClientRepository,
    private readonly balanceOpetarionsRepository: IBalanceOperationsRepository,
    private readonly getBalanceRepository: IGetBalanceRepository,
    private readonly databaseTransaction: IDatabaseTransaction,
    private readonly saveTransactionRepository: ISaveTransactionRepository,
    private readonly transactionMapper: IMapperDTO<
      TransactionMapperToDTOProps,
      PostTransactionDTO
    >
  ) {}

  async execute({
    clientId,
    value,
    type,
    description,
  }: PostTransactionInputDTO): Promise<
    Either<PossibleErrors, PostTransactionOutputDTO>
  > {
    const clientResult = await this.getClient(clientId);

    if (isLeft(clientResult)) {
      return left(clientResult.left);
    }

    const client = clientResult.right;

    const performTransactionResult = await this.performTransaction({
      client,
      value: Math.abs(value),
      type,
      description,
    });

    if (isLeft(performTransactionResult)) {
      return left(performTransactionResult.left);
    }

    const dto = this.transactionMapper.toDTO(performTransactionResult.right);

    return right(dto);
  }

  private async performTransaction({
    client,
    value,
    type,
    description,
  }: PerformTransactionProps) {
    try {
      const balance = await this.databaseTransaction.transaction(
        async (trx) => {
          await this.balanceOpetarionsRepository.lockBalance(client, trx);

          const debitOrCreditResult = await this[type]({ client, value }, trx);

          if (isLeft(debitOrCreditResult)) {
            // we're throwing the error to rollback the transaction
            throw debitOrCreditResult.left;
          }

          await this.saveTransactionRepository.save(
            {
              idClient: client.id,
              value,
              type,
              description,
              createdAt: new Date(),
            },
            trx
          );

          return debitOrCreditResult.right;
        }
      );

      return right({ balance, limit: client.limit });
    } catch (error) {
      return left(error as Error);
    }
  }

  private async debit(
    { client, value }: CreditOrDebitTransactionProps,
    trx: unknown
  ) {
    const { balance } = await this.getBalanceRepository.getBalance(
      client,
      trx
    );

    if (balance - value < -client.limit) {
      return left(new InsufficientFundsError());
    }

    const newBalance = await this.balanceOpetarionsRepository.debit(
      { client, amount: value },
      trx
    );

    return right(newBalance);
  }

  private async credit(
    { client, value }: CreditOrDebitTransactionProps,
    trx: unknown
  ) {
    const balance = this.balanceOpetarionsRepository.credit(
      { client, amount: value },
      trx
    );

    return right(balance);
  }

  private async getClient(clientId: number): Promise<Either<Error, Client>> {
    const client = await this.clientRepository.getClient(clientId);

    if (!client) {
      return left(new ClientNotFoundError());
    }

    return right(client);
  }
}
