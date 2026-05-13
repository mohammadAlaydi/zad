import { create } from "zustand";

export type KYCStatus = "pending" | "approved" | "rejected" | "under_review";
export type UserType = "personal" | "merchant" | "agent";

export type KYCUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: UserType;
  kycStatus: KYCStatus;
  region: string;
  submittedAt: string;
  documentType: string;
  flagged: boolean;
  riskScore: number;
};

export type AuditEntry = {
  id: string;
  action: string;
  performedBy: string;
  targetUser: string;
  timestamp: string;
  details: string;
};

type AdminState = {
  users: KYCUser[];
  auditLog: AuditEntry[];
  filters: { status: KYCStatus | "all"; type: UserType | "all"; region: string };
  stats: { totalUsers: number; pendingKYC: number; flagged: number; approved: number };
  setFilter: (key: string, value: string) => void;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  flagUser: (userId: string) => void;
};

const sampleUsers: KYCUser[] = [
  {
    id: "u1",
    name: "Ahmed Hassan",
    email: "ahmed@mail.com",
    phone: "+971501234567",
    type: "personal",
    kycStatus: "pending",
    region: "UAE",
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    documentType: "National ID",
    flagged: false,
    riskScore: 12,
  },
  {
    id: "u2",
    name: "Sara Mohammed",
    email: "sara@mail.com",
    phone: "+9647701234567",
    type: "personal",
    kycStatus: "pending",
    region: "Iraq",
    submittedAt: new Date(Date.now() - 172800000).toISOString(),
    documentType: "Passport",
    flagged: false,
    riskScore: 8,
  },
  {
    id: "u3",
    name: "Ali Trading Co.",
    email: "ali@trading.com",
    phone: "+971559876543",
    type: "merchant",
    kycStatus: "under_review",
    region: "UAE",
    submittedAt: new Date(Date.now() - 259200000).toISOString(),
    documentType: "Trade License",
    flagged: true,
    riskScore: 67,
  },
  {
    id: "u4",
    name: "Fatima Khalil",
    email: "fatima@mail.com",
    phone: "+9647801234567",
    type: "personal",
    kycStatus: "approved",
    region: "Iraq",
    submittedAt: new Date(Date.now() - 604800000).toISOString(),
    documentType: "National ID",
    flagged: false,
    riskScore: 3,
  },
  {
    id: "u5",
    name: "Omar Exchange",
    email: "omar@exchange.com",
    phone: "+971507654321",
    type: "agent",
    kycStatus: "approved",
    region: "UAE",
    submittedAt: new Date(Date.now() - 864000000).toISOString(),
    documentType: "Agent License",
    flagged: false,
    riskScore: 15,
  },
  {
    id: "u6",
    name: "Mona Saeed",
    email: "mona@mail.com",
    phone: "+9647901234567",
    type: "personal",
    kycStatus: "rejected",
    region: "Iraq",
    submittedAt: new Date(Date.now() - 432000000).toISOString(),
    documentType: "National ID",
    flagged: true,
    riskScore: 82,
  },
];

const sampleAudit: AuditEntry[] = [
  {
    id: "a1",
    action: "KYC Approved",
    performedBy: "Admin",
    targetUser: "Fatima Khalil",
    timestamp: new Date(Date.now() - 604800000).toISOString(),
    details: "Documents verified successfully",
  },
  {
    id: "a2",
    action: "Account Flagged",
    performedBy: "System",
    targetUser: "Ali Trading Co.",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    details: "High-risk score detected",
  },
  {
    id: "a3",
    action: "KYC Rejected",
    performedBy: "Admin",
    targetUser: "Mona Saeed",
    timestamp: new Date(Date.now() - 432000000).toISOString(),
    details: "Blurry ID document",
  },
];

export const useAdminStore = create<AdminState>((set) => ({
  users: sampleUsers,
  auditLog: sampleAudit,
  filters: { status: "all", type: "all", region: "" },
  stats: {
    totalUsers: sampleUsers.length,
    pendingKYC: sampleUsers.filter((u) => u.kycStatus === "pending").length,
    flagged: sampleUsers.filter((u) => u.flagged).length,
    approved: sampleUsers.filter((u) => u.kycStatus === "approved").length,
  },

  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),

  approveUser: (userId) =>
    set((s) => {
      const users = s.users.map((u) =>
        u.id === userId ? { ...u, kycStatus: "approved" as KYCStatus } : u,
      );
      return {
        users,
        stats: {
          ...s.stats,
          pendingKYC: users.filter((u) => u.kycStatus === "pending").length,
          approved: users.filter((u) => u.kycStatus === "approved").length,
        },
        auditLog: [
          {
            id: `a-${Date.now()}`,
            action: "KYC Approved",
            performedBy: "Admin",
            targetUser: users.find((u) => u.id === userId)?.name ?? "",
            timestamp: new Date().toISOString(),
            details: "Manually approved",
          },
          ...s.auditLog,
        ],
      };
    }),

  rejectUser: (userId) =>
    set((s) => {
      const users = s.users.map((u) =>
        u.id === userId ? { ...u, kycStatus: "rejected" as KYCStatus } : u,
      );
      return {
        users,
        stats: { ...s.stats, pendingKYC: users.filter((u) => u.kycStatus === "pending").length },
        auditLog: [
          {
            id: `a-${Date.now()}`,
            action: "KYC Rejected",
            performedBy: "Admin",
            targetUser: users.find((u) => u.id === userId)?.name ?? "",
            timestamp: new Date().toISOString(),
            details: "Manually rejected",
          },
          ...s.auditLog,
        ],
      };
    }),

  flagUser: (userId) =>
    set((s) => {
      const users = s.users.map((u) => (u.id === userId ? { ...u, flagged: !u.flagged } : u));
      return {
        users,
        stats: { ...s.stats, flagged: users.filter((u) => u.flagged).length },
      };
    }),
}));
