"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, CheckCheck } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { getInitials, getAvatarColor } from "@/utils/ticketHelpers";
import { getStoredToken, getStoredUser, getUserFromToken, isDemoMode } from "@/lib/auth";
import { apiOrigin } from "@/lib/http/api-url";
import { getTicketChatMessages, PostchatTicket } from "@/lib/http/tickets/chat-ticket";

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: "CLIENT" | "AGENT" | "ADMIN" | "SYSTEM";
  text: string;
  timestamp: string;
  isCurrentUser: boolean;
}

interface TicketChatProps {
  ticketId: string;
  className?: string;
}

type TicketChatSocket = Socket;

function messageList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const data = payload as Record<string, unknown>;
  for (const key of ["data", "messages", "items"]) {
    if (Array.isArray(data[key])) return data[key] as unknown[];
  }
  return [];
}

function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  for (const item of incoming) byId.set(item.id, item);
  for (const item of current) {
    const existing = byId.get(item.id);
    if (!existing) byId.set(item.id, item);
    else if (item.isCurrentUser) byId.set(item.id, { ...existing, isCurrentUser: true });
  }
  return [...byId.values()];
}

function toChatMessage(payload: unknown, currentUser?: { id: string; email?: string; role?: string | null } | null): ChatMessage | null {
  if (!payload || typeof payload !== "object") return null;
  const outer = payload as Record<string, unknown>;
  const data = outer.message && typeof outer.message === "object"
    ? outer.message as Record<string, unknown>
    : outer;
  const sender = (data.sender ?? data.user ?? data.author ?? data.createdBy ?? data.created_by) as Record<string, unknown> | undefined;
  const text = [data.text, data.content, typeof data.message === "string" ? data.message : undefined]
    .find((value): value is string => typeof value === "string" && value.trim().length > 0);
  if (!text) return null;

  const senderId = [
    data.senderId, data.sender_id, data.userId, data.user_id,
    data.authorId, data.author_id, data.createdById, data.created_by_id,
    data.createdBy, data.created_by,
    sender?.id, sender?.userId, sender?.user_id, sender?.senderId, sender?.sender_id,
  ].find((value): value is string | number => typeof value === "string" || typeof value === "number");
  const senderName = [data.senderName, sender?.name, sender?.username, data.authorName]
    .find((value): value is string => typeof value === "string") ?? "Participante";
  const roleValue = data.senderRole ?? data.sender_role ?? data.role ?? sender?.role;
  const senderRole = ["CLIENT", "AGENT", "ADMIN", "SYSTEM"].includes(String(roleValue))
    ? roleValue as ChatMessage["senderRole"]
    : "AGENT";
  const senderEmail = [data.senderEmail, data.sender_email, data.userEmail, data.user_email, sender?.email].find(
    (email): email is string => typeof email === "string",
  );
  const hasSenderIdentity = senderId !== undefined || senderEmail !== undefined;
  const matchesCurrentUser = Boolean(currentUser && (
    (senderId !== undefined && String(senderId) === String(currentUser.id)) ||
    (senderEmail !== undefined && currentUser.email !== undefined && senderEmail.toLowerCase() === currentUser.email.toLowerCase())
  ));
  const rawTimestamp = data.timestamp ?? data.createdAt ?? data.created_at;
  const parsedDate = typeof rawTimestamp === "string" ? new Date(rawTimestamp) : new Date();
  const timestamp = Number.isNaN(parsedDate.getTime())
    ? "--:--"
    : `${String(parsedDate.getHours()).padStart(2, "0")}:${String(parsedDate.getMinutes()).padStart(2, "0")}`;

  return {
    id: String(data.id ?? `${senderId ?? "message"}-${rawTimestamp ?? Date.now()}-${text.slice(0, 12)}`),
    senderName,
    senderRole,
    text,
    timestamp,
    isCurrentUser: data.isCurrentUser === true || data.is_current_user === true ||
      data.isMine === true || data.is_mine === true || matchesCurrentUser,
  };
}

/** Avatar circle with initials and a name-based colour. */
function Avatar({ name }: { name: string }) {
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);
  
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold uppercase tracking-wide text-white ${colorClass}`}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

export default function TicketChat({ ticketId, className = "" }: TicketChatProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<TicketChatSocket | null>(null);

  useEffect(() => {
    setMessages([]);
    if (isDemoMode()) return;

    const controller = new AbortController();
    getTicketChatMessages<unknown>(ticketId, controller.signal)
      .then((payload) => {
        const currentUser = getStoredUser() ?? getUserFromToken();
        const rawMessages = messageList(payload);
        const loaded = rawMessages
          .map((item) => toChatMessage(item, currentUser))
          .filter((item): item is ChatMessage => item !== null);
        setMessages((current) => mergeMessages(current, loaded));
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setSendError(error instanceof Error ? error.message : "Não foi possível carregar as mensagens.");
      });

    return () => controller.abort();
  }, [ticketId]);

  useEffect(() => {
    setSendError(null);
    if (isDemoMode()) {
      setSendError("O chat em tempo real não está disponível no modo demonstração.");
      return;
    }

    const token = getStoredToken();
    if (!token) {
      setSendError("Sua sessão expirou. Faça login novamente.");
      return;
    }

    let socket: TicketChatSocket;
    try {
      socket = io(`${apiOrigin()}/ticket-chat`, { auth: { token } });
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Não foi possível conectar ao chat.");
      return;
    }
    socketRef.current = socket;

    const joinTicket = () => socket.emit("joinTicket", { ticketId });
    const onJoined = (payload: { ticketId?: string }) => {
      if (payload?.ticketId === ticketId) setSendError(null);
    };
    const onNewMessage = (payload: unknown) => {
      const message = toChatMessage(payload, getStoredUser() ?? getUserFromToken());
      if (message) setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
    };
    const onConnectError = (error: Error) => {
      setSendError(error.message || "Não foi possível conectar ao chat.");
    };

    socket.on("connect", joinTicket);
    socket.on("joinedTicket", onJoined);
    socket.on("newMessage", onNewMessage);
    socket.on("connect_error", onConnectError);
    if (socket.connected) joinTicket();

    return () => {
      socket.off("connect", joinTicket);
      socket.off("joinedTicket", onJoined);
      socket.off("newMessage", onNewMessage);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /** Auto-resize textarea up to 5 lines. */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = 20; // px — matches text-sm leading-relaxed
    const maxHeight = lineHeight * 5 + 16; // 5 lines + padding
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [inputMessage]);

  const handleSendMessage = async () => {
    const text = inputMessage.trim();
    if (!text || sending) return;
    if (text.length > 2000) {
      setSendError("A mensagem pode ter no máximo 2.000 caracteres.");
      return;
    }

    setSending(true);
    setSendError(null);
    setInputMessage("");

    try {
      const payload = await PostchatTicket<unknown>(ticketId, text);
      const message = toChatMessage(payload, getStoredUser() ?? getUserFromToken());
      if (!message) {
        setInputMessage(text);
        setSendError("A mensagem foi enviada, mas a resposta da API não pôde ser exibida.");
        return;
      }

      const mine = { ...message, isCurrentUser: true };
      setMessages((current) => (
        current.some((item) => item.id === mine.id)
          ? current.map((item) => (item.id === mine.id ? mine : item))
          : [...current, mine]
      ));
    } catch (error) {
      setInputMessage(text);
      setSendError(error instanceof Error ? error.message : "Não foi possível enviar a mensagem.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const hasText = inputMessage.trim().length > 0;

  return (
    <div
      className={`flex h-full flex-col bg-transparent ${className}`}
    >
      {/* ── Minimal header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--ch-muted)]">
          Conversa
        </span>
        <span className="rounded-full bg-[var(--ch-tint)] px-2 py-0.5 text-[11px] font-medium text-[var(--ch-action)]">
            {messages.filter((m) => m.senderRole !== "SYSTEM").length} mensagens
        </span>
      </div>

      {/* ── Message list ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scroll-smooth px-4 py-3">
        {/* Start-of-conversation pill */}
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-[var(--ch-line)]" />
          <span className="rounded-full bg-[var(--ch-line-soft)] px-3 py-1 text-[11px] font-medium text-[var(--ch-muted)]">
            Início do atendimento
          </span>
          <span className="h-px flex-1 bg-[var(--ch-line)]" />
        </div>

        {/* Messages */}
        <div className="space-y-3">
          {messages.map((msg) => {
            /* System events — inline, centered */
            if (msg.senderRole === "SYSTEM") {
              return (
                <div
                  key={msg.id}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-3 py-1"
                >
                  <span className="h-px flex-1 bg-[var(--ch-line-soft)]" />
                  <span className="rounded-full bg-[var(--ch-tint)] px-3 py-1 text-[11px] text-[var(--ch-muted)]">
                    {msg.text}
                  </span>
                  <span className="h-px flex-1 bg-[var(--ch-line-soft)]" />
                </div>
              );
            }

            /* Received messages */
            if (!msg.isCurrentUser) {
              return (
                <div
                  key={msg.id}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-start gap-2.5"
                >
                  <Avatar name={msg.senderName} />

                  <div className="flex max-w-[72%] flex-col items-start">
                    <span className="mb-1 ml-1 text-[11px] font-semibold text-[var(--ch-muted)]">
                      {msg.senderName}
                    </span>
                    <div className="group rounded-2xl rounded-tl-sm bg-[var(--ch-surface-raised)] px-4 py-2.5 text-sm leading-relaxed text-[var(--ch-ink)] transition-colors hover:brightness-[0.97]">
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <div className="mt-1.5 flex items-center justify-end">
                        <span className="text-[10px] text-[var(--ch-muted)]">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            /* Sent messages */
            return (
              <div
                key={msg.id}
                className="animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-end justify-end w-full"
              >
                <div className="flex max-w-[72%] flex-col items-end">
                  <div className="group rounded-2xl rounded-tr-sm bg-[var(--ch-action)] px-4 py-2.5 text-sm leading-relaxed text-[var(--ch-on-action)] transition-opacity hover:opacity-95">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div className="mt-1.5 flex items-center justify-end gap-1">
                      <span className="text-[10px] opacity-70">
                        {msg.timestamp}
                      </span>
                      <CheckCheck className="h-3 w-3 opacity-70" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {sendError && (
          <p role="alert" className="mt-3 text-sm text-red-600">{sendError}</p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Footer / input area ────────────────────────────────── */}
      <div className="border-t border-[var(--ch-line)] bg-[var(--ch-surface)] p-3">
        {/* Input wrapper */}
        <div className="flex items-end gap-2 rounded-xl border border-[var(--ch-line)] bg-[var(--ch-bg)] px-3 py-2 transition focus-within:border-[var(--ch-action)] focus-within:ring-2 focus-within:ring-[var(--ch-action)]/20">
          {/* Paperclip */}
          <button
            type="button"
            title="Anexar arquivo"
            className="mb-0.5 shrink-0 rounded-md p-1 text-[var(--ch-muted)] transition hover:bg-[var(--ch-tint)] hover:text-[var(--ch-action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ch-focus)]"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={2000}
            placeholder="Digite uma mensagem…"
            className="max-h-[120px] flex-1 resize-none overflow-y-auto bg-transparent py-1 text-sm leading-relaxed text-[var(--ch-ink)] placeholder:text-[var(--ch-muted)] focus:outline-none"
          />

          {/* Send button */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!hasText || sending}
            title="Enviar mensagem"
            className={`mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ch-focus)] ${
              hasText
                ? "scale-95 cursor-pointer bg-[var(--ch-action)] text-[var(--ch-on-action)] hover:scale-100 hover:bg-[var(--ch-action-hover)]"
                : "cursor-not-allowed bg-[var(--ch-line)] text-[var(--ch-muted)] opacity-50"
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Hint */}
        <p className="mt-1.5 px-1 text-[11px] text-[var(--ch-muted)]">
          <kbd className="rounded bg-[var(--ch-line-soft)] px-1 py-0.5 font-mono text-[10px]">
            Enter
          </kbd>{" "}
          para enviar &middot;{" "}
          <kbd className="rounded bg-[var(--ch-line-soft)] px-1 py-0.5 font-mono text-[10px]">
            Shift+Enter
          </kbd>{" "}
          para nova linha
        </p>
      </div>
    </div>
  );
}
