import { describe, expect, it } from "vitest";
import { IllegalTransition } from "../errors/index.js";
import { KycApplication } from "./KycApplication.js";

const NOW = new Date("2026-05-13T12:00:00Z");
const LATER = new Date("2026-05-13T12:00:30Z");
const MUCH_LATER = new Date("2026-05-13T12:05:00Z");

function freshApp() {
  return KycApplication.create({
    id: "00000000-0000-0000-0000-000000000001",
    userId: "00000000-0000-0000-0000-000000000099",
    provider: "inmem",
    now: NOW,
  });
}

describe("KycApplication state machine", () => {
  it("starts in pending and records the initial transition in history", () => {
    const app = freshApp();
    expect(app.status).toBe("pending");
    expect(app.history).toHaveLength(1);
    expect(app.history[0]).toEqual({
      from: "_init",
      to: "pending",
      at: NOW.toISOString(),
      by: "user",
    });
  });

  it("submit: pending → submitted", () => {
    const result = freshApp().submit(LATER);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe("submitted");
    expect(result.value.submittedAt?.toISOString()).toBe(LATER.toISOString());
    expect(result.value.history).toHaveLength(2);
  });

  it("submit fails from submitted", () => {
    const submitted = freshApp().submit(LATER);
    if (!submitted.ok) throw new Error();
    const again = submitted.value.submit(MUCH_LATER);
    expect(again.ok).toBe(false);
    if (again.ok) return;
    expect(again.error).toBeInstanceOf(IllegalTransition);
  });

  it("approve: submitted → approved", () => {
    const submitted = freshApp().submit(LATER);
    if (!submitted.ok) throw new Error();
    const approved = submitted.value.approve(MUCH_LATER, "ref-123");
    expect(approved.ok).toBe(true);
    if (!approved.ok) return;
    expect(approved.value.status).toBe("approved");
    expect(approved.value.decidedAt?.toISOString()).toBe(MUCH_LATER.toISOString());
    expect(approved.value.providerRef).toBe("ref-123");
  });

  it("approve fails from pending", () => {
    const result = freshApp().approve(LATER, null);
    expect(result.ok).toBe(false);
  });

  it("reject: submitted → rejected, with reason", () => {
    const submitted = freshApp().submit(LATER);
    if (!submitted.ok) throw new Error();
    const rejected = submitted.value.reject(MUCH_LATER, "bad selfie", null);
    expect(rejected.ok).toBe(true);
    if (!rejected.ok) return;
    expect(rejected.value.status).toBe("rejected");
    expect(rejected.value.rejectionReason).toBe("bad selfie");
    const last = rejected.value.history[rejected.value.history.length - 1];
    expect(last?.reason).toBe("bad selfie");
  });

  it("resubmit: rejected → pending and clears decision metadata", () => {
    const submitted = freshApp().submit(LATER);
    if (!submitted.ok) throw new Error();
    const rejected = submitted.value.reject(MUCH_LATER, "nope", null);
    if (!rejected.ok) throw new Error();
    const resubmitted = rejected.value.resubmit(new Date("2026-05-14T00:00:00Z"));
    expect(resubmitted.ok).toBe(true);
    if (!resubmitted.ok) return;
    expect(resubmitted.value.status).toBe("pending");
    expect(resubmitted.value.rejectionReason).toBeNull();
    expect(resubmitted.value.decidedAt).toBeNull();
    expect(resubmitted.value.submittedAt).toBeNull();
  });

  it("resubmit fails from approved", () => {
    const submitted = freshApp().submit(LATER);
    if (!submitted.ok) throw new Error();
    const approved = submitted.value.approve(MUCH_LATER, null);
    if (!approved.ok) throw new Error();
    const result = approved.value.resubmit(new Date());
    expect(result.ok).toBe(false);
  });

  it("history is append-only across all transitions", () => {
    const submitted = freshApp().submit(LATER);
    if (!submitted.ok) throw new Error();
    const reviewing = submitted.value.markUnderReview(MUCH_LATER, "ref");
    if (!reviewing.ok) throw new Error();
    const approved = reviewing.value.approve(new Date("2026-05-13T12:10:00Z"), "ref");
    if (!approved.ok) throw new Error();
    expect(approved.value.history.map((h) => h.to)).toEqual([
      "pending",
      "submitted",
      "review",
      "approved",
    ]);
  });
});
