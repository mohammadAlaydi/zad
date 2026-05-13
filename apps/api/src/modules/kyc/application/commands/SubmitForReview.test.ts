import { beforeEach, describe, expect, it } from "vitest";
import { RecordingEventBus } from "../../../../../test/fakes/identity.js";
import {
  FakeKycProvider,
  FixedClock,
  InMemoryKycApplicationRepository,
  InMemoryKycDocumentRepository,
  SequentialIdGenerator,
} from "../../../../../test/fakes/kyc.js";
import { KycApplication } from "../../domain/entities/KycApplication.js";
import { KycDocument } from "../../domain/entities/KycDocument.js";
import {
  ApplicationNotFound,
  IllegalTransition,
  NoDocumentsToSubmit,
} from "../../domain/errors/index.js";
import { SubmitForReviewCommand } from "./SubmitForReview.js";

describe("SubmitForReviewCommand", () => {
  let applications: InMemoryKycApplicationRepository;
  let documents: InMemoryKycDocumentRepository;
  let provider: FakeKycProvider;
  let clock: FixedClock;
  let events: RecordingEventBus;
  let ids: SequentialIdGenerator;
  let submit: SubmitForReviewCommand;

  const USER = "00000000-0000-0000-0000-0000000000aa";

  beforeEach(async () => {
    applications = new InMemoryKycApplicationRepository();
    documents = new InMemoryKycDocumentRepository();
    provider = new FakeKycProvider();
    clock = new FixedClock(new Date("2026-05-13T12:00:00Z"));
    events = new RecordingEventBus();
    ids = new SequentialIdGenerator();

    submit = new SubmitForReviewCommand({ applications, documents, provider, clock, events });
  });

  async function seedApplication(): Promise<KycApplication> {
    const app = KycApplication.create({
      id: ids.uuid(),
      userId: USER,
      provider: "inmem",
      now: clock.now(),
    });
    await applications.save(app);
    return app;
  }

  async function seedUploadedDocument(app: KycApplication): Promise<void> {
    const doc = KycDocument.create({
      id: ids.uuid(),
      applicationId: app.id,
      type: "passport",
      s3Key: "kyc/" + app.id + "/doc",
      mimeType: "image/jpeg",
      now: clock.now(),
    });
    await documents.save(doc.markUploaded(1024, clock.now()));
  }

  it("rejects when no application exists", async () => {
    const result = await submit.execute({ userId: USER });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(ApplicationNotFound);
  });

  it("rejects when no documents have been uploaded", async () => {
    await seedApplication();
    const result = await submit.execute({ userId: USER });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(NoDocumentsToSubmit);
  });

  it("submits successfully: state advances + provider called + event published", async () => {
    const app = await seedApplication();
    await seedUploadedDocument(app);
    const result = await submit.execute({ userId: USER });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe("submitted");
    expect(provider.submitted).toContain(app.id);
    expect(events.published.some((e) => e.name === "kyc.ApplicationSubmitted")).toBe(true);
  });

  it("rejects a second submit (state machine guard)", async () => {
    const app = await seedApplication();
    await seedUploadedDocument(app);
    await submit.execute({ userId: USER });
    provider.submitted.length = 0;
    const second = await submit.execute({ userId: USER });
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.error).toBeInstanceOf(IllegalTransition);
    expect(provider.submitted).toHaveLength(0);
  });
});
