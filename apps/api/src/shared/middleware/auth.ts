import type { FastifyReply, FastifyRequest } from "fastify";
import type { TokenSigner } from "../../modules/identity/index.js";

// Fastify decoration: app.tokenSigner is set by the composition root in
// app.ts after the identity module registers. This middleware reads it
// from req.server so it stays a single shared function (no closure state).
declare module "fastify" {
  interface FastifyInstance {
    tokenSigner: TokenSigner;
  }
}

const HEADER_PREFIX = "Bearer ";

// preHandler hook: verifies the access token from the Authorization header
// and populates the request context with the user id + primary role.
// Per ADR-0006 fine-grained permission checks happen in the use cases.
export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const header = req.headers.authorization;
  if (header === undefined || !header.startsWith(HEADER_PREFIX)) {
    await reply.status(401).send({
      code: "COMMON.UNAUTHORIZED",
      message: "Missing bearer token",
      requestId: req.id,
    });
    return;
  }
  const token = header.slice(HEADER_PREFIX.length);
  try {
    const claims = await req.server.tokenSigner.verifyAccess(token);
    req.requestContext.set("userId", claims.sub);
    if (claims.roles[0] !== undefined) {
      req.requestContext.set("role", claims.roles[0]);
    }
  } catch (err) {
    req.log.warn({ err }, "JWT verify failed");
    await reply.status(401).send({
      code: "COMMON.UNAUTHORIZED",
      message: "Invalid or expired token",
      requestId: req.id,
    });
  }
}
