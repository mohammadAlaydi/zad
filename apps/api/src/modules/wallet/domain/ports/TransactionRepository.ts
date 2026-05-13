import type { Transaction } from "../entities/Transaction.js";

export interface ListTransactionsInput {
  ownerId: string;
  page: number; // 0-indexed
  pageSize: number;
}

export interface ListTransactionsResult {
  transactions: Transaction[];
  total: number;
}

export interface TransactionRepository {
  /// Lists transactions touching any of the owner's accounts, newest first.
  listForOwner(input: ListTransactionsInput): Promise<ListTransactionsResult>;
}
