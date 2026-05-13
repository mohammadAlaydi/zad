import {
  type AllowedMimeType,
  type DocumentStatus,
  type DocumentType,
} from "../value-objects/DocumentType.js";

export class KycDocument {
  private constructor(
    public readonly id: string,
    public readonly applicationId: string,
    public readonly type: DocumentType,
    public readonly s3Key: string,
    public readonly mimeType: AllowedMimeType,
    public readonly status: DocumentStatus,
    public readonly sizeBytes: number | null,
    public readonly uploadedAt: Date | null,
    public readonly providerRef: string | null,
    public readonly createdAt: Date,
  ) {}

  static rehydrate(props: {
    id: string;
    applicationId: string;
    type: DocumentType;
    s3Key: string;
    mimeType: AllowedMimeType;
    status: DocumentStatus;
    sizeBytes: number | null;
    uploadedAt: Date | null;
    providerRef: string | null;
    createdAt: Date;
  }): KycDocument {
    return new KycDocument(
      props.id,
      props.applicationId,
      props.type,
      props.s3Key,
      props.mimeType,
      props.status,
      props.sizeBytes,
      props.uploadedAt,
      props.providerRef,
      props.createdAt,
    );
  }

  static create(props: {
    id: string;
    applicationId: string;
    type: DocumentType;
    s3Key: string;
    mimeType: AllowedMimeType;
    now: Date;
  }): KycDocument {
    return new KycDocument(
      props.id,
      props.applicationId,
      props.type,
      props.s3Key,
      props.mimeType,
      "pending",
      null,
      null,
      null,
      props.now,
    );
  }

  markUploaded(sizeBytes: number | null, now: Date): KycDocument {
    return new KycDocument(
      this.id,
      this.applicationId,
      this.type,
      this.s3Key,
      this.mimeType,
      "uploaded",
      sizeBytes,
      now,
      this.providerRef,
      this.createdAt,
    );
  }
}
