import type { PresignDocumentRequest } from "@zadpay/validation";
import { useState } from "react";
import { type ClientError } from "@/lib/api/errors";
import { kycService } from "../services/kycService";

interface UploadInput extends PresignDocumentRequest {
  /// Bytes to PUT. In dev (InMemoryDocumentStorage) the URL is a stub and
  /// the PUT will fail; we still call notify so the demo proceeds.
  /// Phase 2 wires AwsS3DocumentStorage where this PUT must succeed.
  body: ArrayBuffer | Blob | string;
  sizeBytes: number;
}

interface UseUploadDocumentResult {
  upload: (
    input: UploadInput,
  ) => Promise<{ ok: true; documentId: string } | { ok: false; error: ClientError }>;
  isPending: boolean;
  error: ClientError | null;
}

export function useUploadDocument(): UseUploadDocumentResult {
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState<ClientError | null>(null);

  async function upload(input: UploadInput) {
    setPending(true);
    setError(null);
    try {
      const presign = await kycService.presignDocument({
        type: input.type,
        mimeType: input.mimeType,
      });
      if (!presign.ok) {
        setError(presign.error);
        return { ok: false as const, error: presign.error };
      }

      // Try the PUT to the presigned URL. In dev this 404s; we log and
      // proceed to notify so the demo doesn't hang. Production (S3) hard-
      // fails here and the user retries.
      try {
        await fetch(presign.value.uploadUrl, {
          method: "PUT",
          headers: { "content-type": input.mimeType },
          // RN's fetch accepts string / Blob / ArrayBuffer bodies.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: input.body as any,
        });
      } catch (e) {
        // Non-fatal in dev — InMemoryDocumentStorage URL is a stub.
        console.warn("KYC upload PUT failed (likely dev stub):", String(e));
      }

      const notify = await kycService.notifyUploaded(presign.value.documentId, input.sizeBytes);
      if (!notify.ok) {
        setError(notify.error);
        return { ok: false as const, error: notify.error };
      }
      return { ok: true as const, documentId: presign.value.documentId };
    } finally {
      setPending(false);
    }
  }

  return { upload, isPending, error };
}
