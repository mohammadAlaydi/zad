import { err, ok, type Result } from "@zadpay/errors";
import type { EventBus } from "../../../../shared/events/EventBus.js";
import { ApplicationNotFound, type IllegalTransition } from "../../domain/errors/index.js";
import type { KycApplicationApproved, KycApplicationRejected } from "../../domain/events/index.js";
import type { Clock } from "../../domain/ports/Clock.js";
import type { KycApplicationRepository } from "../../domain/ports/KycApplicationRepository.js";

export interface RecordProviderDecisionInput {
  applicationId: string;
  decision: "approved" | "rejected";
  providerRef?: string | null;
  reason?: string;
}

export interface RecordProviderDecisionDeps {
  applications: KycApplicationRepository;
  clock: Clock;
  events: EventBus;
}

// Called from two places:
//   • InMemoryKycProvider's auto-approval callback (dev/test)
//   • Real providers' webhook receiver (Phase 2 — adds a route + signature verify)
// Idempotent: if the application is already in the target state, returns ok
// without publishing duplicate events. The provider's own event id is the
// authoritative dedup key (handled one layer up by the webhook receiver).
export class RecordProviderDecisionCommand {
  constructor(private readonly deps: RecordProviderDecisionDeps) {}

  async execute(
    input: RecordProviderDecisionInput,
  ): Promise<Result<void, ApplicationNotFound | IllegalTransition>> {
    const application = await this.deps.applications.findById(input.applicationId);
    if (application === null) return err(new ApplicationNotFound());

    if (input.decision === "approved" && application.status === "approved") return ok(undefined);
    if (input.decision === "rejected" && application.status === "rejected") return ok(undefined);

    const now = this.deps.clock.now();
    const transition =
      input.decision === "approved"
        ? application.approve(now, input.providerRef ?? null)
        : application.reject(
            now,
            input.reason ?? "rejected by provider",
            input.providerRef ?? null,
          );

    if (!transition.ok) return transition;
    await this.deps.applications.save(transition.value);

    const evt: KycApplicationApproved | KycApplicationRejected =
      input.decision === "approved"
        ? {
            name: "kyc.ApplicationApproved",
            aggregateId: transition.value.id,
            occurredAt: now,
            payload: { applicationId: transition.value.id, userId: transition.value.userId },
          }
        : {
            name: "kyc.ApplicationRejected",
            aggregateId: transition.value.id,
            occurredAt: now,
            payload: {
              applicationId: transition.value.id,
              userId: transition.value.userId,
              reason: input.reason ?? "rejected by provider",
            },
          };
    await this.deps.events.publish(evt);
    return ok(undefined);
  }
}
