// Composition root for the notifications module.
//
// Subscribes to wallet.TransferPosted, resolves the sender/recipient via
// the injected wallet + identity read ports, and fires push notifications
// via FCM (or a no-op sender when Firebase credentials aren't configured).

import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { logger } from "../../infra/logger/index.js";
import type { EventBus } from "../../shared/events/EventBus.js";
import type { UserLookup } from "../identity/index.js";
import type { TransferPosted } from "../wallet/index.js";
import { ListInboxQuery, MarkAllReadCommand, MarkReadCommand } from "./application/Inbox.js";
import { NotifyTransferCommand } from "./application/NotifyTransfer.js";
import {
  RegisterPushTokenCommand,
  UnregisterPushTokenCommand,
} from "./application/RegisterPushToken.js";
import type { NotificationSender } from "./domain/ports/NotificationSender.js";
import {
  createFirebaseSender,
  NoopNotificationSender,
} from "./infrastructure/FirebaseAdminSender.js";
import { PrismaNotificationInbox } from "./infrastructure/PrismaNotificationInbox.js";
import { PrismaPushTokenRepository } from "./infrastructure/PrismaPushTokenRepository.js";
import { registerDeviceRoutes } from "./interface/routes/devices.js";
import { registerInboxRoutes } from "./interface/routes/inbox.js";

export interface NotificationsModuleDeps {
  // Injected from the composition root in app.ts:
  //   - userLookup comes from identity (userId → display name)
  //   - ownerOfAccount comes from wallet (accountId → ownerId)
  userLookup: UserLookup;
  ownerOfAccount(accountId: string): Promise<string | null>;
}

export async function registerNotificationsModule(
  app: FastifyInstance,
  prisma: PrismaClient,
  events: EventBus,
  deps: NotificationsModuleDeps,
): Promise<void> {
  const tokens = new PrismaPushTokenRepository(prisma);
  const inbox = new PrismaNotificationInbox(prisma);
  const sender: NotificationSender = createFirebaseSender() ?? new NoopNotificationSender();

  const notifyTransfer = new NotifyTransferCommand({ tokens, sender, inbox });
  const register = new RegisterPushTokenCommand({ tokens });
  const unregister = new UnregisterPushTokenCommand({ tokens });
  const listInbox = new ListInboxQuery(inbox);
  const markRead = new MarkReadCommand(inbox);
  const markAllRead = new MarkAllReadCommand(inbox);

  // Cross-module subscription. We pull the entries out of the published
  // event, resolve each side back to its owner via wallet, and look up the
  // human-readable name via identity. Per ADR-0005 the notifications
  // module sees only event shapes and the abstract read ports — never the
  // other modules' internals.
  events.subscribe<TransferPosted>("wallet.TransferPosted", async (evt) => {
    try {
      const { transactionId, sourceAccountId, destAccountId, amount, currency } = evt.payload;
      const [senderId, recipientId] = await Promise.all([
        deps.ownerOfAccount(sourceAccountId),
        deps.ownerOfAccount(destAccountId),
      ]);
      if (senderId === null || recipientId === null) {
        logger.warn(
          { transactionId, sourceAccountId, destAccountId },
          "Transfer notify: couldn't resolve account owners",
        );
        return;
      }
      const [sender, recipient] = await Promise.all([
        deps.userLookup.byId(senderId),
        deps.userLookup.byId(recipientId),
      ]);
      if (sender === null || recipient === null) {
        logger.warn({ senderId, recipientId }, "Transfer notify: couldn't resolve user profiles");
        return;
      }
      await notifyTransfer.execute({
        senderUserId: senderId,
        recipientUserId: recipientId,
        senderName: sender.fullName ?? "Someone",
        recipientName: recipient.fullName ?? "a ZADPAY user",
        amountMinor: BigInt(amount),
        currency,
        transactionId,
      });
    } catch (err) {
      // Notifications must never break the transaction flow — log and
      // swallow. The transfer is already committed by the time we hit
      // this subscriber.
      logger.error({ err }, "Transfer notification dispatch failed");
    }
  });

  await registerDeviceRoutes(app, { register, unregister });
  await registerInboxRoutes(app, { list: listInbox, markRead, markAllRead });
}
