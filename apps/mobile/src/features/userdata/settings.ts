import { useCallback } from "react";
import { useCreateUserItem, useUpdateUserItem, useUserItems } from "./hooks";

// One row per user under feature="settings". All toggles, limits, and
// preferences live in this single payload so the backend doesn't need
// a dedicated table per setting. Defaults below are applied when the
// row doesn't exist yet — they're the "first-time signup" baseline.
export interface SettingsPayload {
  // Login / 2FA
  passcodeEnabled?: boolean;
  biometricEnabled?: boolean;
  faceIdEnabled?: boolean;
  twoFactorEnabled?: boolean;

  // Display
  hideBalance?: boolean;

  // Card security
  cardFrozen?: boolean;
  cardPinSet?: boolean;
  cardNumberHidden?: boolean;

  // Card connections (Apple/Google/Samsung Pay)
  applePayLinked?: boolean;
  googlePayLinked?: boolean;
  samsungPayLinked?: boolean;

  // Payment controls
  perTransactionLimit?: number;
  dailyLimit?: number;
  weeklyLimit?: number;
  internationalPaymentsEnabled?: boolean;
  paymentNotificationsEnabled?: boolean;

  // Comms
  whatsappBotEnabled?: boolean;
}

const DEFAULTS: Required<SettingsPayload> = {
  passcodeEnabled: false,
  biometricEnabled: false,
  faceIdEnabled: false,
  twoFactorEnabled: false,
  hideBalance: false,
  cardFrozen: false,
  cardPinSet: false,
  cardNumberHidden: false,
  applePayLinked: false,
  googlePayLinked: false,
  samsungPayLinked: false,
  perTransactionLimit: 1000,
  dailyLimit: 5000,
  weeklyLimit: 20000,
  internationalPaymentsEnabled: false,
  paymentNotificationsEnabled: true,
  whatsappBotEnabled: false,
};

export function useSettings() {
  const query = useUserItems<SettingsPayload>("settings");
  const createMut = useCreateUserItem("settings");
  const updateMut = useUpdateUserItem("settings");

  const row = query.data?.items[0];
  const stored: SettingsPayload = row?.payload ?? {};
  const settings: Required<SettingsPayload> = { ...DEFAULTS, ...stored };

  // Merge in new fields on top of whatever was there. Lazy-creates the
  // row on first write so callers don't have to know if it exists.
  const updateSettings = useCallback(
    async (patch: Partial<SettingsPayload>) => {
      const next: SettingsPayload = { ...stored, ...patch };
      if (row === undefined) {
        await createMut.mutateAsync(next as Record<string, unknown>);
      } else {
        await updateMut.mutateAsync({ id: row.id, payload: next as Record<string, unknown> });
      }
    },
    [row, stored, createMut, updateMut],
  );

  return {
    settings,
    isLoading: query.isLoading,
    isPending: createMut.isPending || updateMut.isPending,
    updateSettings,
  };
}
