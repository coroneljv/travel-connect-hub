import { useCallback, useSyncExternalStore } from "react";

const STORAGE_PREFIX = "tc_chat_v1";

/* ── Types ──────────────────────────────────────────── */

export interface ChatMessage {
  id: string;
  conversationId: string;
  text: string;
  senderId: string; // "me" | participantId
  timestamp: string; // ISO
  status: "sending" | "sent" | "delivered" | "read";
}

export interface ChatConversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  isOnline: boolean;
  isPinned: boolean;
  unreadCount: number;
  lastMessageText: string;
  lastMessageTime: string;
}

interface ChatData {
  conversations: ChatConversation[];
  messages: Record<string, ChatMessage[]>;
}

export type ChatRole = "viajante" | "anfitriao";

/* ── Mock seed — Viajante ─────────────────────────── */

const INITIAL_DATA_VIAJANTE: ChatData = {
  conversations: [
    {
      id: "conv-eco-lodge",
      participantName: "Eco Lodge Brasil",
      participantAvatar:
        "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=96&h=96&fit=crop",
      isOnline: true,
      isPinned: true,
      unreadCount: 0,
      lastMessageText: "Quando você estaria disponível para começar?",
      lastMessageTime: "10:16",
    },
    {
      id: "conv-urban-nomad",
      participantName: "Urban Nomad Hostel",
      participantAvatar:
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=96&h=96&fit=crop",
      isOnline: true,
      isPinned: true,
      unreadCount: 0,
      lastMessageText: "Você: Muito obrigado pela oportunidade! 🙏",
      lastMessageTime: "09:30",
    },
    {
      id: "conv-beach-resort",
      participantName: "Beach Resort Paradise",
      participantAvatar:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=96&h=96&fit=crop",
      isOnline: false,
      isPinned: false,
      unreadCount: 1,
      lastMessageText: "📄 vaga.resort - (PDF)",
      lastMessageTime: "Ontem",
    },
    {
      id: "conv-carlos",
      participantName: "Carlos Mendes",
      participantAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop",
      isOnline: false,
      isPinned: false,
      unreadCount: 0,
      lastMessageText: "Cara, adorei essa experiência em Portugal!",
      lastMessageTime: "Seg",
    },
    {
      id: "conv-organic-farm",
      participantName: "Organic Farm Toscana",
      participantAvatar:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=96&h=96&fit=crop",
      isOnline: true,
      isPinned: false,
      unreadCount: 0,
      lastMessageText: "Você: Perfeito! Aceito a vaga 🚀",
      lastMessageTime: "Dom",
    },
  ],
  messages: {
    "conv-eco-lodge": [
      {
        id: "msg-v1",
        conversationId: "conv-eco-lodge",
        text: "Incluímos: acomodação privativa, 3 refeições/dia, internet de alta velocidade e transfer aeroporto",
        senderId: "eco-lodge",
        timestamp: "2026-02-19T09:19:00Z",
        status: "read",
      },
      {
        id: "msg-v2",
        conversationId: "conv-eco-lodge",
        text: "Perfeito! Isso está incrível! 🙏",
        senderId: "me",
        timestamp: "2026-02-19T09:25:00Z",
        status: "read",
      },
      {
        id: "msg-v3",
        conversationId: "conv-eco-lodge",
        text: "Meu portfólio está no meu perfil, mas posso enviar mais exemplos se quiser",
        senderId: "me",
        timestamp: "2026-02-19T09:26:00Z",
        status: "read",
      },
      {
        id: "msg-v4",
        conversationId: "conv-eco-lodge",
        text: "Já vi seu portfólio e adoramos! Seu trabalho é exatamente o que procuramos",
        senderId: "eco-lodge",
        timestamp: "2026-02-19T10:15:00Z",
        status: "read",
      },
      {
        id: "msg-v5",
        conversationId: "conv-eco-lodge",
        text: "Quando você estaria disponível para começar?",
        senderId: "eco-lodge",
        timestamp: "2026-02-19T10:16:00Z",
        status: "read",
      },
      {
        id: "msg-v6",
        conversationId: "conv-eco-lodge",
        text: "Posso começar em fevereiro! Preciso de umas 3 semanas para organizar tudo",
        senderId: "me",
        timestamp: "2026-02-19T10:25:00Z",
        status: "read",
      },
    ],
  },
};

/* ── Mock seed — Anfitrião ────────────────────────── */

const INITIAL_DATA_ANFITRIAO: ChatData = {
  conversations: [
    {
      id: "conv-joao-silva",
      participantName: "João Silva",
      participantAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop",
      isOnline: true,
      isPinned: true,
      unreadCount: 0,
      lastMessageText: "Muito obrigado pela oportunidade! Quando posso começar?",
      lastMessageTime: "10:15",
    },
    {
      id: "conv-emma-thompson",
      participantName: "Emma Thompson",
      participantAvatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop",
      isOnline: true,
      isPinned: true,
      unreadCount: 0,
      lastMessageText: "Você: Confirmo sua chegada no dia 15/03! ✅",
      lastMessageTime: "09:40",
    },
    {
      id: "conv-lucas-oliveira",
      participantName: "Lucas Oliveira",
      participantAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop",
      isOnline: false,
      isPinned: false,
      unreadCount: 1,
      lastMessageText: "📄 Portfólio de fotografia (PDF)",
      lastMessageTime: "Ontem",
    },
    {
      id: "conv-sophie-dubois",
      participantName: "Sophie Dubois",
      participantAvatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop",
      isOnline: false,
      isPinned: false,
      unreadCount: 0,
      lastMessageText: "Cheguei bem! A pousada é incrível 😍",
      lastMessageTime: "Seg",
    },
    {
      id: "conv-carlos-mendes",
      participantName: "Carlos Mendes",
      participantAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop",
      isOnline: true,
      isPinned: false,
      unreadCount: 0,
      lastMessageText: "Tenho experiência de 3 anos em hospitalidade",
      lastMessageTime: "Seg",
    },
    {
      id: "conv-maria-garcia",
      participantName: "Maria Garcia",
      participantAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&fit=crop",
      isOnline: false,
      isPinned: false,
      unreadCount: 0,
      lastMessageText: "📷 Enviou uma foto",
      lastMessageTime: "Dom",
    },
  ],
  messages: {
    "conv-joao-silva": [
      {
        id: "msg-a1",
        conversationId: "conv-joao-silva",
        text: "Incluímos: acomodação privativa, 3 refeições/dia, internet de alta velocidade e transfer aeroporto",
        senderId: "me",
        timestamp: "2026-02-19T09:16:00Z",
        status: "read",
      },
      {
        id: "msg-a2",
        conversationId: "conv-joao-silva",
        text: "Perfeito! Isso está incrível! 🙏",
        senderId: "joao-silva",
        timestamp: "2026-02-19T09:18:00Z",
        status: "read",
      },
      {
        id: "msg-a3",
        conversationId: "conv-joao-silva",
        text: "Meu portfólio está no meu perfil, mas posso enviar mais exemplos se quiser",
        senderId: "joao-silva",
        timestamp: "2026-02-19T09:19:00Z",
        status: "read",
      },
      {
        id: "msg-a4",
        conversationId: "conv-joao-silva",
        text: "Já vi seu portfólio e adoramos! Seu trabalho é exatamente o que procuramos",
        senderId: "me",
        timestamp: "2026-02-19T09:25:00Z",
        status: "read",
      },
      {
        id: "msg-a5",
        conversationId: "conv-joao-silva",
        text: "Quando você estaria disponível para começar?",
        senderId: "me",
        timestamp: "2026-02-19T09:26:00Z",
        status: "read",
      },
      {
        id: "msg-a6",
        conversationId: "conv-joao-silva",
        text: "Posso começar em fevereiro! Preciso de umas 3 semanas para organizar tudo",
        senderId: "joao-silva",
        timestamp: "2026-02-19T10:15:00Z",
        status: "read",
      },
    ],
  },
};

/* ── Singleton store (shared across all hook instances) ── */

const listeners = new Set<() => void>();
let activeRole: ChatRole = "viajante";

function storageKey(): string {
  return `${STORAGE_PREFIX}_${activeRole}`;
}

function initialDataForRole(role: ChatRole): ChatData {
  return role === "anfitriao"
    ? structuredClone(INITIAL_DATA_ANFITRIAO)
    : structuredClone(INITIAL_DATA_VIAJANTE);
}

function loadFromStorage(): ChatData {
  try {
    const raw = localStorage.getItem(storageKey());
    if (raw) return JSON.parse(raw);
  } catch {
    /* corrupt — reset */
  }
  return initialDataForRole(activeRole);
}

let store: ChatData = loadFromStorage();

function getSnapshot(): ChatData {
  return store;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function updateStore(updater: (prev: ChatData) => ChatData) {
  store = updater(store);
  localStorage.setItem(storageKey(), JSON.stringify(store));
  listeners.forEach((fn) => fn());
}

/** Switch store to a different role (reloads data from localStorage / seed). */
export function setActiveRole(role: ChatRole) {
  if (activeRole === role) return;
  activeRole = role;
  store = loadFromStorage();
  listeners.forEach((fn) => fn());
}

/* ── Hook ───────────────────────────────────────────── */

export function useChatStore() {
  const data = useSyncExternalStore(subscribe, getSnapshot);

  const listConversations = useCallback(() => data.conversations, [data.conversations]);

  const getConversation = useCallback(
    (id: string) => data.conversations.find((c) => c.id === id) ?? null,
    [data.conversations],
  );

  const listMessages = useCallback(
    (id: string): ChatMessage[] => data.messages[id] ?? [],
    [data.messages],
  );

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const msgId = `msg-${Date.now()}`;
    const msg: ChatMessage = {
      id: msgId,
      conversationId,
      text,
      senderId: "me",
      timestamp: new Date().toISOString(),
      status: "sending",
    };

    updateStore((prev) => {
      const msgs = [...(prev.messages[conversationId] ?? []), msg];
      const convs = prev.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessageText: `Você: ${text}`, lastMessageTime: "Agora" }
          : c,
      );
      return { conversations: convs, messages: { ...prev.messages, [conversationId]: msgs } };
    });

    // Simulate delivery after 800 ms
    setTimeout(() => {
      updateStore((prev) => {
        const msgs = (prev.messages[conversationId] ?? []).map((m) =>
          m.id === msgId ? { ...m, status: "delivered" as const } : m,
        );
        return { ...prev, messages: { ...prev.messages, [conversationId]: msgs } };
      });
    }, 800);
  }, []);

  // TODO: substituir por mutation real no Supabase
  const createConversationFromApplication = useCallback(
    (applicationId: string, otherProfile: { name: string; avatar: string }) => {
      const convId = `conv-app-${applicationId}`;
      updateStore((prev) => {
        if (prev.conversations.some((c) => c.id === convId)) return prev;
        const newConv: ChatConversation = {
          id: convId,
          participantName: otherProfile.name,
          participantAvatar: otherProfile.avatar,
          isOnline: false,
          isPinned: false,
          unreadCount: 0,
          lastMessageText: "Candidatura aceita! Inicie a conversa.",
          lastMessageTime: "Agora",
        };
        return { ...prev, conversations: [newConv, ...prev.conversations] };
      });
      return convId;
    },
    [],
  );

  return {
    conversations: data.conversations,
    listConversations,
    getConversation,
    listMessages,
    sendMessage,
    createConversationFromApplication,
  };
}
