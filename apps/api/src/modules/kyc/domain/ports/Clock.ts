// Module-local Clock port. Duplicated from identity per the no-cross-
// module-internal-import rule (ADR-0005). The cost is four lines of TS;
// the alternative is a `shared/ports/` layer that introduces shared
// coupling for trivial value.
export interface Clock {
  now(): Date;
}
