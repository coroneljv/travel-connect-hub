import { useCallback, useSyncExternalStore } from "react";

const STORAGE_PREFIX = "tc_chat_v1";

/* -- Types ------------------------------------------------ */

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

/* -- Empty initial data (no mock conversations) ----------- */

const EMPTY_DATA: ChatData = {
  conversations: [],
  messages: {},
};

/* -- Singleton store (shared across all hook instances) ---- */

const listeners = new Set<() => void>();
let activeRole: ChatRole = "viajante";

function storageKey(): string {
  return `${STORAGE_PREFIX}_${activeRole}`;
}

function loadFromStorage(): ChatData {
  try {
    const raw = localStorage.getItem(storageKey());
    if (raw) return JSON.parse(raw);
  } catch {
    /* corrupt - reset */
  }
  return structuredClone(EMPTY_DATA);
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

/* -- Hook ------------------------------------------------- */

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
          ? { ...c, lastMessageText: `Voce: ${text}`, lastMessageTime: "Agora" }
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
