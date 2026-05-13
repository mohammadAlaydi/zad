import { err, ok, type Result } from "@zadpay/errors";
import { IllegalTransition } from "../errors/index.js";
import { type KycApplicationStatus } from "../value-objects/KycApplicationStatus.js";

// One transition in the application's history. Append-only.
export interface TransitionEntry {
  readonly from: KycApplicationStatus | "_init";
  readonly to: KycApplicationStatus;
  readonly at: string; // ISO-8601
  readonly by: "user" | "provider" | "admin";
  readonly reason?: string;
}

// Aggregate root. Transitions are enforced here — illegal moves return a
// Result<_, IllegalTransition>, never throw. History accumulates as a
// side effect of any successful transition.
export class KycApplication {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly provider: string,
    public readonly providerRef: string | null,
    public readonly status: KycApplicationStatus,
    public readonly submittedAt: Date | null,
    public readonly decidedAt: Date | null,
    public readonly rejectionReason: string | null,
    public readonly history: readonly TransitionEntry[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static rehydrate(props: {
    id: string;
    userId: string;
    provider: string;
    providerRef: string | null;
    status: KycApplicationStatus;
    submittedAt: Date | null;
    decidedAt: Date | null;
    rejectionReason: string | null;
    history: readonly TransitionEntry[];
    createdAt: Date;
    updatedAt: Date;
  }): KycApplication {
    return new KycApplication(
      props.id,
      props.userId,
      props.provider,
      props.providerRef,
      props.status,
      props.submittedAt,
      props.decidedAt,
      props.rejectionReason,
      props.history,
      props.createdAt,
      props.updatedAt,
    );
  }

  static create(props: {
    id: string;
    userId: string;
    provider: string;
    now: Date;
  }): KycApplication {
    return new KycApplication(
      props.id,
      props.userId,
      props.provider,
      null,
      "pending",
      null,
      null,
      null,
      [
        {
          from: "_init",
          to: "pending",
          at: props.now.toISOString(),
          by: "user",
        },
      ],
      props.now,
      props.now,
    );
  }

  submit(now: Date): Result<KycApplication, IllegalTransition> {
    if (this.status !== "pending") {
      return err(new IllegalTransition(this.status, "submitted"));
    }
    return ok(this.transition("submitted", "user", now, { submittedAt: now }));
  }

  markUnderReview(
    now: Date,
    providerRef: string | null,
  ): Result<KycApplication, IllegalTransition> {
    if (this.status !== "submitted") {
      return err(new IllegalTransition(this.status, "review"));
    }
    return ok(
      this.transition("review", "provider", now, { providerRef: providerRef ?? this.providerRef }),
    );
  }

  // Provider can approve directly from submitted (no intermediate review)
  // or from review.
  approve(now: Date, providerRef: string | null): Result<KycApplication, IllegalTransition> {
    if (this.status !== "submitted" && this.status !== "review") {
      return err(new IllegalTransition(this.status, "approved"));
    }
    return ok(
      this.transition("approved", "provider", now, {
        decidedAt: now,
        providerRef: providerRef ?? this.providerRef,
        rejectionReason: null,
      }),
    );
  }

  reject(
    now: Date,
    reason: string,
    providerRef: string | null,
  ): Result<KycApplication, IllegalTransition> {
    if (this.status !== "submitted" && this.status !== "review") {
      return err(new IllegalTransition(this.status, "rejected"));
    }
    return ok(
      this.transition(
        "rejected",
        "provider",
        now,
        {
          decidedAt: now,
          providerRef: providerRef ?? this.providerRef,
          rejectionReason: reason,
        },
        reason,
      ),
    );
  }

  resubmit(now: Date): Result<KycApplication, IllegalTransition> {
    if (this.status !== "rejected") {
      return err(new IllegalTransition(this.status, "pending"));
    }
    return ok(
      this.transition("pending", "user", now, {
        submittedAt: null,
        decidedAt: null,
        rejectionReason: null,
      }),
    );
  }

  private transition(
    next: KycApplicationStatus,
    by: TransitionEntry["by"],
    now: Date,
    patch: Partial<{
      submittedAt: Date | null;
      decidedAt: Date | null;
      rejectionReason: string | null;
      providerRef: string | null;
    }>,
    reason?: string,
  ): KycApplication {
    const entry: TransitionEntry =
      reason === undefined
        ? { from: this.status, to: next, at: now.toISOString(), by }
        : { from: this.status, to: next, at: now.toISOString(), by, reason };
    return new KycApplication(
      this.id,
      this.userId,
      this.provider,
      patch.providerRef !== undefined ? patch.providerRef : this.providerRef,
      next,
      patch.submittedAt !== undefined ? patch.submittedAt : this.submittedAt,
      patch.decidedAt !== undefined ? patch.decidedAt : this.decidedAt,
      patch.rejectionReason !== undefined ? patch.rejectionReason : this.rejectionReason,
      [...this.history, entry],
      this.createdAt,
      now,
    );
  }
}
