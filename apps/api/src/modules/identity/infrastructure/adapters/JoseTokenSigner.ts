import { importPKCS8, importSPKI, jwtVerify, SignJWT, type KeyLike } from "jose";
import type {
  AccessTokenClaims,
  AccessTokenIssued,
  TokenSigner,
} from "../../domain/ports/TokenSigner.js";

// Ed25519 JWTs (alg = EdDSA) per ADR-0006. The signing key is private; the
// verify key is public — both come from env, both PEM-encoded.
const ALG = "EdDSA" as const;
const ISSUER = "zadpay" as const;
const AUDIENCE = "zadpay-mobile" as const;

export interface JoseTokenSignerOptions {
  privateKeyPem: string;
  publicKeyPem: string;
  accessTokenTtlSeconds: number;
}

export class JoseTokenSigner implements TokenSigner {
  private constructor(
    private readonly privateKey: KeyLike,
    private readonly publicKey: KeyLike,
    private readonly accessTokenTtlSeconds: number,
  ) {}

  static async create(opts: JoseTokenSignerOptions): Promise<JoseTokenSigner> {
    const [privateKey, publicKey] = await Promise.all([
      importPKCS8(opts.privateKeyPem, ALG),
      importSPKI(opts.publicKeyPem, ALG),
    ]);
    return new JoseTokenSigner(privateKey, publicKey, opts.accessTokenTtlSeconds);
  }

  async signAccess(claims: AccessTokenClaims): Promise<AccessTokenIssued> {
    const expiresAt = new Date(Date.now() + this.accessTokenTtlSeconds * 1000);
    const token = await new SignJWT({ kyc: claims.kyc, roles: claims.roles })
      .setProtectedHeader({ alg: ALG })
      .setSubject(claims.sub)
      .setIssuer(ISSUER)
      .setAudience(AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .sign(this.privateKey);
    return { token, expiresAt };
  }

  async verifyAccess(token: string): Promise<AccessTokenClaims> {
    const { payload } = await jwtVerify(token, this.publicKey, {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: [ALG],
    });
    if (typeof payload.sub !== "string") {
      throw new Error("Access token missing sub claim");
    }
    const kyc = typeof payload["kyc"] === "string" ? payload["kyc"] : "not_started";
    const roles = Array.isArray(payload["roles"])
      ? payload["roles"].filter((r): r is string => typeof r === "string")
      : [];
    return { sub: payload.sub, kyc, roles };
  }
}
