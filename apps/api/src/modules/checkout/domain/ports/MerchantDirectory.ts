// Port the checkout module uses to resolve a merchant phone number to a
// user id + display name. Satisfied by identity's phoneLookup in the
// composition root — checkout never imports identity directly.

export interface ResolvedMerchant {
  userId: string;
  phone: string;
  fullName: string | null;
}

export interface MerchantDirectory {
  byPhone(phone: string): Promise<ResolvedMerchant | null>;
}
