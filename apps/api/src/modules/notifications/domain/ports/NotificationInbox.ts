// Inbox port. Persists every notification we send so the mobile app can
// render a real notifications screen with read/unread state — push
// delivery is best-effort, this row is the authoritative copy.

export interface InboxNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data: Readonly<Record<string, unknown>>;
  readAt: Date | null;
  createdAt: Date;
}

export interface NewInboxNotification {
  userId: string;
  type: string;
  title: string;
  body: string;
  data: Readonly<Record<string, unknown>>;
}

export interface InboxPage {
  items: readonly InboxNotification[];
  unreadCount: number;
  nextCursor: string | null;
}

export interface NotificationInbox {
  /** Persist a freshly-dispatched notification. */
  create(input: NewInboxNotification): Promise<InboxNotification>;
  /**
   * List a page of notifications for one user, newest first.
   * `cursor` is the createdAt-ISO of the last item from the previous page.
   */
  listForUser(userId: string, pageSize: number, cursor: string | null): Promise<InboxPage>;
  /** Mark a single notification read. Returns false if not found / wrong owner. */
  markRead(id: string, userId: string, now: Date): Promise<boolean>;
  /** Mark every unread notification read for one user. Returns the count touched. */
  markAllRead(userId: string, now: Date): Promise<number>;
}
