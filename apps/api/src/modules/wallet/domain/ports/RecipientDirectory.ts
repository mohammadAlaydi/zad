// Resolves a phone number to a recipient identity record. Wallet defines
// this port (its own contract); the composition root in app.ts wires it
// to identity's PhoneLookup. Per ADR-0005 wallet stays unaware of identity
// internals.

export interface RecipientRecord {
  userId: string;
  fullName: string | null;
  phone: string;
}

export interface RecipientDirectory {
  byPhone(phone: string): Promise<RecipientRecord | null>;
}
