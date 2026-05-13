import { randomUUID } from "node:crypto";
import type { IdGenerator } from "../../domain/ports/IdGenerator.js";

export class RandomIdGenerator implements IdGenerator {
  uuid(): string {
    return randomUUID();
  }
}
