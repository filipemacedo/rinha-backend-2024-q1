import { IGetBalanceRepository } from "./get-balance-repository.interface";
import IBalanceOperationsRepository from "./balance-operations-repository.interface";

export default interface IBalanceRepository
  extends IGetBalanceRepository,
    IBalanceOperationsRepository {}
