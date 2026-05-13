import type { Prisma, PrismaClient } from "@prisma/client";

// Append-only audit trail (shared.audit_log). The Postgres app role is
// granted INSERT only on this table — see ADR-0006. Callers pass a `tx`
// argument when the audit row must be in the same transaction as the
// state change (e.g. wallet.transfer + audit:wallet.transfer.posted).
export interface AuditEntry {
  actorId?: string;
  actorRole?: string;
  action: string; // e.g. "auth.login.success", "wallet.transfer.posted"
  targetId?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

export type AuditLogger = (entry: AuditEntry, tx?: Prisma.TransactionClient) => Promise<void>;

export function createAuditLogger(prisma: PrismaClient): AuditLogger {
  return async (entry, tx) => {
    const client = tx ?? prisma;
    await client.auditLog.create({
      data: {
        actorId: entry.actorId,
        actorRole: entry.actorRole,
        action: entry.action,
        targetId: entry.targetId,
        ip: entry.ip,
        userAgent: entry.userAgent,
        requestId: entry.requestId,
        metadata: entry.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  };
}
