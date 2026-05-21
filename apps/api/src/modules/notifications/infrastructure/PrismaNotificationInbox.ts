import type { Notification as PrismaNotification, PrismaClient } from "@prisma/client";
import type {
  InboxNotification,
  InboxPage,
  NewInboxNotification,
  NotificationInbox,
} from "../domain/ports/NotificationInbox.js";

function toDomain(row: PrismaNotification): InboxNotification {
  // Prisma typings model the JSONB column as `JsonValue`; we know it's
  // always an object because that's the only shape we ever insert.
  const data = (row.data ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    title: row.title,
    body: row.body,
    data,
    readAt: row.readAt,
    createdAt: row.createdAt,
  };
}

export class PrismaNotificationInbox implements NotificationInbox {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: NewInboxNotification): Promise<InboxNotification> {
    const row = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data as object,
      },
    });
    return toDomain(row);
  }

  async listForUser(userId: string, pageSize: number, cursor: string | null): Promise<InboxPage> {
    // Cursor-based pagination by createdAt — duplicates at the same ms
    // tiebreak on id. Inbox is read-heavy so we avoid offset paging.
    const cursorDate = cursor === null ? null : new Date(cursor);
    const where = cursorDate === null ? { userId } : { userId, createdAt: { lt: cursorDate } };

    const rows = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: pageSize + 1, // fetch one extra to know if there's another page
    });

    const hasMore = rows.length > pageSize;
    const items = (hasMore ? rows.slice(0, pageSize) : rows).map(toDomain);
    const last = items[items.length - 1];
    const nextCursor = hasMore && last !== undefined ? last.createdAt.toISOString() : null;

    const unreadCount = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });

    return { items, unreadCount, nextCursor };
  }

  async markRead(id: string, userId: string, now: Date): Promise<boolean> {
    // Scope by userId so a leaked notification id can't be used to flip
    // someone else's read state.
    const result = await this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: now },
    });
    return result.count > 0;
  }

  async markAllRead(userId: string, now: Date): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: now },
    });
    return result.count;
  }
}
