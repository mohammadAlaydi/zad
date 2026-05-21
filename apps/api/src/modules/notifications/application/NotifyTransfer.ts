import { logger } from "../../../infra/logger/index.js";
import type { NotificationInbox } from "../domain/ports/NotificationInbox.js";
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
  inbox: NotificationInbox;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  AED: "د.إ",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "A$",
  EGP: "E£",
  SAR: "﷼",
};

function formatAmount(minor: bigint, currency: string): string {
  // Minor units assumed = 100. Format with thousands separators and the
  // currency symbol prefixed when known (InstaPay-style: "$1,250.00").
  const major = Number(minor) / 100;
  const pretty = major.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? "";
  return symbol === "" ? `${pretty} ${currency}` : `${symbol}${pretty} ${currency}`;
}

// Short, human-friendly transaction reference for the notification body —
// the user can correlate it with the receipt screen without showing a 36
// char UUID on the lock screen.
function shortRef(transactionId: string): string {
  const stripped = transactionId.replace(/-/g, "");
  return stripped.slice(-8).toUpperCase();
}

function formatLocalTime(): string {
  // Server-side approximation; the mobile receipt screen renders the
  // authoritative timestamp from the transaction record.
  const now = new Date();
  return now.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export class NotifyTransferCommand {
  constructor(private readonly deps: NotifyTransferDeps) {}

  async execute(input: NotifyTransferInput): Promise<void> {
    const amount = formatAmount(input.amountMinor, input.currency);
    const ref = shortRef(input.transactionId);
    const when = formatLocalTime();

    const senderPayload = {
      type: "transfer.sent" as const,
      title: `Sent ${amount} to ${input.recipientName}`,
      body: `Your transfer was completed successfully. Ref ${ref} • ${when}. Tap to view receipt.`,
      data: {
        kind: "transfer.sent",
        transactionId: input.transactionId,
        counterparty: input.recipientName,
        amount: input.amountMinor.toString(),
        currency: input.currency,
        ref,
      },
    };
    const recipientPayload = {
      type: "transfer.received" as const,
      title: `Received ${amount} from ${input.senderName}`,
      body: `Your wallet has been credited. Ref ${ref} • ${when}. Tap to view receipt.`,
      data: {
        kind: "transfer.received",
        transactionId: input.transactionId,
        counterparty: input.senderName,
        amount: input.amountMinor.toString(),
        currency: input.currency,
        ref,
      },
    };

    // Persist to the inbox first (so the user can see the notification
    // even if FCM never reaches the device), then dispatch the push.
    // Persist + fan-out happen in parallel per user.
    const [senderTokens, recipientTokens] = await Promise.all([
      this.deps.tokens.listForUser(input.senderUserId),
      this.deps.tokens.listForUser(input.recipientUserId),
    ]);

    const tasks: Promise<unknown>[] = [
      this.deps.inbox.create({
        userId: input.senderUserId,
        type: senderPayload.type,
        title: senderPayload.title,
        body: senderPayload.body,
        data: senderPayload.data,
      }),
      this.deps.inbox.create({
        userId: input.recipientUserId,
        type: recipientPayload.type,
        title: recipientPayload.title,
        body: recipientPayload.body,
        data: recipientPayload.data,
      }),
    ];

    if (senderTokens.length > 0) {
      tasks.push(
        this.deliver(
          senderTokens.map((t) => t.token),
          {
            title: senderPayload.title,
            body: senderPayload.body,
            data: senderPayload.data,
          },
        ),
      );
    }
    if (recipientTokens.length > 0) {
      tasks.push(
        this.deliver(
          recipientTokens.map((t) => t.token),
          {
            title: recipientPayload.title,
            body: recipientPayload.body,
            data: recipientPayload.data,
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
