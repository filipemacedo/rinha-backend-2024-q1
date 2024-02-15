import { BalanceDTO } from "./balance.dto";
import { TransactionDTO } from "./transaction.dto";

export type ExtractDTO = {
  saldo: BalanceDTO;
  ultimas_transacoes: TransactionDTO[];
};
