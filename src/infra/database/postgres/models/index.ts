import { Balance } from "./balance";
import { Client } from "./client";
import { Transaction } from "./transaction";

export type DB = {
  clients: Client;
  transactions: Transaction;
  balances: Balance;
};
