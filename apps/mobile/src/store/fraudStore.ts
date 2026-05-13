import { create } from "zustand";

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type AlertStatus = "new" | "investigating" | "resolved" | "dismissed";

export type FraudAlert = {
  id: string;
  type: "suspicious_login" | "unusual_topup" | "large_transfer" | "rapid_transactions" | "location_anomaly" | "device_change";
  title: string;
  description: string;
  riskLevel: RiskLevel;
  status: AlertStatus;
  timestamp: string;
  amount?: number;
  location?: string;
  deviceInfo?: string;
  userId: string;
  userName: string;
};

export type RiskProfile = {
  overallScore: number;
  loginRisk: number;
  transactionRisk: number;
  behaviorRisk: number;
  lastUpdated: string;
};

type FraudState = {
  alerts: FraudAlert[];
  riskProfile: RiskProfile;
  stats: { totalAlerts: number; critical: number; resolved: number; investigating: number };
  updateAlertStatus: (id: string, status: AlertStatus) => void;
  dismissAlert: (id: string) => void;
};

const sampleAlerts: FraudAlert[] = [
  {
    id: "fa1", type: "suspicious_login", title: "Unusual Login Location",
    description: "Login attempt detected from a new location (Lagos, Nigeria) that is 5,200km from your usual location.",
    riskLevel: "high", status: "new", timestamp: new Date(Date.now() - 1800000).toISOString(),
    location: "Lagos, Nigeria", deviceInfo: "Chrome on Windows", userId: "u1", userName: "Mahmoud Hafez",
  },
  {
    id: "fa2", type: "unusual_topup", title: "Unusual Top-up Pattern",
    description: "Multiple rapid top-ups totaling $2,500 within 15 minutes, significantly above your average pattern.",
    riskLevel: "critical", status: "new", timestamp: new Date(Date.now() - 3600000).toISOString(),
    amount: 2500, userId: "u1", userName: "Mahmoud Hafez",
  },
  {
    id: "fa3", type: "large_transfer", title: "Large Transfer Flagged",
    description: "Transfer of $4,800 to a new recipient. This exceeds your typical transaction range.",
    riskLevel: "high", status: "investigating", timestamp: new Date(Date.now() - 7200000).toISOString(),
    amount: 4800, userId: "u1", userName: "Mahmoud Hafez",
  },
  {
    id: "fa4", type: "rapid_transactions", title: "Rapid Transaction Burst",
    description: "12 transactions processed within 3 minutes from your account, which is unusual for your spending pattern.",
    riskLevel: "medium", status: "investigating", timestamp: new Date(Date.now() - 43200000).toISOString(),
    amount: 340, userId: "u1", userName: "Mahmoud Hafez",
  },
  {
    id: "fa5", type: "device_change", title: "New Device Detected",
    description: "A new Android device was used to access your account for the first time.",
    riskLevel: "low", status: "resolved", timestamp: new Date(Date.now() - 86400000).toISOString(),
    deviceInfo: "Samsung Galaxy S24, Android 15", userId: "u1", userName: "Mahmoud Hafez",
  },
  {
    id: "fa6", type: "location_anomaly", title: "Impossible Travel",
    description: "Login from Dubai detected 45 minutes after a login from Baghdad — physically impossible travel time.",
    riskLevel: "critical", status: "new", timestamp: new Date(Date.now() - 600000).toISOString(),
    location: "Dubai → Baghdad", userId: "u1", userName: "Mahmoud Hafez",
  },
];

export const useFraudStore = create<FraudState>((set) => ({
  alerts: sampleAlerts,
  riskProfile: {
    overallScore: 72,
    loginRisk: 85,
    transactionRisk: 65,
    behaviorRisk: 45,
    lastUpdated: new Date().toISOString(),
  },
  stats: {
    totalAlerts: sampleAlerts.length,
    critical: sampleAlerts.filter((a) => a.riskLevel === "critical").length,
    resolved: sampleAlerts.filter((a) => a.status === "resolved").length,
    investigating: sampleAlerts.filter((a) => a.status === "investigating").length,
  },

  updateAlertStatus: (id, status) =>
    set((s) => {
      const alerts = s.alerts.map((a) => (a.id === id ? { ...a, status } : a));
      return {
        alerts,
        stats: {
          totalAlerts: alerts.length,
          critical: alerts.filter((a) => a.riskLevel === "critical").length,
          resolved: alerts.filter((a) => a.status === "resolved").length,
          investigating: alerts.filter((a) => a.status === "investigating").length,
        },
      };
    }),

  dismissAlert: (id) =>
    set((s) => {
      const alerts = s.alerts.map((a) => (a.id === id ? { ...a, status: "dismissed" as AlertStatus } : a));
      return {
        alerts,
        stats: {
          totalAlerts: alerts.length,
          critical: alerts.filter((a) => a.riskLevel === "critical").length,
          resolved: alerts.filter((a) => a.status === "resolved").length,
          investigating: alerts.filter((a) => a.status === "investigating").length,
        },
      };
    }),
}));
