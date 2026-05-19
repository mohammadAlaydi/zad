// Fire-and-forget KYC submission used right after signup. The user said
// "skip identity verification but still hit the backend"; this uploads
// 1 KB placeholder docs and submits so the in-memory provider (dev) auto-
// approves a few seconds later. The caller does not await final approval;
// the user is routed to home immediately while approval lands in the
// background and is picked up on next /me refresh.

import { kycService } from "./services/kycService";

export async function autoSubmitKyc(): Promise<void> {
  try {
    const ensured = await kycService.ensure();
    if (!ensured.ok) return;

    // Two placeholder documents — the backend requires at least one
    // uploaded doc before submit.
    const placeholder = new Uint8Array(1024).buffer;
    for (const type of ["passport", "selfie"] as const) {
      const presign = await kycService.presignDocument({ type, mimeType: "image/jpeg" });
      if (!presign.ok) continue;
      try {
        await fetch(presign.value.uploadUrl, {
          method: "PUT",
          headers: { "content-type": "image/jpeg" },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: placeholder as any,
        });
      } catch {
        // InMemoryDocumentStorage URL is a stub — non-fatal.
      }
      await kycService.notifyUploaded(presign.value.documentId, 1024);
    }

    await kycService.submit();
  } catch {
    // Background task — never crash the auth flow if KYC stubs error.
  }
}
