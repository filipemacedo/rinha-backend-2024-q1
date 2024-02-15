export enum TransactionType {
  Credit = "credit",
  Debit = "debit",
}

export type Transaction = {
  description: string;
  id: number;
  idClient: number;
  createdAt: Date;
  type: TransactionType;
  value: number;
};
