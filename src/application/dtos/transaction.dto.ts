export type TransactionType = "c" | "d";

export type TransactionDTO = {
  valor: number;
  tipo: TransactionType;
  descricao: string;
  realizada_em: Date;
};

export type PostTransactionDTO = {
  saldo: number;
  limite: number;
};
