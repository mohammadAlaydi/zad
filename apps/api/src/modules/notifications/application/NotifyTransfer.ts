import { logger } from "../../../infra/logger/index.js";
import type { NotificationSender } from "../domain/ports/NotificationSender.js";
import type { PushTokenRepository } from "../domain/ports/PushTokenRepository.js";

export interface NotifyTransferInput {
  senderUserId: string;
  recipientUserId: string;
  senderName: string;
  recipientName: string;
  amountMinor: bigint;
  currency: string;
  transactionId: string;
}

export interface NotifyTransferDeps {
  tokens: PushTokenRepository;
  sender: NotificationSender;
}

function formatAmount(minor: bigint, currency: string): string {
  // Minor units assumed = 100. Real money formatting (locale, symbol) will
  // live alongside the mobile-side Money helper in a later PR.
  const major = Number(minor) / 100;
  return `${major.toFixed(2)} ${currency}`;
}

export class NotifyTransferCommand {
  constructor(private readonly deps: NotifyTransferDeps) {}

  async execute(input: NotifyTransferInput): Promise<void> {
    const amount = formatAmount(input.amountMinor, input.currency);

    // Two parallel fan-outs: one to sender devices, one to recipient.
    const [senderTokens, recipientTokens] = await Promise.all([
      this.deps.tokens.listForUser(input.senderUserId),
      this.deps.tokens.listForUser(input.recipientUserId),
    ]);

    const tasks: Promise<unknown>[] = [];

    if (senderTokens.length > 0) {
      tasks.push(
        this.deliver(
          senderTokens.map((t) => t.token),
          {
            title: "Money sent",
            body: `You sent ${amount} to ${input.recipientName}.`,
            data: {
              kind: "transfer.sent",
              transactionId: input.transactionId,
              counterparty: input.recipientName,
              amount: input.amountMinor.toString(),
              currency: input.currency,
            },
          },
        ),
      );
    }
    if (recipientTokens.length > 0) {
      tasks.push(
        this.deliver(
          recipientTokens.map((t) => t.token),
          {
            title: "Money received",
            body: `You received ${amount} from ${input.senderName}.`,
            data: {
              kind: "transfer.received",
              transactionId: input.transactionId,
              counterparty: input.senderName,
              amount: input.amountMinor.toString(),
              currency: input.currency,
            },
          },
        ),
      );
    }

    await Promise.all(tasks);
  }

  private async deliver(
    tokens: string[],
    payload: { title: string; body: string; data: Record<string, string> },
  ): Promise<void> {
    const results = await this.deps.sender.send(tokens, payload);
    // Prune tokens that the provider reported as dead — keeps the table
    // healthy and avoids future failed sends.
    await Promise.all(
      results.map(async (r, i) => {
        if (r.ok) return;
        if (r.reason === "unregistered" || r.reason === "invalid_argument") {
          const token = tokens[i];
          if (token !== undefined) {
            logger.info({ token, reason: r.reason }, "Pruning dead push token");
            await this.deps.tokens.pruneInvalid(token);
          }
        }
      }),
    );
  }
}
