import { ok, type Result } from "@zadpay/errors";
import type { Transaction } from "../../domain/entities/Transaction.js";
import type { TransactionRepository } from "../../domain/ports/TransactionRepository.js";

export interface ListMyTransactionsInput {
  userId: string;
  page: number;
  pageSize: number;
}

export interface ListMyTransactionsResult {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListMyTransactionsDeps {
  transactions: TransactionRepository;
}

export class ListMyTransactionsQuery {
  constructor(private readonly deps: ListMyTransactionsDeps) {}

  async execute(input: ListMyTransactionsInput): Promise<Result<ListMyTransactionsResult, never>> {
    const pageSize = Math.min(Math.max(input.pageSize, 1), 100);
    const page = Math.max(input.page, 0);
    const { transactions, total } = await this.deps.transactions.listForOwner({
      ownerId: input.userId,
      page,
      pageSize,
    });
    return ok({ transactions, total, page, pageSize });
  }
}
