import { err, ok, type Result } from "@zadpay/errors";
import { NotFoundError } from "@zadpay/errors";
import type { InboxPage, NotificationInbox } from "../domain/ports/NotificationInbox.js";

export class NotificationNotFound extends NotFoundError {
  override readonly code = "NOTIFICATIONS.NOT_FOUND";
  constructor() {
    super("Notification not found");
  }
}

export interface ListInboxInput {
  userId: string;
  pageSize: number;
  cursor: string | null;
}

export class ListInboxQuery {
  constructor(private readonly inbox: NotificationInbox) {}

  async execute(input: ListInboxInput): Promise<Result<InboxPage, never>> {
    const page = await this.inbox.listForUser(input.userId, input.pageSize, input.cursor);
    return ok(page);
  }
}

export interface MarkReadInput {
  userId: string;
  notificationId: string;
}

export class MarkReadCommand {
  constructor(private readonly inbox: NotificationInbox) {}

  async execute(input: MarkReadInput): Promise<Result<void, NotificationNotFound>> {
    const found = await this.inbox.markRead(input.notificationId, input.userId, new Date());
    if (!found) return err(new NotificationNotFound());
    return ok(undefined);
  }
}

export class MarkAllReadCommand {
  constructor(private readonly inbox: NotificationInbox) {}

  async execute(input: { userId: string }): Promise<Result<{ marked: number }, never>> {
    const marked = await this.inbox.markAllRead(input.userId, new Date());
    return ok({ marked });
  }
}
