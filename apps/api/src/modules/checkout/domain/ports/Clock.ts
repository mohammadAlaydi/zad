// Module-local clock port so checkout doesn't depend on identity's.
// Wired to the same SystemClock adapter in the composition root.

export interface Clock {
  now(): Date;
}
