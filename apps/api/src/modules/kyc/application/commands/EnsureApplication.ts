import { ok, type Result } from "@zadpay/errors";
import type { EventBus } from "../../../../shared/events/EventBus.js";
import { KycApplication } from "../../domain/entities/KycApplication.js";
import type { KycApplicationCreated } from "../../domain/events/index.js";
import type { Clock } from "../../domain/ports/Clock.js";
import type { IdGenerator } from "../../domain/ports/IdGenerator.js";
import type { KycApplicationRepository } from "../../domain/ports/KycApplicationRepository.js";

export interface EnsureApplicationInput {
  userId: string;
}

export interface EnsureApplicationDeps {
  applications: KycApplicationRepository;
  ids: IdGenerator;
  clock: Clock;
  events: EventBus;
  provider: string; // 'inmem' | 'sumsub' | ...
}

// Idempotent: returns the existing application or creates a fresh one in
// `pending`. We model one application per user — multiple lineages (e.g.
// renewals) would require a richer schema later.
export class EnsureApplicationCommand {
  constructor(private readonly deps: EnsureApplicationDeps) {}

  async execute(input: EnsureApplicationInput): Promise<Result<KycApplication, never>> {
    const existing = await this.deps.applications.findByUserId(input.userId);
    if (existing !== null) return ok(existing);

    const application = KycApplication.create({
      id: this.deps.ids.uuid(),
      userId: input.userId,
      provider: this.deps.provider,
      now: this.deps.clock.now(),
    });
    await this.deps.applications.save(application);

    const event: KycApplicationCreated = {
      name: "kyc.ApplicationCreated",
      aggregateId: application.id,
      occurredAt: this.deps.clock.now(),
      payload: {
        applicationId: application.id,
        userId: application.userId,
        provider: application.provider,
      },
    };
    await this.deps.events.publish(event);

    return ok(application);
  }
}
