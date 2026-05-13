// Domain errors for the KYC module. Codes are namespaced KYC.* so the
// HTTP handler can map them uniformly via AppError.

import { ConflictError, NotFoundError, UnprocessableError } from "@zadpay/errors";

export class ApplicationNotFound extends NotFoundError {
  override readonly code = "KYC.APPLICATION_NOT_FOUND";
  constructor() {
    super("No KYC application for this user");
  }
}

export class DocumentNotFound extends NotFoundError {
  override readonly code = "KYC.DOCUMENT_NOT_FOUND";
  constructor() {
    super("Document not found");
  }
}

// Raised by the aggregate when a state transition isn't allowed (e.g.
// submitting an already-approved application). The HTTP layer maps it to
// 422 — the request was syntactically valid but the action doesn't apply.
export class IllegalTransition extends UnprocessableError {
  override readonly code = "KYC.ILLEGAL_TRANSITION";
  constructor(from: string, to: string) {
    super(`Cannot transition KYC application from ${from} to ${to}`, { from, to });
  }
}

export class NoDocumentsToSubmit extends UnprocessableError {
  override readonly code = "KYC.NO_DOCUMENTS_TO_SUBMIT";
  constructor() {
    super("Cannot submit an application with no uploaded documents");
  }
}

export class ApplicationAlreadyExists extends ConflictError {
  override readonly code = "KYC.APPLICATION_ALREADY_EXISTS";
  constructor() {
    super("KYC application already exists for this user");
  }
}
