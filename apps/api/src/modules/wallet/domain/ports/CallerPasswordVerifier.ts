// Verifies a user's password before a sensitive operation (transfers).
// Wallet defines the contract; app.ts wires it to identity's Argon2 hasher
// + UserRepository.

export interface CallerPasswordVerifier {
  verify(userId: string, plainPassword: string): Promise<boolean>;
}
