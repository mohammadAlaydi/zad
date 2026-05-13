// Injected `now()` so tests can drive time deterministically (replay-window
// edge cases) without sleep() / process.hrtime hacks.
export interface Clock {
  now(): Date;
}
