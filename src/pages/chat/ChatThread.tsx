import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import ChatHeader from "@/components/shared/ChatHeader";
import ChatInput from "@/components/shared/ChatInput";
import MessageBubble from "@/components/shared/MessageBubble";
import EmptyState from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatThreadProps {
  conversationId: string;
}

export default function ChatThread({ conversationId }: ChatThreadProps) {
  const { getConversation, listMessages, sendMessage } = useChatStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = getConversation(conversationId);
  const messages = listMessages(conversationId);

  // Simulate initial loading
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [conversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage(conversationId, text);
    setInput("");
  };

  const handleFileSelect = (file: File) => {
    // TODO: upload para Supabase Storage e enviar como mensagem
    sendMessage(conversationId, `📄 ${file.name}`);
  };

  const handleImageSelect = (file: File) => {
    // TODO: upload para Supabase Storage e enviar como imagem
    sendMessage(conversationId, `📷 ${file.name}`);
  };

  /* Loading skeleton */
  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="flex-1 p-6 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "" : "justify-end"}`}>
              <Skeleton
                className={`h-14 ${i % 2 === 0 ? "w-64" : "w-48"} rounded-2xl`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* Not found */
  if (!conversation) {
    return (
      <div className="flex flex-col h-full bg-white">
        <EmptyState
          title="Conversa não encontrada"
          description="Esta conversa pode ter sido removida"
          actionLabel="Voltar para mensagens"
          actionHref="/chat"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <ChatHeader
        participantName={conversation.participantName}
        participantAvatar={conversation.participantAvatar}
        isOnline={conversation.isOnline}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-tc-chat-bg">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-tc-text-hint">
              Nenhuma mensagem ainda. Envie a primeira!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              text={msg.text}
              isMine={msg.senderId === "me"}
              timestamp={msg.timestamp}
              status={msg.status}
              avatar={
                msg.senderId !== "me"
                  ? conversation.participantAvatar
                  : undefined
              }
              participantName={
                msg.senderId !== "me"
                  ? conversation.participantName
                  : undefined
              }
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onFileSelect={handleFileSelect}
        onImageSelect={handleImageSelect}
      />
    </div>
  );
}
