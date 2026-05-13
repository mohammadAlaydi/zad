import { create } from "zustand";

export type MessageSender = "user" | "bot" | "agent";
export type TicketStatus = "open" | "escalated" | "resolved";

export type ChatMessage = {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  status: TicketStatus;
  messages: ChatMessage[];
  createdAt: string;
  category: string;
};

type SupportState = {
  tickets: SupportTicket[];
  activeTicketId: string | null;
  faqCategories: { key: string; label: string; icon: string }[];
  addTicket: (ticket: SupportTicket) => void;
  addMessage: (ticketId: string, msg: ChatMessage) => void;
  escalateTicket: (ticketId: string) => void;
  resolveTicket: (ticketId: string) => void;
  setActiveTicket: (id: string | null) => void;
};

const defaultFAQs = [
  { key: "transactions", label: "Transactions", icon: "swap-horizontal" },
  { key: "kyc", label: "KYC Issues", icon: "id-card" },
  { key: "cards", label: "Cards & Payments", icon: "card" },
  { key: "account", label: "Account", icon: "person" },
  { key: "transfers", label: "Transfers", icon: "paper-plane" },
  { key: "security", label: "Security", icon: "shield-checkmark" },
];

const botResponses: Record<string, string> = {
  transactions: "I can help with transaction issues. Could you describe the problem? For example: failed transaction, wrong amount, or missing funds.",
  kyc: "For KYC issues, please make sure your ID documents are clear and not expired. If your verification is stuck, I can escalate to our team.",
  cards: "For card issues, I can help with activation, blocking, or payment failures. What do you need help with?",
  account: "I can assist with account settings, profile updates, or closing your account. What would you like to do?",
  transfers: "For transfer issues, I can check the status or help resolve failed transfers. Please share your transfer reference number.",
  security: "Security is our priority. I can help with suspicious activity, password resets, or device management. What concerns you?",
};

export const useSupportStore = create<SupportState>((set) => ({
  tickets: [],
  activeTicketId: null,
  faqCategories: defaultFAQs,

  addTicket: (ticket) => set((s) => ({ tickets: [ticket, ...s.tickets] })),

  addMessage: (ticketId, msg) =>
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === ticketId ? { ...t, messages: [...t.messages, msg] } : t
      ),
    })),

  escalateTicket: (ticketId) =>
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === ticketId ? { ...t, status: "escalated" as TicketStatus } : t
      ),
    })),

  resolveTicket: (ticketId) =>
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === ticketId ? { ...t, status: "resolved" as TicketStatus } : t
      ),
    })),

  setActiveTicket: (id) => set({ activeTicketId: id }),
}));

export function getBotReply(category: string): string {
  return botResponses[category] ?? "I'm here to help! Please describe your issue and I'll do my best to assist you.";
}
